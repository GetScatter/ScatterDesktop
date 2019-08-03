import ApiService from '../apis/ApiService';
import AuthorizedApp from '../../models/AuthorizedApp';
import * as Actions from '../../store/constants';
import {Popup} from '../../models/popups/Popup'
import PopupService from './PopupService';

import {ipcRenderer, remote} from "../../util/ElectronHelpers";
import StoreService from "./StoreService";
const LowLevelSocketService = remote.getGlobal('appShared').LowLevelSocketService;

remote.getGlobal('appShared').QuitWatcher = () => {
	console.log('dced')
	SocketService.broadcastEvent('dced', {});
};






const emit = (origin, id, path, data) => LowLevelSocketService.emit(origin, id, path, data);
const getNewKey = (origin, id) => LowLevelSocketService.getNewKey(origin, id);

const handleApiResponse = async (request, id) => {

	// 2 way authentication
	const existingApp = StoreService.get().state.scatter.keychain.findApp(request.data.payload.origin);

	const updateNonce = async () => {
		const clone = StoreService.get().state.scatter.clone();
		existingApp.nextNonce = request.data.nextNonce;
		clone.keychain.updateOrPushApp(existingApp);
		return StoreService.get().dispatch(Actions.SET_SCATTER, clone);
	};

	const removeAppPermissions = async () => {
		const clone = StoreService.get().state.scatter.clone();
		clone.keychain.removeApp(existingApp);
		return StoreService.get().dispatch(Actions.SET_SCATTER, clone);
	};

	if(!existingApp) return;
	if(!existingApp.checkKey(request.data.appkey)) return;
	if(existingApp.nextNonce.length && !existingApp.checkNonce(request.data.nonce)) await removeAppPermissions();
	else await updateNonce();

	ApiService.handler(Object.assign(request.data, {plugin:request.plugin})).then(result => {
		emit(existingApp.origin, id, 'api', result);
	})
};

const handlePairedResponse = async (request, id) => {
	const scatter = StoreService.get().state.scatter;
	const existingApp = scatter.keychain.findApp(request.data.origin);
	const linkApp = {
		type:'linkApp',
		payload:request.data
	};

	if(request.data.passthrough)
		return emit(request.data.origin, id, 'paired', existingApp && existingApp.checkKey(request.data.appkey));

	const addAuthorizedApp = async (newKey = null) => {
		const authedApp = new AuthorizedApp(request.data.origin, newKey ? newKey : request.data.appkey);
		const clone = scatter.clone();
		clone.keychain.updateOrPushApp(authedApp);
		await StoreService.get().dispatch(Actions.SET_SCATTER, clone);
		emit(request.data.origin, id, 'paired', true);
	};

	const repair = async () => {
		const newKey = await getNewKey(request.data.origin, id);
		if(newKey.data.origin !== request.data.origin || newKey.data.appkey.indexOf('appkey:') === -1) return emit(request.data.origin, id, 'paired', false);
		return addAuthorizedApp(newKey.data.appkey)
	}

	if(existingApp){
		if(existingApp.checkKey(request.data.appkey)) return emit(request.data.origin, id, 'paired', true);
		else PopupService.push(Popup.popout(linkApp, async ({result}) => {
			if(result) return repair();
			else emit(request.data.origin, id, 'paired', false);
		}));
	}
	else return repair();
};








/***
 * Gets certs that allow for `wss` local connections.
 * @returns {Promise<Response | never | void>}
 */
export const getCerts = async () => {
	return fetch('https://certs.get-scatter.com?rand='+Math.round(Math.random()*100 + 1))
		.then(res => res.json())
		.then(res => {
			if(res.hasOwnProperty('key') && res.hasOwnProperty('cert')) return res;
			PopupService.push(Popup.prompt("Couldn't fetch certificates", 'There was an issue trying to fetch the certificates which allow Scatter to run on SSL. This is usually caused by proxies, firewalls, and anti-viruses.'))
			return null;
		})
		.catch(() => console.error('Could not fetch certs. Probably due to a proxy, vpn, or firewall.'));
};

let websockets = [];
export default class SocketService {

	static async initialize(){
		const certs = await getCerts();
		ipcRenderer.on('api', (event, {request, id}) => handleApiResponse(request, id));
		ipcRenderer.on('pair', (event, {request, id}) => handlePairedResponse(request, id));
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

}