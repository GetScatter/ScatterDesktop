import PopupService from "../utility/PopupService";
import {Popup} from "../../models/popups/Popup";
const {Wallet} = window.require('electron').remote.getGlobal('appShared');

export default class SecurePasswords {

	static async verifyPassword(){
		return new Promise(async resolve => {
			PopupService.push(Popup.verifyPassword(async password => {
				if(!password) return resolve(false);
				resolve(await Wallet.verifyPassword(password))
			}, true));
		})
	}

	static async changePassword(){
		return new Promise(async resolve => {
			PopupService.push(Popup.verifyPassword(async password => {
				if(!password) return resolve(false);
				resolve(await Wallet.changePassword(password))
			}, true));
		})
	}

	static exportPrivateKey(keypair){
		PopupService.push(Popup.exportPrivateKey(keypair));
		return true;
	}
}