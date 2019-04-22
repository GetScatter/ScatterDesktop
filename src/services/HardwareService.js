import {remote} from "../util/ElectronHelpers";
const Transport = remote.getGlobal('appShared').Transport.default;

import {store} from '../store/store';
import * as Actions from "../store/constants";
import {EXT_WALLET_TYPES} from "../models/hardware/ExternalWallet";
import PopupService from "./PopupService";
import {Popup} from "../models/popups/Popup";
import KeyPairService from "./KeyPairService";

const isLedgerConnected = () => store.state.hardware.hasOwnProperty(EXT_WALLET_TYPES.LEDGER);
const hardwareKeypairs = (type) => store.getters.keypairs.filter(x => !!x.external && x.external.type === type);

let transport = null;

export default class HardwareService {

	static async openConnections(onlyIfDisconnected = false){
		return this.checkLedgerConnection(onlyIfDisconnected);
	}

	static async checkLedgerConnection(onlyIfDisconnected = false){
		if(!onlyIfDisconnected || (!isLedgerConnected() && !transport)){
			return new Promise(resolve => {
				transport = Transport.listen({next:({type, device}) => this[type+'Ledger'](device)});
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
			if(store.state.hardware.hasOwnProperty(EXT_WALLET_TYPES.LEDGER))
				await store.state.hardware[EXT_WALLET_TYPES.LEDGER].disconnect();

			await store.dispatch(Actions.REMOVE_HARDWARE, EXT_WALLET_TYPES.LEDGER);
			transport = Transport.listen({next:({type, device}) => this[type](device)});
		}
	}










	static async checkHardware(account){
		await this.openConnections(true);

		const popup = canConnect => new Promise(resolve => {
			PopupService.push(Popup.prompt('Hardware Error', canConnect, async opened => {
				if(!opened) return resolve(false);
				account.keypair().resetExternal();
				await HardwareService.openConnections();
				resolve(this.checkHardware(account));
			}))
		});

		if(KeyPairService.isHardware(account.publicKey)){
			account.keypair().external.interface.open();
			const canConnect = await account.keypair().external.interface.canConnect();
			if(canConnect !== true) return await popup(canConnect);
			return true;
		} else return true;
	}

	static async sign(account, payload){
		const canConnect = await this.checkHardware(account);
		if(!canConnect) return false;

		const keypair = KeyPairService.getKeyPairFromPublicKey(account.publicKey);
		if(typeof keypair.external.interface.setAddressIndex === 'undefined') keypair.external.interface.open();
		keypair.external.interface.setAddressIndex(keypair.external.addressIndex);
		return keypair.external.interface.sign(account.publicKey, payload, payload.abi, account.network());
	}

}