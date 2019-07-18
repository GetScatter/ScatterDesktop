import * as Actions from 'scatter-core/store/constants';

import {ipcRenderer, remote} from "../../util/ElectronHelpers";
import StoreService from "scatter-core/services/utility/StoreService";

import * as CoreSocketService from 'scatter-core/services/utility/SocketService';



let websockets = [];
export default class SocketService {

	static async initialize(){
		remote.getGlobal('appShared').QuitWatcher = () => {
			console.log('dced')
			SocketService.broadcastEvent('dced', {});
		};

		const certs = await CoreSocketService.getCerts();
		ipcRenderer.on('api', (event, {request, id}) => CoreSocketService.handleApiResponse(request, id));
		ipcRenderer.on('pair', (event, {request, id}) => CoreSocketService.handlePairedResponse(request, id));
		ipcRenderer.on('ports', (event, ports) => StoreService.get().dispatch(Actions.SET_PORTS, ports));
		return remote.getGlobal('appShared').LowLevelSocketService.initialize(certs);
	}

	static async close(){
		return remote.getGlobal('appShared').LowLevelSocketService.close();
	}

	static sendEvent(event, payload, origin){
		return remote.getGlobal('appShared').LowLevelSocketService.sendEvent(event, payload, origin);
	}

	static broadcastEvent(event, payload){
		return remote.getGlobal('appShared').LowLevelSocketService.broadcastEvent(event, payload);
	}

	static emit(origin, id, path, data){
		return remote.getGlobal('appShared').LowLevelSocketService.emit(origin, id, path, data);
	}

	static getNewKey(origin, id){
		return remote.getGlobal('appShared').LowLevelSocketService.getNewKey(origin, id);
	}

}