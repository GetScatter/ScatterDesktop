require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require("isomorphic-fetch");
const {ipcMain, shell, clipboard, dialog, app, BrowserWindow, Tray, Menu} = require('electron');

const {isDev, icon, trayIcon, mainUrl} = require('./utils');
const LowLevelWindowService = require("./services/windows");
const NotificationService = require('./services/notifier');
const HighLevelSockets = require('./services/sockets');
const prompt = require('./services/prompt');

const ecc = require('eosjs-ecc');

const Embedder = require('embedder');
const files = require('./services/files');
const getHost = require('./services/getHost');



const quit = () => {
	if(global && global.appShared && global.appShared.savingData){
		setTimeout(() => {
			quit();
		}, 100);
	} else {
		HighLevelSockets.broadcastEvent('dced', {});
		app.quit();
	}
}

let tray, mainWindow, loadingWindow;

ipcMain.on('loaderconsole', () => { if(loadingWindow) loadingWindow.openDevTools(); });

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

const createScatterInstance = async () => {
	app.setAsDefaultProtocolClient('scatter');

	const createMainWindow = (show, width = 1024, height = 800) => new BrowserWindow({
		width,
		height,
		frame: false,
		radii: [5,5,5,5],
		icon,
		resizable: true,
		// minWidth: 800,
		// minHeight:720,
		titleBarStyle:'hiddenInset',
		backgroundColor:"#fff",
		show,
		webPreferences:{
			nodeIntegration:true,
			webviewTag:true,
		}
	});

	loadingWindow = createMainWindow(true, 400, 250);
	loadingWindow.loadURL(mainUrl(false, 'loading'));


	loadingWindow.once('ready-to-show', () => {

		loadingWindow.show();
		loadingWindow.focus();
	});


	console.log('host', getHost());

	Embedder.init(
		require('../package').version,
		process.env.LOCAL_TESTING ? process.env.LOCAL_TESTING : getHost(),
		process.env.PROOF_KEYS.split(','),
		files,
		ecc.sha256,
		dialog.showErrorBox,
		prompt.accepted,
		(hashed, signed) => ecc.recoverHash(signed, hashed),
		hashstat => loadingWindow.webContents.send('hashstat', hashstat),
		process.env.LOCAL_TESTING,
	);

	if(!process.env.LOCAL_TESTING && !await Embedder.check()) return process.exit(0);

	files.toggleAllowInternals(false);

	mainWindow = createMainWindow(false);
	mainWindow.loadURL(mainUrl(false));
	loadingWindow.close();
	loadingWindow = null;

	mainWindow.once('ready-to-show', () => {
		HighLevelSockets.setMainWindow(mainWindow);
		mainWindow.show();
		mainWindow.focus();
	});

	// mainWindow.openDevTools();
	mainWindow.on('closed', () => mainWindow = null);
	mainWindow.on('close', () => quit());

	setupTray();
	setupMenu();
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
	// TODO: Need to rebuild deep link functionality
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



global.appShared = {
	ApiWatcher:null,
};










// -------------------------------------------------------------
// CATCH ALL EXCEPTIONS AND CONSOLES
// We're throwing all exceptions and console up to the renderer console so they can be visible in running builds.
// -------------------------------------------------------------
process.on('uncaughtException', (err) => {
	if(mainWindow) mainWindow.webContents.send('error', {message:err.message, file:err.fileName, line:err.lineNumber});
	console.error('There was an uncaught error', err)
	// process.exit(1) //mandatory (as per the Node docs)
});

const log = console.log;
console.log = (...params) => {
	if(mainWindow) mainWindow.webContents.send('console', params);
	if(loadingWindow) loadingWindow.webContents.send('console', params);
	log(...params);
}

const logerr = console.error;
console.error = (...params) => {
	if(mainWindow) mainWindow.webContents.send('console', params);
	if(loadingWindow) loadingWindow.webContents.send('console', params);
	logerr(...params);
}


const wallet = require('./services/wallet');
const storage = require('./services/storage');
const windows = require('./services/windows');

wallet.setStorage(storage);
wallet.init();


let multipartPromises = {};

global.wallet = {
	getVersion:() => `desktop_${require('../package').version}`,

	/************************************/
	/**       SIGNING & WALLET         **/
	/************************************/
	availableBlockchains:wallet.availableBlockchains,
	exists:wallet.exists,
	unlocked:wallet.isUnlocked,
	unlock:wallet.unlock,
	lock:wallet.lock,
	verifyPassword:wallet.verifyPassword,
	changePassword:wallet.changePassword,
	hardwareTypes:async () => wallet.hardwareTypes,
	hardwareKey:wallet.getHardwareKey,
	getPrivateKey:wallet.getPrivateKey,
	sign:wallet.sign,
	encrypt:wallet.encrypt,
	decrypt:wallet.decrypt,
	getSalt:storage.getSalt,
	setSalt:storage.setSalt,



	/************************************/
	/**        FILES / STORAGE         **/
	/************************************/
	storage:{
		getGeneralSetting:storage.getGeneralSetting,
		setGeneralSetting:storage.setGeneralSetting,
		setSimpleMode:storage.setSimpleMode,
		setLanguage:storage.setLanguage,
		getLanguage:storage.getLanguage,

		setWalletData:wallet.updateScatter,
		getWalletData:wallet.getScatter,
		clearWalletData:storage.removeScatter,
		getDefaultPath:files.getDefaultPath,

		saveFile:files.saveFile,
		openFile:files.openFile,
		getFileLocation:files.getFileLocation,
		getFolderLocation:files.getFolderLocation,
		mkdir:files.existsOrMkdir,

		cacheABI:storage.cacheABI,
		getCachedABI:storage.getCachedABI,
		getTranslation:storage.getTranslation,
		setTranslation:storage.setTranslation,
		getHistory:storage.getHistory,
		updateHistory:storage.updateHistory,
		deltaHistory:storage.deltaHistory,
		swapHistory:storage.swapHistory,
	},


	/************************************/
	/**           UTILITIES            **/
	/************************************/
	utility:{
		openTools:(windowId = null) => {
			(windowId ? BrowserWindow.fromId(windowId) : mainWindow).webContents.send('openTools');
		},
		closeWindow:(windowId = null) => {
			(windowId ? BrowserWindow.fromId(windowId) : mainWindow).close()
		},
		flashWindow:() => {
			mainWindow.once('focus', () => mainWindow.flashFrame(false));
			mainWindow.flashFrame(true);
			setTimeout(() => {
				mainWindow.setAlwaysOnTop(true);
				mainWindow.show();
				mainWindow.setAlwaysOnTop(false);
				app.focus();
			}, 200);
		},
		openLink:(link, filepath = false) => {
			if(filepath) return shell.openItem(link);
			else {
				if(link.indexOf('https://') === 0 || link.indexOf('http://') === 0) {
					return shell.openExternal(link);
				}
			}
		},
		reload:(windowId = null, main = false) => {
			if(main){
				app.relaunch();
				app.quit();
				return;
			}
			(windowId ? BrowserWindow.fromId(windowId) : mainWindow).reload()
		},
		copy:clipboard.writeText,
		screenshot:(windowId) => {
			return (windowId ? BrowserWindow.fromId(windowId) : mainWindow).capturePage().then(img => img.toJPEG(99))
		},
		openPopOut:(popup) => {
			return new Promise(resolve => {
				multipartPromises[popup.id] = resolve;
				windows.openPopOutFromPopupOnly(popup);
			});
		},
		popoutResponse:({original, result}) => {
			multipartPromises[original.id]({original, result});
			delete multipartPromises[original.id];
		},
		socketResponse:() => {},
		pushNotification:NotificationService.pushNotification
	},

	sockets:HighLevelSockets,
};

global.scatterLog = (data) => mainWindow.webContents.send('scatterLog', data);



