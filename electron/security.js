const secp256k1 = require('secp256k1');
const electron = require('electron');
const {ipcMain} = electron;
const {isDev} = require('./utils');


let seed, key;

ipcMain.on('key', (event, arg) => {
	if(event.sender.history[0].indexOf('popout') > -1) return;
	if(arg === null) return key = null;
	if(key) return;
	key = Buffer.from(arg, 'base64');
});
ipcMain.on('seeding', (event, arg) => seed = arg);
ipcMain.on('seed', (event, arg) => {
	const {data, sig} = arg;
	if(!isDev && !secp256k1.verify(Buffer.from(data), Buffer.from(sig, 'base64'), key)) return event.sender.send('seed', null);
	event.sender.send('seed', seed);
});