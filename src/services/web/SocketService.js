import * as CoreSocketService from 'scatter-core/services/utility/SocketService';
import device from '../../util/Device';
import WebSocket from 'isomorphic-ws';

let socket, rekeyPromise;



export default class SocketService {

	static getNewKey(origin, id){
		return new Promise((resolve, reject) => {
			rekeyPromise = {resolve, reject};
			this.emit(origin, id, 'rekey', {type:'rekey'});
			return rekeyPromise;
		})
	}

	static emit(origin, id, path, data){
		const original = path;
		if(path !== 'wallet') path = 'wallet_response';
		if(!socket) return console.error('No socket found');
		socket.send('42/scatter,' + JSON.stringify([path, {device, type:original, data:data ? data : false}]))
	}

	static async initialize(){
		// TODO: Replace with relay.get-scatter.com (and wss)
		socket = new WebSocket(`ws://104.248.229.148:50005/socket.io/?EIO=3&transport=websocket`);

		socket.onerror = e =>  console.error('Socket error', e);
		// socket.onopen = () =>

		socket.onmessage = async msg => {
			// Handshaking/Upgrading
			if(msg.data.indexOf('42/scatter') === -1) return false;

			// Real message
			const [type, data] = JSON.parse(msg.data.replace('42/scatter,', ''));

			// Managerial relay tasks
			if(type === 'connected') return this.emit(null, null, 'wallet');
			if(type === 'linked') return console.log('linked');

			switch(type){
				case 'pair': return CoreSocketService.handlePairedResponse(data);
				case 'rekeyed': return rekeyPromise.resolve(data);
				case 'api': return CoreSocketService.handleApiResponse(data);
			}
		};
	}

	static async close(){
		// return LowLevelSocketService.close();
		if(!socket) return;
		socket.close();
		socket = null;
	}

	static sendEvent(event, payload, origin){
		// return LowLevelSocketService.sendEvent(event, payload, origin);
	}

	static broadcastEvent(event, payload){
		// return LowLevelSocketService.broadcastEvent(event, payload);
	}

}