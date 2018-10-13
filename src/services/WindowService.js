const { ipcRenderer, remote } = window.require('electron');
const path = window.require("path");
const url = window.require("url");
import {store} from '../store/store'
import * as Actions from '../store/constants'

import WindowMessage from '../models/popups/WindowMessage';

let pendingMessages = [];
const getPending = msg => pendingMessages.find(x => x.id === msg.id);
const addPending = msg => pendingMessages.push(msg);
const removePending = msg => pendingMessages = pendingMessages.filter(x => x.id !== msg.id);

const handlers = [];

ipcRenderer.on('result', (event, result) => {
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

const getWindow = (width = 800, height = 600) => new remote.BrowserWindow({
    width,
    height,
    frame: false,
    radii: [5,5,5,5],
    icon:'assets/icon.png',
    show:false,
});

let waitingPopup = getWindow(1024, 800);

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

    static openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600){

        const clone = store.state.scatter.clone();
        clone.nonce++;
        store.dispatch(Actions.SET_SCATTER, clone);

        let win = waitingPopup;
        if(!win) win = getWindow();
        else waitingPopup = null;
        win.setSize(width, height);

        win.once('ready-to-show', () => {
            onReady(win);
            win.show();
            win.setAlwaysOnTop(true);
            win.focus();
            win.setAlwaysOnTop(false);
        });

        win.once('closed', () => {
            onClosed(win);
            win = null;
            waitingPopup = getWindow(1024, 800);
        });

        if(remote.process.mainModule.filename.indexOf('app.asar') === -1){
            win.loadURL('http://localhost:8080/#/popout');
        } else {
            win.loadURL(url.format({
                pathname: path.join(remote.app.getAppPath(), "dist", "index.html"),
                protocol: "file:",
                slashes: true,
                hash: '/popout'
            }));
        }



        return win;
    }

}
