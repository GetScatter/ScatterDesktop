const { ipcRenderer, remote } = require('electron');
const wallet = remote.getGlobal('wallet');

if(!window.wallet) window.wallet = {};

ipcRenderer.on('socketResponse', (event, data) => window.wallet.socketResponse(data));
ipcRenderer.on('popout', (event, data) => window.wallet.popout(data));
ipcRenderer.on('error', (event, data) => console.error('Error from client: ', ...data));
ipcRenderer.on('console', (event, data) => console.log('Console from client: ', ...data));

window.wallet = Object.assign(window.wallet, wallet);
window.wallet.windowId = remote.getCurrentWindow().id;


