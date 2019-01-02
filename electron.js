const electron = require('electron');
const {app, BrowserWindow, Tray, Menu, MenuItem} = electron;
const path = require("path");
const url = require("url");

const isDev = process.mainModule.filename.indexOf('app.asar') === -1;

let icon = isDev
	? 'static/icons/icon.png'
	: __dirname + '/static/icons/icon.png';

let trayIcon = isDev
	? 'static/icons/icon-tray.png'
	: __dirname + '/static/icons/icon-tray.png';

let mainUrl = isPopup => isDev ? `http://localhost:8080/${isPopup ? '/#/popout' : ''}` : url.format({
	pathname: path.join(__dirname, "dist", "index.html"),
	protocol: "file:",
	slashes: true,
	hash:isPopup ? '/popout' : null
});

let splashScreen = url.format({
	pathname: path.join(__dirname, "dist", "splash.html"),
	protocol: "file:",
	slashes: true,
});


const quit = () => {
	if(global && global.appShared && global.appShared.savingData){
		setTimeout(() => {
			quit();
		}, 100);
	} else app.quit();
}

let tray, mainWindow;

const setupMenu = () => {
	const menu = new Menu();
	mainWindow.setMenu(menu);

	const template = [{
		label: "Application",
		submenu: [
			{ label: "About Application", selector: "orderFrontStandardAboutPanel:" },
			{ type: "separator" },
			{ label: "Quit", accelerator: "Command+Q", click: () => { quit(); }}
		]}, {
		label: "Edit",
		submenu: [
			{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
			{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
			{ type: "separator" },
			{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
			{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
			{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
			{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
		]}
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const restoreInstance = () => {
	mainWindow.show();
	if(mainWindow.isMinimized()) mainWindow.restore();
};

const activateInstance = e => {
	if(e) e.preventDefault();
	if(!mainWindow) return;
	restoreInstance();
};

const setupTray = () => {
	tray = new Tray(trayIcon);
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Open', type: 'normal', click:() => restoreInstance()},
		{label: 'Exit', type: 'normal', click:() => quit()}
	]);
	tray.setToolTip('Scatter Desktop Companion');
	tray.setContextMenu(contextMenu);

	tray.on('click', () => restoreInstance())
};

const createScatterInstance = () => {
	app.setAsDefaultProtocolClient('scatter');

	const createMainWindow = (show, backgroundColor) => new BrowserWindow({
		width: 900,
		height: 800,
		frame: false,
		radii: [5,5,5,5],
		icon,
		resizable: true,
		minWidth: 620,
		minHeight:580,
		titleBarStyle:'hiddenInset',
		backgroundColor,
		show,
	});

	mainWindow = createMainWindow(false, '#111111');
	mainWindow.loadURL(mainUrl(false));

	// if main window is ready to show, then destroy the splash window and show up the main window
	mainWindow.once('ready-to-show', () => {
		mainWindow.show(); 
  		mainWindow.focus(); 
	});

	// mainWindow.openDevTools();
	mainWindow.loadURL(mainUrl(false));
	mainWindow.on('closed', () => mainWindow = null);
	mainWindow.on('close', () => quit());

	setupTray();
	setupMenu();

	LowLevelWindowService.onMainWindowReady();
};

app.on('ready', createScatterInstance);
app.on('activate', activateInstance);
app.on('window-all-closed', () => quit())

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
	const isLocal = url.startsWith('https://127.0.0.1');
	if (isLocal) {
		event.preventDefault()
		callback(true)
	} else {
		callback(false)
	}
})

const callDeepLink = url => {
	if(global.appShared.ApiWatcher !== null)
		global.appShared.ApiWatcher(url);
}

const shouldQuit = app.makeSingleInstance(argv => {
	if (process.platform === 'win32') callDeepLink(argv.slice(1));
	if (mainWindow) activateInstance();
})

if (shouldQuit) quit();

app.on('will-finish-launching', () => {
	app.on('open-url', (e, url) => {
		e.preventDefault();
		callDeepLink(url)
	})
});





const isMac = () => process.platform === 'darwin';
let waitingPopup;
class LowLevelWindowService {

	static getWindow(width = 800, height = 600){
		return new Promise(resolve => {
			const win = new BrowserWindow({ width, height, frame: false, radii: [5,5,5,5], icon:'assets/icon.png', show:false, });
			win.loadURL(mainUrl(true));
			win.once('ready-to-show', () => resolve(win));
		})
	}

	static async onMainWindowReady(){
		waitingPopup = await this.getWindow(1,1);
	}

	static async openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600, dontHide = false){

		let win = waitingPopup;
		if(!win) win = await this.getWindow();
		else waitingPopup = null;

		win.setSize(width, height);


		// Getting the screen to display the popup based on
		// where the user is at the time ( for dual monitors )
		const mousePoint = electron.screen.getCursorScreenPoint();
		const activeDisplay = electron.screen.getDisplayNearestPoint(mousePoint);
		let {width:screenWidth, height:screenHeight} = activeDisplay.workAreaSize;
		const leftBound = activeDisplay.bounds.x;
		win.setPosition(screenWidth + leftBound - width - 2, screenHeight - height - 2);

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

		onReady(win);

		win.show();
		win.setAlwaysOnTop(true, "floating");
		win.focus();

		if(isMac()){
			app.dock.hide();
			win.setAlwaysOnTop(false);
			win.setVisibleOnAllWorkspaces(true);
			win.setFullScreenable(false);
			app.dock.show();
		}

		waitingPopup = await this.getWindow(1, 1);

		return win;
	}
}

const notifier = require("node-notifier");
class NotificationService {
	static pushNotification(title, body){
		notifier.notify({
			message:body,
			title,
			appID:'com.get-scatter.server',
			sound: false,
			icon,
			wait:false
		});
	}
}

const Transport = require('@ledgerhq/hw-transport-node-hid');

const NodeMachineId = require('node-machine-id');

global.appShared = { Transport, ApiWatcher:null, LowLevelWindowService, NotificationService, NodeMachineId, savingData:false };

