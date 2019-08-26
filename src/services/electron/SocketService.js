
import {ipcRenderer, remote} from "../../util/ElectronHelpers";
import StoreService from "@walletpack/core/services/utility/StoreService";
import * as CoreSocketService from '@walletpack/core/services/utility/SocketService';
import * as UIActions from "../../store/ui_actions";



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
		ipcRenderer.on('ports', (event, ports) => StoreService.get().dispatch(UIActions.SET_PORTS, ports));
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