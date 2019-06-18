import {MOCK_ELECTRON, RUNNING_TESTS} from "./TestingHelper";

import {Popup} from "../models/popups/Popup";


let electron;
electron = RUNNING_TESTS ? null : window.require('electron');
if(!electron) electron = MOCK_ELECTRON;

export const remote = electron.remote;
export const ipcRenderer = electron.ipcRenderer;
const {clipboard, shell} = electron;
const {reloader} = remote.getGlobal('appShared');

import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";

let popupService;
const PopupService = () => {
    if(!popupService) popupService = require("../services/utility/PopupService").default;
    return popupService;
}


const ecc = require('eosjs-ecc');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');

const signable = data => ecc.sha256(data).substr(0,32);
const generateKey = () => {
	let privKey
	do { privKey = randomBytes(32) } while (!secp256k1.privateKeyVerify(privKey));
	const pubKey = secp256k1.publicKeyCreate(privKey).toString('base64')
    return [privKey, pubKey];
}

export const ipcFaF = (key, data) => ipcRenderer.send(key, data);
class proover {
    constructor(){ this.regen(); }

    async regen(){
	    const [priv, pub] = generateKey();
        this.wif = priv;
	    ipcFaF('key', pub);
    }

    sign(data){
	    return secp256k1.sign(Buffer.from(signable(data)), this.wif).signature.toString('base64');
    }
}

const proof = RUNNING_TESTS ? null : new proover();

export const ipcAsync = (key, data) => {
    return new Promise(resolve => {
		const listener = (event, arg) => {
			resolve(arg);
			ipcRenderer.removeListener(key, listener);
		}

	    ipcRenderer.once(key, listener);
	    ipcRenderer.send(key, {data:signable(data ? data : key), sig:proof.sign(key)})
    })
}

export default class ElectronHelpers {

	static reload(){
		reloader();
	}

    static copy(txt){
        clipboard.writeText(txt);
	    PopupService().push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.CopiedToClipboard), 'check'))
    }

    static openLinkInBrowser(link, filepath = false){
    	if(filepath) shell.openItem(link);
        else {
            if(link.indexOf('https://') === 0 || link.indexOf('http://') === 0) {
	            shell.openExternal(link);
            }
	    }
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

    static getDefaultPath(){
	    return electron.remote.app.getPath('userData');
    }

}