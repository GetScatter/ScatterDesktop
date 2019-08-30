const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const net = require('net');
const {isDev} = require('../utils');

let mainWindow;

class LowLevelSocketService {

	constructor(){
		this.rekeyPromise = null;
		this.openConnections = {};
		this.websockets = [];
		this.ports = {};
	}

	static setWindow(w){
		mainWindow = w;
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

				if(request.plugin.trim().toLowerCase() === 'Scatter') return killRequest();
				if(request.data.hasOwnProperty('payload') && request.data.payload.origin.trim().toLowerCase() === 'Scatter') return killRequest();

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

module.exports = LowLevelSocketService;