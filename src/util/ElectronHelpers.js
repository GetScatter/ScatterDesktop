import {MOCK_ELECTRON, RUNNING_TESTS} from "./TestingHelper";

import {Popup} from "../models/popups/Popup";

let electron;
electron = RUNNING_TESTS ? null : window.require('electron');
if(!electron) electron = MOCK_ELECTRON;

export const remote = electron.remote;
export const ipcRenderer = electron.ipcRenderer;
const {clipboard, shell} = electron;

import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";

let popupService;
const PopupService = () => {
    if(!popupService) popupService = require("../services/PopupService").default;
    return popupService;
}

export default class ElectronHelpers {

    static copy(txt){
        clipboard.writeText(txt);
	    PopupService().push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.CopiedToClipboard), 'check'))
    }

    static openLinkInBrowser(link){
        shell.openExternal(link);
    }

    static bindContextMenu(){
        const InputMenu = remote.Menu.buildFromTemplate([{
            label: 'Cut',
            role: 'cut',
        }, {
            label: 'Copy',
            role: 'copy',
        }, {
            label: 'Paste',
            role: 'paste',
        }, {
            type: 'separator',
        }, {
            label: 'Select all',
            role: 'selectall',
        },
        ]);

        document.body.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let node = e.target;

            while (node) {
                if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
                    InputMenu.popup(remote.getCurrentWindow());
                    break;
                }
                node = node.parentNode;
            }
        });
    }

}