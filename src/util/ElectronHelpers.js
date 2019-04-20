import {MOCK_ELECTRON, RUNNING_TESTS} from "./TestingHelper";

import {Popup} from "../models/popups/Popup";
import ecc from 'eosjs-ecc';

let electron;
electron = RUNNING_TESTS ? null : window.require('electron');
if(!electron) electron = MOCK_ELECTRON;

export const remote = electron.remote;
export const ipcRenderer = electron.ipcRenderer;
const {clipboard, shell} = electron;

import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";
import IdGenerator from "./IdGenerator";

let popupService;
const PopupService = () => {
    if(!popupService) popupService = require("../services/PopupService").default;
    return popupService;
}


class proover {
    constructor(){ this.regen(); }

    async regen(){
	    const key = await ecc.PrivateKey.fromSeed(IdGenerator.text(64));
	    this.wif = key.toWif();
	    ipcFaF('key', key.toPublic().toString());
    }

    sign(data){ return ecc.sign(data, this.wif); }
}

const proof = new proover();

export const ipcFaF = (key, data) => ipcRenderer.send(key, data);
export const ipcAsync = (key, data) => {
    return new Promise(resolve => {
        ipcRenderer.removeAllListeners(key);
	    ipcRenderer.once(key, (event, arg) => resolve(arg));
	    ipcRenderer.send(key, {data:data ? data : key, sig:proof.sign(key)})
    })
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