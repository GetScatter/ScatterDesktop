const path = require("path");
const url = require("url");


import WindowMessage from 'scatter-core/models/popups/WindowMessage';
import StoreService from "scatter-core/services/utility/StoreService";
import AppsService from "scatter-core/services/apps/AppsService";
import Recurring from 'scatter-core/models/Recurring'


let _OPEN_WINDOW;

let pendingMessages = [];
const getPending = msg => pendingMessages.find(x => x.id === msg.id);
const addPending = msg => pendingMessages.push(msg);
const removePending = msg => pendingMessages = pendingMessages.filter(x => x.id !== msg.id);

const handlers = [];

// todo:

// ipcRenderer.on('result', (event, result) => {
// 	if(!result) return;
//
// 	const pending = getPending(result.original);
// 	if(pending) pending.resolver(result.result);
//
// 	const rWin = remote.BrowserWindow.fromId(result.windowId);
// 	rWin.webContents.send('ack', true);
//
// });

let popouts = [];

const sendMessage = (windowId, type, data, resolver = null) => {
	// const message = new WindowMessage(type, data, remote.getCurrentWindow().id, resolver);
	// if(resolver) addPending(message);

	// remote.BrowserWindow.fromId(windowId).webContents.send(type, message);
};

export default class WindowService {

	static openTools(){
		console.log('opening tools')
		// remote.getCurrentWindow().openDevTools();
	}

	static flashWindow(){
		console.log('flashing window');
		// remote.getCurrentWindow().flashFrame(true);
	}

	static sendAndWait(toWindowId, type, data = {}){
		return new Promise(resolve => {
			sendMessage(toWindowId, type, data, resolve);
		})
	}

	static sendResult(original, result = null){
		return new Promise(resolve => {
			// setTimeout(() => resolve(true), 5500);
			// const windowId = remote.getCurrentWindow().id;
			//
			// ipcRenderer.sendTo(original.windowId, 'result', {original, result, windowId});
			// ipcRenderer.once(`ack`, () => resolve(true))

		})
	}

	static watch(type, handler){
		// ipcRenderer.on(type, (event, data) => handler(data))
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
		return openWindow(
			readyWindow => {
				const message = new WindowMessage('popup', {scatter, popup, balances:{}}, '0', null);
				readyWindow.getData = () => message;
				readyWindow.respond = (...data) => {
					responded = true;
					respond(...data);
				}
			},
			closedWithoutAction => { if(!responded) respond(null); },
			width, height,
			popup.internal
		);
	}

}

const openWindow = (onReady = () => {}, onClosed = () => {}, width = 800, height = 600, dontHide = false) => {
	const left = (screen.width/2)-(width/2);
	const top = (screen.height/2)-(height/2);
	_OPEN_WINDOW =  window.open(`http://localhost:8080/#/popout`,'Popup',`toolbar=no, location=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`);
	onReady(_OPEN_WINDOW);
	_OPEN_WINDOW.onbeforeunload = onClosed;
	return true;
}