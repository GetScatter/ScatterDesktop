import {remote} from "../util/ElectronHelpers";
const Transport = remote.getGlobal('appShared').Transport.default;

import {store} from '../store/store';
import * as Actions from "../store/constants";
import {EXT_WALLET_TYPES} from "../models/hardware/ExternalWallet";

const isLedgerConnected = () => store.state.hardware.hasOwnProperty(EXT_WALLET_TYPES.LEDGER);
const hardwareKeypairs = (type) => store.getters.keypairs.filter(x => !!x.external && x.external.type === type);

export default class HardwareService {

	static async openConnections(onlyIfDisconnected = false){
		return this.checkLedgerConnection(onlyIfDisconnected);
	}

	static async checkLedgerConnection(onlyIfDisconnected = false){
		if(!onlyIfDisconnected || !isLedgerConnected()){
			console.log('conecting')
			return new Promise(resolve => {
				Transport.listen({next:({type, device}) => this[type+'Ledger'](device)});
				setTimeout(() => {
					resolve(true);
				}, 1000);
			})
		} else {
			return true;
		}
	}

	static async addLedger(device){
		const {path} = device;
		const openedTransport = await Transport.open(path);
		await store.dispatch(Actions.SET_HARDWARE, {name:EXT_WALLET_TYPES.LEDGER, transport:openedTransport});

		hardwareKeypairs(EXT_WALLET_TYPES.LEDGER).map(keypair => {
			keypair.external.interface.open();
		})
	}

	static async removeLedger(device){
		if(isLedgerConnected()){
			await store.state.hardware[EXT_WALLET_TYPES.LEDGER].disconnect();
			await store.dispatch(Actions.REMOVE_HARDWARE, EXT_WALLET_TYPES.LEDGER);
			Transport.listen({next:({type, device}) => this[type](device)});
		}
	}

}