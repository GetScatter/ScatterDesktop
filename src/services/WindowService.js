import {ipcRenderer, remote} from '../util/ElectronHelpers';
const path = window.require("path");
const url = window.require("url");

console.log('remote', remote);

const LowLevelWindowService = remote.getGlobal('appShared').LowLevelWindowService;

import WindowMessage from '../models/popups/WindowMessage';

let pendingMessages = [];
const getPending = msg => pendingMessages.find(x => x.id === msg.id);
const addPending = msg => pendingMessages.push(msg);
const removePending = msg => pendingMessages = pendingMessages.filter(x => x.id !== msg.id);

const handlers = [];

ipcRenderer.on('result', (event, result) => {
    if(!result) return;
    const pending = getPending(result.original);
    if(!pending) return;
    pending.resolver(result.result);
});

const sendMessage = (windowId, type, data, resolver = null) => {
    const message = new WindowMessage(type, data, remote.getCurrentWindow().id, resolver);
    if(resolver) addPending(message);

    const win = remote.BrowserWindow.fromId(windowId);
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
        ipcRenderer.sendTo(original.windowId, 'result', {original, result});
    }

    static watch(type, handler){
        ipcRenderer.on(type, (event, data) => handler(data))
    }

    static async openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600){
        return LowLevelWindowService.openPopOut(onReady, onClosed, width, height);
    }

}
