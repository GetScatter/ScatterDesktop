console.log(require('../../util/ElectronHelpers'));

import {ipcRenderer, remote} from '../../util/ElectronHelpers';
const path = window.require("path");
const url = window.require("url");

console.log(remote);
const LowLevelWindowService = remote.getGlobal('appShared').LowLevelWindowService;

import WindowMessage from '../../models/popups/WindowMessage';
import StoreService from "@walletpack/core/services/utility/StoreService";
import AppsService from "@walletpack/core/services/apps/AppsService";
import Recurring from '../../models/Recurring'
import Scatter from "@walletpack/core/models/Scatter";

let pendingMessages = [];
const getPending = msg => pendingMessages.find(x => x.id === msg.id);
const addPending = msg => pendingMessages.push(msg);
const removePending = msg => pendingMessages = pendingMessages.filter(x => x.id !== msg.id);

const handlers = [];

ipcRenderer.on('result', (event, result) => {
	if(!result) return;

	const pending = getPending(result.original);
	if(pending) pending.resolver(result.result);

	const rWin = remote.BrowserWindow.fromId(result.windowId);
	rWin.webContents.send('ack', true);

});

let popouts = [];

const sendMessage = (windowId, type, data, resolver = null) => {
	const message = new WindowMessage(type, data, remote.getCurrentWindow().id, resolver);
	if(resolver) addPending(message);

	remote.BrowserWindow.fromId(windowId).webContents.send(type, message);
};

export default class WindowService {

	static openTools(){
		remote.getCurrentWindow().openDevTools();
	}

	static flashWindow(){
		remote.getCurrentWindow().flashFrame(true);
	}

	static sendAndWait(toWindowId, type, data = {}){
		return new Promise(resolve => {
			sendMessage(toWindowId, type, data, resolve);
		})
	}

	static sendResult(original, result = null){
		return new Promise(resolve => {
			setTimeout(() => resolve(true), 5500);
			const windowId = remote.getCurrentWindow().id;

			ipcRenderer.sendTo(original.windowId, 'result', {original, result, windowId});
			ipcRenderer.once(`ack`, () => resolve(true))

		})
	}

	static watch(type, handler){
		ipcRenderer.on(type, (event, data) => handler(data))
	}

	static openPopOut(popup){

		let responded = false;

		const scatter = StoreService.get().state.scatter.clone();
		scatter.keychain.keypairs.map(keypair => delete keypair.privateKey);
		scatter.keychain.identities.map(identity => delete identity.privateKey);
		delete scatter.keychain.avatars;
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
		return LowLevelWindowService.openPopOut(
			readyWindow => WindowService.sendAndWait(readyWindow.id, 'popup', {scatter, popup, balances:{}}).then(result => {
				responded = true;
				respond(result);
			}),
			closedWithoutAction => { if(!responded) respond(null); },
			width, height,
			popup.internal
		);
	}
}