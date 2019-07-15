import ApiService from 'scatter-core/services/apis/ApiService';
import AuthorizedApp from 'scatter-core/models/AuthorizedApp';
import * as Actions from 'scatter-core/store/constants';
import {Popup} from 'scatter-core/models/popups/Popup'
import PopupService from 'scatter-core/services/utility/PopupService';

import {ipcRenderer, remote} from "../util/ElectronHelpers";
import StoreService from "scatter-core/services/utility/StoreService";
const LowLevelSocketService = remote.getGlobal('appShared').LowLevelSocketService;

import * as CoreSocketService from 'scatter-core/services/utility/SocketService';

remote.getGlobal('appShared').QuitWatcher = () => {
	console.log('dced')
	SocketService.broadcastEvent('dced', {});
};



let websockets = [];
export default class SocketService {

	static async initialize(){
		const certs = await CoreSocketService.getCerts();
		ipcRenderer.on('api', (event, {request, id}) => CoreSocketService.handleApiResponse(request, id));
		ipcRenderer.on('pair', (event, {request, id}) => CoreSocketService.handlePairedResponse(request, id));
		ipcRenderer.on('ports', (event, ports) => StoreService.get().dispatch(Actions.SET_PORTS, ports));
		return LowLevelSocketService.initialize(certs);
	}

	static async close(){
		return LowLevelSocketService.close();
	}

	static sendEvent(event, payload, origin){
		return LowLevelSocketService.sendEvent(event, payload, origin);
	}

	static broadcastEvent(event, payload){
		return LowLevelSocketService.broadcastEvent(event, payload);
	}

	static emit(origin, id, path, data){
		return LowLevelSocketService.emit(origin, id, path, data);
	}

	static getNewKey(origin, id){
		return LowLevelSocketService.getNewKey(origin, id);
	}

}