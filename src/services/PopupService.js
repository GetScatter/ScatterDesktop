import {store} from '../store/store'
import * as Actions from '../store/constants'
import WindowService from '../services/WindowService';
import {PopupDisplayTypes, Popup} from '../models/popups/Popup';
import {RUNNING_TESTS, SHOW_POPUPS_AS_CONSOLE} from "../util/TestingHelper";
import AppsService from "./AppsService";

let popouts = [];

export default class PopupService {

    static remove(popup){
        store.dispatch(Actions.RELEASE_POPUP, popup);
    }

    static push(popup){
        // Allows showing popups as a console log for unit testing.
        if(RUNNING_TESTS && SHOW_POPUPS_AS_CONSOLE) return console.log(popup);

        if(store.state.popups.find(x => JSON.stringify(x.data) === JSON.stringify(popup.data)))
            return false;

        if(popup.displayType === PopupDisplayTypes.POP_OUT)
            return this.openPopOut(popup);

        store.dispatch(Actions.PUSH_POPUP, popup);

        if(popup.displayType === PopupDisplayTypes.SNACKBAR)
            setTimeout(() => store.dispatch(Actions.RELEASE_POPUP, popup),
                popup.data.props.timeout);
    }

    static openPopOut(popup){
        let responded = false;
        const scatter = store.state.scatter;

        const respond = result => {
            popouts = popouts.filter(x => x.id !== popup.id);
            popup.data.callback(Object.assign(popup, {result}));
        };

        // Rate limiting: One open pop out at a time per origin.
        if(popouts.find(x => x.data.props.payload.origin === popup.data.props.payload.origin))
            return false;

	    popup.data.props.appData = AppsService.getAppData(popup.data.props.payload.origin);

        popouts.push(popup);

	    const {width, height} = popup.dimensions();
        WindowService.openPopOut(
            readyWindow => WindowService.sendAndWait(readyWindow.id, 'popup', {scatter, popup, balances:store.state.balances}).then(result => {
                responded = true;
                respond(result);
            }),
            closedWithoutAction => { if(!responded) respond(null); },
            width, height,
	        popup.internal
        );
    }

    static promptGuard(prompt, callback){
        if(RUNNING_TESTS) return callback(true);

        prompt.data.callback = callback;
        this.push(prompt);
    }

}
