
const electron = require('electron');
const {Menu, BrowserWindow} = electron;
const {mainUrl} = require('../utils')

const isMac = () => process.platform === 'darwin';
let waitingPopup;
class LowLevelWindowService {

	static getWindow(width = 800, height = 600){
		return new Promise(resolve => {
			const win = new BrowserWindow({
				backgroundColor:'#FFFFFF',
				width, height,
				frame: false, radii: [5,5,5,5],
				icon:'assets/icon.png',
				show:false,
				webPreferences:{
					nodeIntegration:true,
					webviewTag:true,
				} });
			win.loadURL(mainUrl(true));
			// win.loadURL('http://localhost:8081/#/popout');
			resolve(win)
			// win.once('ready-to-show', () => resolve(win));
		})
	}

	static async queuePopup(){
		setTimeout(async () => {
			waitingPopup = await this.getWindow(800,600);
		}, 100);
	}

	static async openPopOut(popup, onClosed = () => {}, width = 800, height = 600, dontHide = false){
		let win = waitingPopup;
		if(!win) win = await this.getWindow();
		else waitingPopup = null;

		win.webContents.send('ready', popup);

		win.setSize(width, height);

		// Getting the screen to display the popup based on
		// where the user is at the time ( for dual monitors )
		const mousePoint = electron.screen.getCursorScreenPoint();
		const activeDisplay = electron.screen.getDisplayNearestPoint(mousePoint);
		let {width:screenWidth, height:screenHeight} = activeDisplay.workAreaSize;
		const leftBound = activeDisplay.bounds.x;

		let bounds = electron.screen.getPrimaryDisplay().bounds;
		let x = bounds.x + (leftBound + ((bounds.width - width) / 2));
		let y = bounds.y + ((bounds.height - height) / 2);
		win.setPosition(Math.round(x),Math.round(y));

		win.once('closed', async () => {
			// This is a fix for MacOS systems which causes the
			// main window to always pop up after popups closing.
			if (!dontHide && isMac()) {
				// mainWindow.hide();
				Menu.sendActionToFirstResponder('hide:');
				// mainWindow.show();
			}

			onClosed(win);
			win = null;
		});

		this.queuePopup();

		win.show();
		win.setAlwaysOnTop(true, "floating");
		win.focus();



		if(isMac()){
			electron.app.dock.hide();
			win.setAlwaysOnTop(false);
			win.setVisibleOnAllWorkspaces(true);
			win.setFullScreenable(false);
			electron.app.dock.show();
		}

		return win;
	}
}

module.exports = LowLevelWindowService;
