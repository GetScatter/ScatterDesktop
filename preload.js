const { ipcRenderer: ipc, remote } = require('electron');
let send = remote.getGlobal('scatterMessage');
let sendLog = remote.getGlobal('scatterLog');

if(!window.wallet) window.wallet = {};

ipc.on('scatter', (event, data) => window.wallet.received(data));
ipc.on('sockets', (event, data) => window.wallet.sockets(data));
ipc.on('popout', (event, data) => window.wallet.popout(data));

window.wallet.send = send;
window.wallet.windowId = remote.getCurrentWindow().id;

console.log('preloaded', window.wallet);

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