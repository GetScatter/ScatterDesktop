import {store} from '../store/store'
import * as Actions from '../store/constants'
const {remote, BrowserWindow, ipcMain, ipcRenderer} = window.require('electron');
import WindowService from '../services/WindowService';
import {PopupDisplayTypes, Popup} from '../models/popups/Popup';

let popouts = [];

export default class PopupService {

    static remove(popup){
        store.dispatch(Actions.RELEASE_POPUP, popup);
    }

    static push(popup){
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
        const {width, height} = popup.dimensions();

        const respond = result => {
            popouts = popouts.filter(x => x.id !== popup.id);
            popup.data.callback(Object.assign(popup, {result}));
        };

        // Rate limiting: One open pop out at a time per origin.
        if(popouts.find(x => x.data.props.payload.origin === popup.data.props.payload.origin))
            return false;

        popouts.push(popup);


        WindowService.openPopOut(
            readyWindow => WindowService.sendAndWait(readyWindow.id, 'popup', {scatter, popup}).then(result => {
                responded = true;
                respond(result);
            }),
            closedWithoutAction => { if(!responded) respond(null); },
            width, height
        );
    }

    static promptGuard(prompt, callback){
        prompt.data.callback = callback;
        this.push(prompt);
    }

}