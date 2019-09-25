import {Popup, PopupData, PopupDisplayTypes} from "../models/popups/Popup";
let electron = window.require('electron');

export const remote = electron.remote;
export const ipcRenderer = electron.ipcRenderer;
const {clipboard, shell} = electron;
const {reloader, Transport, Wallet, NotificationService} = remote.getGlobal('appShared');

import ScatterCore from "@walletpack/core";
import StorageService from "../services/electron/StorageService";
import {store} from "../store/store";
import WindowService from "../services/electron/WindowService";
import ExternalWallet from "@walletpack/core/models/hardware/ExternalWallet";

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

const proof = new proover();

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

ipcRenderer.on('error', (e, x) => console.log(x));
ipcRenderer.on('console', (e, x) => console.log('Main process console: ', x));

export default class ElectronHelpers {

	static initializeCore(){


	}

	static reload(){
		Wallet.reloading();
		reloader();
	}

    static copy(txt){
        clipboard.writeText(txt);
    }

    static openLinkInBrowser(link, filepath = false){
		console.log('link', link, filepath);
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