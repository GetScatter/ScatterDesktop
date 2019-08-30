
const electron = window.require('electron');
const {ipcRenderer} = electron;

import WebViewService from "../services/electron/WebViewService";
import Scatter from "@walletpack/core/models/Scatter";
import * as Actions from "@walletpack/core/store/constants";
import {store} from "../store/store";


const services = {
	FileService:require('../services/electron/FileService'),
	SocketService:require('../services/electron/SocketService').default,
	StorageService:require('../services/electron/StorageService').default,
	WindowService:require('../services/electron/WindowService').default,
}

export default class WalletTalk {

	static setup(){
		ipcRenderer.on('popoutResponse', async (e, payload) => {
			console.log('popoutresponse', payload);
			WebViewService.get().send('scatter', {data:payload.result, id:payload.original.id})
		});

		ipcRenderer.on('scatter', async (e, payload) => {
			const {service, method, data, id, isPopOut} = payload;
			console.log('ipc', service, method);

			if(![
				'FileService',
				'SocketService',
				'StorageService',
				'WindowService',
			].includes(service)) return; // console.log('Propagated from embed: ', service, method, data, id);

			if(service === 'StorageService'){
				// Handled in main process
				if(method === 'getScatter' || method === 'setScatter') return;
			}

			const result = await services[service][method](...data);
			WebViewService.get().send('scatter', {data:result, id})

		});

		// Logs only
		ipcRenderer.on('scatterLog', async (e, payload) => {
			console.log('ipc logs', payload);
		});
	}

}