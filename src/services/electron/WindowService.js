import {Popup, PopupData, PopupDisplayTypes} from "../../models/popups/Popup";
let electron = window.require('electron');
const {remote, ipcRenderer} = electron;

const path = window.require("path");
const url = window.require("url");

const LowLevelWindowService = remote.getGlobal('appShared').LowLevelWindowService;

import AppsService from "@walletpack/core/services/apps/AppsService";


let popouts = [];


ipcRenderer.on('popoutResponse', (event, data) => {
	if(!data) return;
	const result = data.data;
	if(!result) return;

	console.log('RESULT', result);

	const popout = popouts.find(x => x.id === result.original.id);
	if(popout){
		popouts = popouts.filter(x => x.id !== result.original.id);
		popout.resolver(result.result);
		remote.BrowserWindow.fromId(data.windowId).close();
	} else {
		console.error('no popout found')
	}

});

export default class WindowService {

	static openTools(){
		remote.getCurrentWindow().openDevTools();
	}

	static openPopOut(popup){
		return new Promise((resolve) => {
			popup = Popup.fromJson(popup);

			let responded = false;
			const respond = result => {
				responded = true;
				popouts = popouts.filter(x => x.id !== popup.id);
				resolve(Object.assign(popup, {result}));
			};

			popup.resolver = respond;

			// Rate limiting: One open pop out at a time per origin.
			if(popouts.find(x => x.data.props.payload.origin === popup.data.props.payload.origin)){
				return resolve(false);
			}


			// TODO: This should now be done on the web app
			popup.data.props.appData = AppsService.getAppData(popup.data.props.payload.origin);

			popouts.push(popup);

			const {width, height} = popup.dimensions();
			const win = LowLevelWindowService.openPopOut(
				popup,
				() /* closed without action */ => { if(!responded) respond(null); },
				width, height,
				popup.internal
			);

		})

	}
}