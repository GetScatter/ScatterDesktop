const { ipcRenderer: ipc, remote } = require('electron');
let send = remote.getGlobal('scatterMessage');

ipc.on('scatter', (event, data) => window.ScatterWallet.received(data));
ipc.on('sockets', (event, data) => window.ScatterWallet.sockets(data));
window.ScatterWallet = { send };