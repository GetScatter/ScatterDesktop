const { ipcRenderer: ipc, remote } = require('electron');
let send = remote.getGlobal('scatterMessage');
let sendLog = remote.getGlobal('scatterLog');
console.log('preload', location);

ipc.on('scatter', (event, data) => window.ScatterWallet.received(data));
ipc.on('sockets', (event, data) => window.ScatterWallet.sockets(data));
ipc.on('popout', (event, data) => window.ScatterWallet.popout(data));
window.ScatterWallet = { send, windowId:remote.getCurrentWindow().id };


const log = console.log;
console.log = (...params) => {
	sendLog(params);
	return log(...params);
}

const logerr = console.error;
console.error = (...params) => {
	sendLog(params);
	return logerr(...params);
}