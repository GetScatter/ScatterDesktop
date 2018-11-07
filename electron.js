const {app, BrowserWindow, Tray, Menu, MenuItem} = require('electron');
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




let tray, mainWindow;

const setupMenu = () => {
	const menu = new Menu();
	mainWindow.setMenu(menu);

	const template = [{
		label: "Application",
		submenu: [
			{ label: "About Application", selector: "orderFrontStandardAboutPanel:" },
			{ type: "separator" },
			{ label: "Quit", accelerator: "Command+Q", click: () => { app.quit(); }}
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

const setupTray = () => {
	tray = new Tray(trayIcon);
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Open', type: 'normal', click:() => {
				mainWindow.show();
				if(mainWindow.isMinimized()) mainWindow.restore();
			}},
		{label: 'Exit', type: 'normal', click:() => app.quit()}
	]);
	tray.setToolTip('Scatter Desktop Companion');
	tray.setContextMenu(contextMenu);

	tray.on('click', () => {
		mainWindow.show();
		if(mainWindow.isMinimized()) mainWindow.restore();
	})
};

const createScatterInstance = () => {
	app.setAsDefaultProtocolClient('scatter');

	const createMainWindow = (show = true) => new BrowserWindow({
		width: 800,
		height: 800,
		frame: false,
		radii: [5,5,5,5],
		icon,
		resizable: true,
		minWidth: 620,
		minHeight:580,
		show,
		titleBarStyle:'hiddenInset',
		vibrancy:'appearance-based'
	});

	console.log(process);

	mainWindow = createMainWindow(false);

	const splash = createMainWindow(true);
	splash.loadURL(splashScreen);
	mainWindow.loadURL(mainUrl(false));

	// if main window is ready to show, then destroy the splash window and show up the main window
	mainWindow.once('ready-to-show', () => {
		splash.destroy();
		mainWindow.show();
	});

	// mainWindow.openDevTools();
	mainWindow.loadURL(mainUrl(false));
	mainWindow.on('closed', () => mainWindow = null);
	mainWindow.on('close', () => app.quit());

	setupTray();
	setupMenu();

	LowLevelWindowService.onMainWindowReady();
};

const activateInstance = e => {
	if(e) e.preventDefault();
	if(!mainWindow) return;
	mainWindow.restore();
};

app.on('ready', createScatterInstance);
app.on('activate', activateInstance);
app.on('window-all-closed', () => app.quit())

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
	if (process.platform === 'win32') callDeepLink(argv.slice(1))
	if (mainWindow) activateInstance();
})

if (shouldQuit) app.quit();

app.on('will-finish-launching', () => {
	app.on('open-url', (e, url) => {
		e.preventDefault();
		callDeepLink(url)
	})
});







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

	static async openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600){

		let win = waitingPopup;
		if(!win) win = await this.getWindow();
		else waitingPopup = null;
		win.setSize(width, height);
		win.center();

		onReady(win);
		win.show();
		win.setAlwaysOnTop(true);
		win.focus();
		win.setAlwaysOnTop(false);

		win.once('closed', async () => {
			// This is a fix for MacOS systems which causes the
			// main window to always pop up after popups closing.
			if (process.platform === 'darwin') {
				mainWindow.hide();
				app.hide();
			}

			onClosed(win);
			win = null;
			waitingPopup = await this.getWindow(1, 1);

		});

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
global.appShared = { Transport, ApiWatcher:null, LowLevelWindowService, NotificationService };


