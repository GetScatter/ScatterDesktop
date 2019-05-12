import * as Actions from '../../store/constants'
import WindowService from './WindowService';
import {PopupDisplayTypes, Popup} from '../../models/popups/Popup';
import {RUNNING_TESTS, SHOW_POPUPS_AS_CONSOLE} from "../../util/TestingHelper";
import AppsService from "../apps/AppsService";
import StoreService from "./StoreService";
import Recurring from "../../models/Recurring";

let popouts = [];

export default class PopupService {

    static remove(popup){
	    StoreService.get().dispatch(Actions.RELEASE_POPUP, popup);
    }

    static push(popup){
        // Allows showing popups as a console log for unit testing.
        if(RUNNING_TESTS && SHOW_POPUPS_AS_CONSOLE) return console.log(popup);

        if(StoreService.get().state.popups.find(x => JSON.stringify(x.data) === JSON.stringify(popup.data)))
            return false;

        if(popup.displayType === PopupDisplayTypes.POP_OUT)
            return this.openPopOut(popup);

        StoreService.get().dispatch(Actions.PUSH_POPUP, popup);

        if(popup.displayType === PopupDisplayTypes.SNACKBAR)
            setTimeout(() => StoreService.get().dispatch(Actions.RELEASE_POPUP, popup),
                popup.data.props.timeout);
    }

    static openPopOut(popup){
        let responded = false;

        const scatter = StoreService.get().state.scatter.clone();
        scatter.keychain.keypairs.map(keypair => delete keypair.privateKey);
        scatter.keychain.identities.map(identity => delete identity.privateKey);
        scatter.recurring = Recurring.placeholder();
        scatter.contacts = [];

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
            readyWindow => WindowService.sendAndWait(readyWindow.id, 'popup', {scatter, popup, balances:{}}).then(result => {
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
