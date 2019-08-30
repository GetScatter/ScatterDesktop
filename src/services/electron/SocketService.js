
import {ipcRenderer, remote} from "../../util/ElectronHelpers";
import * as CoreSocketService from '@walletpack/core/services/utility/SocketService';
import * as UIActions from "../../store/ui_actions";
import WebViewService from "./WebViewService";


export default class SocketService {

	static async initialize(){
		remote.getGlobal('appShared').QuitWatcher = () => {
			console.log('dced')
			SocketService.broadcastEvent('dced', {});
		};

		const certs = await CoreSocketService.getCerts();
		ipcRenderer.on('api', (event, {request, id}) => WebViewService.get().send('sockets', {type:'api', request, id}));
		ipcRenderer.on('pair', (event, {request, id}) => WebViewService.get().send('sockets', {type:'pair', request, id}));
		ipcRenderer.on('ports', (event, ports) => WebViewService.get().send('sockets', {type:'ports', ports}));
		return remote.getGlobal('appShared').LowLevelSocketService.initialize(certs);
	}

	static async close(){
		return remote.getGlobal('appShared').LowLevelSocketService.close();
	}

	static async sendEvent(event, payload, origin){
		return remote.getGlobal('appShared').LowLevelSocketService.sendEvent(event, payload, origin);
	}

	static async broadcastEvent(event, payload){
		return remote.getGlobal('appShared').LowLevelSocketService.broadcastEvent(event, payload);
	}

	static async emit(origin, id, path, data){
		return remote.getGlobal('appShared').LowLevelSocketService.emit(origin, id, path, data);
	}

	static async getNewKey(origin, id){
		return remote.getGlobal('appShared').LowLevelSocketService.getNewKey(origin, id);
	}

}