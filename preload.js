const { ipcRenderer: ipc, remote } = require('electron');
let wallet = remote.getGlobal('wallet');
let sendLog = remote.getGlobal('scatterLog');

if(!window.wallet) window.wallet = {};

ipc.on('scatter', (event, data) => window.wallet.received(data));
ipc.on('socketResponse', (event, data) => window.wallet.socketResponse(data));
ipc.on('popout', (event, data) => window.wallet.popout(data));
ipc.on('error', (event, data) => console.error('Error from client: ', ...data));
ipc.on('console', (event, data) => console.log('Console from client: ', ...data));

window.wallet = Object.assign(window.wallet, wallet);
window.wallet.windowId = remote.getCurrentWindow().id;

// window.wallet.send = send;


// const log = console.log;
// console.log = (...params) => {
// 	sendLog(params);
// 	return log(...params);
// }
//
// const logerr = console.error;
// console.error = (...params) => {
// 	sendLog(params);
// 	return logerr(...params);
// }