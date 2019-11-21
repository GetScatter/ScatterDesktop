const {BrowserWindow, ipcMain} = require('electron');
const {icon, mainUrl} = require('../utils');

const createMainWindow = () => new BrowserWindow({
	width:400,
	height:250,
	frame: false,
	radii: [5,5,5,5],
	icon,
	resizable: true,
	titleBarStyle:'hiddenInset',
	backgroundColor:"#fff",
	show:false,
	webPreferences:{
		nodeIntegration:true,
	},
});

let responses = {};

ipcMain.on('prompt-response', (_, {id, response}) => {
	responses[id](response);
});

class Prompt {
	static accepted(title, text){

		return new Promise(resolve => {
			let responded = false;


			const promptWindow = createMainWindow(true, 400, 250);
			promptWindow.loadURL(mainUrl(false, 'prompt'));
			promptWindow.once('ready-to-show', () => {
				promptWindow.show();
				promptWindow.focus();
				responses[promptWindow.id] = resolve;
				promptWindow.webContents.send('prompt', {title, text, id:promptWindow.id});
			});

			promptWindow.on('closed', () => {
				if(responded) return;
				resolve(false);
			})
		});

	}
}

module.exports = Prompt;
