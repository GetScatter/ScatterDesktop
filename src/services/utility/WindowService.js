import {ipcRenderer, remote} from '../../util/ElectronHelpers';
const path = window.require("path");
const url = window.require("url");

const LowLevelWindowService = remote.getGlobal('appShared').LowLevelWindowService;

import WindowMessage from '../../models/popups/WindowMessage';

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

const sendMessage = (windowId, type, data, resolver = null) => {
    const message = new WindowMessage(type, data, remote.getCurrentWindow().id, resolver);
    if(resolver) addPending(message);

    remote.BrowserWindow.fromId(windowId)
        .webContents
        .send(type, message);
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

    static async openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600, dontHide = false){
        return LowLevelWindowService.openPopOut(onReady, onClosed, width, height, dontHide);
    }

	static changeWindowSize(height, width, win = null){
		if(!win) win = remote.getCurrentWindow();

		win.setSize(width, height);


		const mousePoint = remote.screen.getCursorScreenPoint();
		const activeDisplay = remote.screen.getDisplayNearestPoint(mousePoint);
		let {width:screenWidth, height:screenHeight} = activeDisplay.workAreaSize;
		const leftBound = activeDisplay.bounds.x;
		win.setPosition(screenWidth + leftBound - width - 2, screenHeight - height - 2);
	}

}
