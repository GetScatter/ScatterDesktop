import {Popup} from "scatter-core/models/popups/Popup";
import {localizedState} from "scatter-core/localization/locales";
import LANG_KEYS from "scatter-core/localization/keys";
import ScatterCore from "scatter-core";
import {store} from "../store/store";
import StorageService from "../services/web/StorageService";
import WindowService from "../services/web/WindowService";
import SocketService from "../services/web/SocketService";
const pjson = require('../../package');

let popupService;
const PopupService = () => {
	if(!popupService) popupService = require("scatter-core/services/utility/PopupService").default;
	return popupService;
}

export const ipcFaF = (key, data) => {
	return window.localStorage.setItem(key, data);
}

export const ipcAsync = (key, data) => {
	window.localStorage.getItem(key);
}

export default class WebHelpers {

	static initializeCore(){
		return ScatterCore.initialize(
			store,
			StorageService,
			{
				get:() => window.localStorage.getItem('seed'),
				set:(seed) => window.localStorage.setItem('seed', seed),
				clear:() => window.localStorage.setItem('seed', null),
			},
			{
				getVersion:WebHelpers.getVersion,
				pushNotification:WebHelpers.pushNotificationMethod(),
			},
			WindowService.openPopOut,
			null,
			SocketService
		)
	}

	static getVersion(){
		return pjson.version;
	}

	static pushNotificationMethod(){
		return () => {
			console.log('notification')
		}
	}

	static reload(){
		location.reload();
	}

	static copy(txt){
		console.log('copied', txt);
		// clipboard.writeText(txt);
		PopupService().push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.CopiedToClipboard), 'check'))
	}

	static openLinkInBrowser(link, filepath = false){
		window.open(link, '_blank', 'noopener=yes')
	}

	static getDefaultPath(){
		return '';
	}

}