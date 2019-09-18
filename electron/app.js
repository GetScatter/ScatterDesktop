require("babel-polyfill")
const electron = require('electron');
const {remote, app, BrowserWindow, Tray, Menu, MenuItem, ipcMain} = electron;

const {isDev, icon, trayIcon, mainUrl} = require('./utils');
const LowLevelWindowService = require("./services/windows");
const LowLevelSocketService = require('./services/sockets');
const NotificationService = require('./services/notifier');





const quit = () => {
	if(global && global.appShared && global.appShared.savingData){
		setTimeout(() => {
			quit();
		}, 100);
	} else {
		if(global && global.appShared && global.appShared.QuitWatcher !== null)
			global.appShared.QuitWatcher();
		app.quit();
	}
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
		width: 1024,
		height: 800,
		frame: false,
		radii: [5,5,5,5],
		icon,
		resizable: true,
		minWidth: 800,
		minHeight:720,
		titleBarStyle:'hiddenInset',
		backgroundColor,
		show,
		webPreferences:{
			nodeIntegration:true,
			webviewTag:true,
		}
	});

	mainWindow = createMainWindow(false, '#fff');
	mainWindow.loadURL(mainUrl(false));

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.openDevTools();
	mainWindow.on('closed', () => mainWindow = null);
	mainWindow.on('close', () => quit());

	setupTray();
	setupMenu();


	LowLevelSocketService.setWindow(mainWindow);
	require('./security');
};

app.on('ready', createScatterInstance);
app.on('activate', activateInstance);
app.on('window-all-closed', () => quit())
app.on('second-instance', (event, argv) => {
	if (process.platform === 'win32' || process.platform === 'linux') callDeepLink(argv.slice(1));
	if (mainWindow) activateInstance();
})

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
	const isLocal = url.startsWith('https://127.0.0.1');
	if (isLocal) {
		event.preventDefault()
		callback(true)
	} else {
		callback(false)
	}
})

app.on('web-contents-created', (event, contents) => {
	contents.on('will-navigate', (event, navigationUrl) => {
		// Never navigate away from localhost.
		if(navigationUrl.indexOf(mainUrl(false)) !== 0) event.preventDefault()
	})
})

const callDeepLink = url => {
	if(global.appShared.ApiWatcher !== null)
		global.appShared.ApiWatcher(url);
}

if(!app.requestSingleInstanceLock()) quit();

app.on('will-finish-launching', () => {
	app.on('open-url', (e, url) => {
		e.preventDefault();
		callDeepLink(url)
	})
});


const Transport = require('@ledgerhq/hw-transport-node-hid');

global.appShared = {
	Transport,
	QuitWatcher:null,
	ApiWatcher:null,
	LowLevelWindowService,
	LowLevelSocketService:new LowLevelSocketService(),
	NotificationService,
	savingData:false,
	reloader:() => mainWindow.reload(),

	Wallet:require('./services/wallet'),
	Storage:require('./services/storage'),
};










// -------------------------------------------------------------
// CATCH ALL EXCEPTIONS AND CONSOLES
// We're throwing all exceptions and console up to the renderer console so they can be visible in running builds.
// -------------------------------------------------------------
process.on('uncaughtException', (err) => {
	mainWindow.webContents.send('error', {message:err.message, file:err.fileName, line:err.lineNumber});
	console.error('There was an uncaught error', err)
	// process.exit(1) //mandatory (as per the Node docs)
});

const log = console.log;
console.log = (...params) => {
	mainWindow.webContents.send('console', params);
	log(...params);
}

const logerr = console.error;
console.error = (...params) => {
	mainWindow.webContents.send('console', params);
	logerr(...params);
}


const wallet = require('./services/wallet');

// FORWARDING FROM INJECTED DOM
global.scatterMessage = async (data) => {
	console.log('ipc data', data.service, data.method);

	if(data.service === 'popout' && data.method === 'response') { mainWindow.webContents.send('popoutResponse', data); return null; }
	if(data.method === 'getScatter') return {data:wallet.getScatter(), id:data.id};

	// Popouts can only get scatter data
	if(data.isPopOut) return;

	if(data.service === 'sign' && data.method === 'sign') return {data:await wallet.sign(...data.data), id:data.id};
	if(data.method === 'setScatter') return {data:await wallet.updateScatter(...data.data), id:data.id};

	// Hardware wallets
	if(data.service === 'hardware' && data.method === 'types') return {data:await wallet.hardwareTypes, id:data.id};
	if(data.service === 'hardware' && data.method === 'keys') return {data:await wallet.getHardwareKeys(data.data), id:data.id};

	mainWindow.webContents.send('scatter', data);
}

global.scatterLog = (data) => mainWindow.webContents.send('scatterLog', data);



