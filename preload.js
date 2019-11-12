const { ipcRenderer, remote } = require('electron');
const wallet = remote.getGlobal('wallet');
const getHost = require('./electron/services/getHost');

const loadStyles = (tries = 0) => {
	if(tries >= 20) return console.error('Could not load styles!');
	if(typeof window.loadStyles === 'function'){
		window.loadStyles(getHost());
	}
	else setTimeout(() => loadStyles(tries++), 100);
};
loadStyles();

if(!window.wallet) window.wallet = {};

ipcRenderer.on('socketResponse', (event, data) => window.wallet.socketResponse(data));
ipcRenderer.on('popout', (event, data) => window.wallet.popout(data));
ipcRenderer.on('error', (event, data) => console.error('Error from client: ', ...data));
ipcRenderer.on('console', (event, data) => console.log('Console from client: ', ...data));

window.wallet = Object.assign(window.wallet, wallet);
window.wallet.windowId = remote.getCurrentWindow().id;


