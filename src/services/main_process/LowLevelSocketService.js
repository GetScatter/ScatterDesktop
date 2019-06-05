const {remote} = require("electron");
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const net = require('net');

let mainWindow, isDev;

let rekeyPromise;
const openConnections = {};
let websockets = [];
let ports = {};
let certs;
module.exports = class LowLevelSocketService {

	constructor(_isDev){
		isDev = _isDev;
	}

	loadWindow(_window){
		mainWindow = _window;
	}

	async getNewKey(origin){
		return new Promise((resolve, reject) => {
			rekeyPromise = {resolve, reject};
			this.emit(origin, 'rekey');
			return rekeyPromise;
		})
	}

	async emit(origin, path, data){
		const socket = openConnections[origin];
		return this.emitSocket(socket, path, data);
	}

	async emitSocket(socket, path, data){
		if(!socket) return console.error('No socket found');
		socket.send('42/scatter,' + JSON.stringify([path, data ? data : false]))
	}

	async initialize(_certs){
		certs = _certs;

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
				if(!openConnections.hasOwnProperty(origin)) openConnections[origin] = socket;

				switch(type){
					case 'pair':        return mainWindow.webContents.send('pair', request);
					case 'rekeyed':     return rekeyPromise.resolve(request);
					case 'api':         return mainWindow.webContents.send('api', request);
				}

			});
		}

		if(websockets.length) return websockets;

		await this.findOpenPorts();

		const requestHandler = (_, res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Request-Method', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
			res.setHeader('Access-Control-Allow-Headers', '*');
			res.setHeader('Content-Type', 'application/json');
			res.end('scatter');
		}
		await Promise.all(Object.keys(ports).map(async port => {
			const server = ports[port] ? https.createServer(certs, requestHandler) : http.createServer(requestHandler);
			websockets.push(new WebSocket.Server({ server }));
			server.listen(port);

			return true;
		}));

		websockets.map(ws => ws.on('connection', socketHandler));
		return websockets;
	}

	async close(){
		websockets.map(ws => {
			if(typeof ws.clients.map === 'function') ws.clients.map(ws => ws.terminate());
		})

		return true;
	}

	sendEvent(event, payload, origin){
		return this.emit(origin, 'event', {event, payload});
	}

	broadcastEvent(event, payload){
		Object.keys(openConnections).map(origin => {
			this.sendEvent(event, payload, origin);
		});
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
		ports = {[http]:false, [https]:true};
		return true;
	}

}