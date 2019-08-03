const electron = require('electron');
const {remote, app, BrowserWindow, Tray, Menu, MenuItem, ipcMain} = electron;
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

	mainWindow.once('ready-to-show', () => {
		mainWindow.show(); 
  		mainWindow.focus(); 
	});

	// mainWindow.openDevTools();
	mainWindow.on('closed', () => mainWindow = null);
	mainWindow.on('close', () => quit());

	setupTray();
	setupMenu();

	LowLevelWindowService.queuePopup();
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
			resolve(win)
			// win.once('ready-to-show', () => resolve(win));
		})
	}

	static async queuePopup(){
		setTimeout(async () => {
			waitingPopup = await this.getWindow(800,600);
		}, 100);
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

		onReady(win);

		this.queuePopup();

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















const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const net = require('net');


class LowLevelSocketService {

	constructor(){
		this.rekeyPromise = null;
		this.openConnections = {};
		this.websockets = [];
		this.ports = {};
	}

	async getNewKey(origin, id){
		return new Promise((resolve, reject) => {
			this.rekeyPromise = {resolve, reject};
			this.emit(origin, id, 'rekey');
			return this.rekeyPromise;
		})
	}

	async emit(origin, id, path, data){
		const socket = this.openConnections[origin+id];
		return this.emitSocket(socket, path, data);
	}

	async emitSocket(socket, path, data){
		if(!socket) return console.error('No socket found');
		socket.send('42/scatter,' + JSON.stringify([path, data ? data : false]))
	}

	async initialize(_certs){

		const socketHandler = socket => {
			let origin = null;

			socket.send("40");
			socket.send("40/scatter");
			socket.send(`42/scatter,["connected"]`);

			const id = Math.round(Math.random() * 999999999).toString();

			// Just logging errors for debugging purposes (dev only)
			if(isDev) socket.on('error', async request => console.log('error', request));

			// Different clients send different message types for disconnect (ws vs socket.io)
			socket.on('close',      () => delete this.openConnections[origin+id]);
			socket.on('disconnect', () => delete this.openConnections[origin+id]);

			socket.on('message', msg => {
				if(msg.indexOf('42/scatter') === -1) return false;
				const [type, request] = JSON.parse(msg.replace('42/scatter,', ''));

				const killRequest = () => this.emitSocket(socket, 'api', {id:request.id, result:null});

				if(!request.plugin || request.plugin.length > 100) return killRequest();
				request.plugin = request.plugin.replace(/\s/g, "");

				if(request.plugin.trim().toLowerCase() === 'Scatter') killRequest();
				if(request.data.hasOwnProperty('payload') && request.data.payload.origin.trim().toLowerCase() === 'Scatter') killRequest();

				let requestOrigin;
				if(request.data.hasOwnProperty('payload')) requestOrigin = request.data.payload.origin;
				else requestOrigin = request.data.origin;

				if(!origin) origin = requestOrigin;
				else if(origin && requestOrigin !== origin) return this.emitSocket(socket, 'api', {id:request.id, result:null});
				if(!this.openConnections.hasOwnProperty(origin+id)) this.openConnections[origin+id] = socket;

				switch(type){
					case 'pair':        return mainWindow.webContents.send('pair', {request, id});
					case 'rekeyed':     return this.rekeyPromise.resolve(request);
					case 'api':         return mainWindow.webContents.send('api', {request, id});
				}

			});
		}

		if(this.websockets.length) return this.websockets;

		await this.findOpenPorts();
		mainWindow.webContents.send('ports', this.ports);

		const requestHandler = (_, res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Request-Method', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
			res.setHeader('Access-Control-Allow-Headers', '*');
			res.setHeader('Content-Type', 'application/json');
			res.end('scatter');
		}
		await Promise.all(Object.keys(this.ports).map(async port => {
			const server = this.ports[port] ? https.createServer(_certs, requestHandler) : http.createServer(requestHandler);
			this.websockets.push(new WebSocket.Server({ server }));
			server.listen(port);

			return true;
		}));

		this.websockets.map(ws => ws.on('connection', socketHandler));
		return this.websockets;
	}

	async close(){
		this.websockets.map(ws => {
			if(typeof ws.clients.map === 'function') ws.clients.map(ws => ws.terminate());
		})

		return true;
	}

	sendEvent(event, payload, origin){
		const sockets = Object.keys(this.openConnections).filter(x => x.indexOf(origin) === 0).map(x => this.openConnections[x]);
		sockets.map(x => this.emitSocket(x, 'event', {event, payload}));
		return true;
	}

	broadcastEvent(event, payload){
		Object.keys(this.openConnections).map(origin => this.sendEvent(event, payload, origin));
		return true;
	}

	async findOpenPorts(){
		const isPortAvailable = (port = 0) => {
			return new Promise(async resolve => {
				const server = net.createServer();

				server.once('error', err => resolve(err.code !== 'EADDRINUSE'));

				server.once('listening', () => {
					server.close();
					resolve(true);
				});

				server.listen(port);
			})
		}

		const findPort = async (delta=0) => {
			let port = 50005+delta;
			while(!await isPortAvailable(port)) port+=1500;
			return port;
		};

		const http = await findPort();
		const https = await findPort(1);
		this.ports = {[http]:false, [https]:true};
		return true;
	}

}




















global.appShared = {
	Transport,
	QuitWatcher:null,
	ApiWatcher:null,
	LowLevelWindowService,
	LowLevelSocketService:new LowLevelSocketService(),
	NotificationService,
	NodeMachineId,
	savingData:false,
	reloader:() => mainWindow.reload()
};



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
