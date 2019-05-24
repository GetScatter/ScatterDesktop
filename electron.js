const electron = require('electron');
const {app, BrowserWindow, Tray, Menu, MenuItem, ipcMain} = electron;
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

	// if main window is ready to show, then destroy the splash window and show up the main window
	mainWindow.once('ready-to-show', () => {
		mainWindow.show(); 
  		mainWindow.focus(); 
	});

	// mainWindow.openDevTools();
	// mainWindow.loadURL(mainUrl(false));
	mainWindow.on('closed', () => mainWindow = null);
	mainWindow.on('close', () => quit());

	setupTray();
	setupMenu();

	LowLevelWindowService.onMainWindowReady();
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
		console.log('mainUrl', mainUrl(false));
		if(navigationUrl.indexOf(mainUrl(false)) !== 0) event.preventDefault()
	})
})

const callDeepLink = url => {
	if(global.appShared.ApiWatcher !== null)
		global.appShared.ApiWatcher(url);
}

const singleInstanceLock = app.requestSingleInstanceLock();
if(!singleInstanceLock) quit();
// const shouldQuit = app.makeSingleInstance(argv => {
// 	if (process.platform === 'win32') callDeepLink(argv.slice(1));
// 	if (mainWindow) activateInstance();
// })
//
// if (shouldQuit) quit();

app.on('will-finish-launching', () => {
	app.on('open-url', (e, url) => {
		e.preventDefault();
		callDeepLink(url)
	})
});








const http = require('http');
const https = require('https');
const WebSocket = require('ws');

let rekeyPromise;
const openConnections = {};
let websockets = [];
class LowLevelSocketService {

	static async getNewKey(origin){
		return new Promise((resolve, reject) => {
			rekeyPromise = {resolve, reject};
			this.emit(origin, 'rekey');
			return rekeyPromise;
		})
	}

	static async emit(origin, path, data){
		const socket = openConnections[origin];
		return this.emitSocket(socket, path, data);
	}

	static async emitSocket(socket, path, data){
		if(!socket) return console.error('No socket found');
		socket.send('42/scatter,' + JSON.stringify([path, data ? data : false]))
	}

	static async initialize(certs){

		const socketHandler = socket => {
			let origin = null;

			socket.send("40");
			socket.send("40/scatter");
			socket.send(`42/scatter,["connected"]`);

			// Just logging errors for debugging purposes (dev only)
			if(isDev) socket.on('error', async request => console.log('error', request));

			// Different clients send different message types for disconnect (ws vs socket.io)
			socket.on('close',      () => delete openConnections[origin]);
			socket.on('disconnect', () => delete openConnections[origin]);

			socket.on('message', msg => {
				if(msg.indexOf('42/scatter') === -1) return false;
				const [type, request] = JSON.parse(msg.replace('42/scatter,', ''));

				const killRequest = () => LowLevelSocketService.emitSocket(socket, 'api', {id:request.id, result:null});

				if(!request.plugin || request.plugin.length > 100) return killRequest();
				request.plugin = request.plugin.replace(/\s/g, "");

				if(request.plugin.trim().toLowerCase() === 'Scatter') killRequest();
				if(request.data.hasOwnProperty('payload') && request.data.payload.origin.trim().toLowerCase() === 'Scatter') killRequest();

				let requestOrigin;
				if(request.data.hasOwnProperty('payload')) requestOrigin = request.data.payload.origin;
				else requestOrigin = request.data.origin;

				if(!origin) origin = requestOrigin;
				else if(origin && requestOrigin !== origin) return this.emitSocket(socket, 'api', {id:request.id, result:null});
				if(!openConnections.hasOwnProperty(origin)) openConnections[origin] = socket;

				switch(type){
					case 'pair':        return mainWindow.webContents.send('pair', request);
					case 'rekeyed':     return rekeyPromise.resolve(request);
					case 'api':         return mainWindow.webContents.send('api', request);
				}

			});
		}

		if(websockets.length) return websockets;

		// port:ssl
		let ports = { 50005:false };
		if(certs) ports[50006] = true;

		await Promise.all(Object.keys(ports).map(async port => {
			// TODO: Can't find a good cross platform port killer,
			// TODO: Might need to make one.
			// await kill(port, 'tcp')
			// 	.then(console.log)
			// 	.catch(console.log);
			const server = ports[port] ? https.createServer(certs) : http.createServer();
			websockets.push(new WebSocket.Server({ server }));
			server.listen(port);
			return true;
		}));

		websockets.map(ws => ws.on('connection', socketHandler));
		return websockets;
	}

	static async close(){
		console.log('closing')
		websockets.map(ws => {
			if(typeof ws.clients.map === 'function') ws.clients.map(ws => ws.terminate());
		})

		return true;
	}

	static sendEvent(event, payload, origin){
		return this.emit(origin, 'event', {event, payload});
	}

	static broadcastEvent(event, payload){
		Object.keys(openConnections).map(origin => {
			this.sendEvent(event, payload, origin);
		});
		return true;
	}

}







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
				} });
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

		let bounds = electron.screen.getPrimaryDisplay().bounds;
		let x = bounds.x + (leftBound + ((bounds.width - width) / 2));
		let y = bounds.y + ((bounds.height - height) / 2);

		// win.setPosition(screenWidth + leftBound - width - 2, screenHeight - height - 2);
		win.setPosition(x,y);

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

require("babel-polyfill")
const Transport = require('@ledgerhq/hw-transport-node-hid');

const NodeMachineId = require('node-machine-id');

global.appShared = { Transport, QuitWatcher:null, ApiWatcher:null, LowLevelWindowService, LowLevelSocketService, NotificationService, NodeMachineId, savingData:false };



const secp256k1 = require('secp256k1');
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

