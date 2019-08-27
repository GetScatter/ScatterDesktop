import Mnemonic from "@walletpack/core/util/Mnemonic";
import Seeder from "@walletpack/core/services/secure/Seeder";
import StorageService from "../electron/StorageService";
import AES from "aes-oop";
import StoreService from "@walletpack/core/services/utility/StoreService";
import * as Actions from "@walletpack/core/store/constants";
import Scatter from "@walletpack/core/models/Scatter";
import Hasher from "@walletpack/core/util/Hasher";
import Locale from "@walletpack/core/models/Locale";
import * as UIActions from "../../store/ui_actions";
import PopupService from "./PopupService";
import {Popup} from "../../models/popups/Popup";
import IdGenerator from "@walletpack/core/util/IdGenerator";

export default class PasswordHelpers {

	static async seedPassword(password, setToState = true){
		return new Promise(async (resolve, reject) => {
			try {
				let seed, mnemonic;
				if(password.split(' ').length >= 12) {
					seed = await Mnemonic.mnemonicToSeed(password);
					mnemonic = password;
				} else {
					const [m, s] = await Mnemonic.generateMnemonic(password);
					seed = s;
					mnemonic = m;
				}

				if(setToState) {
					console.log('setting to state', seed);
					await Seeder.setSeed(seed);
				}
				resolve([mnemonic, seed]);
			} catch(e){
				console.log('caugh', e);
				resolve([null, null]);
			}
		})
	}

	static async verifyPassword(password = null, forceLocal = false){
		return new Promise(async resolve => {

			const testPassword = async (setToState, seed) => {
				try {
					let scatter = forceLocal ? StorageService.getLocalScatter() : StorageService.getScatter();
					scatter = AES.decrypt(scatter, seed);
					if(setToState) await StoreService.get().commit(Actions.SET_SCATTER, scatter);

					if(!scatter.hasOwnProperty('keychain')) return resolve(false);

					scatter = Scatter.fromJson(scatter);
					scatter.decrypt(seed);
					if(setToState) await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
					resolve(true);
				} catch(e) {
					console.log('e', e);
					resolve(false);
				}
			}

			if(!password){
				await testPassword(true, await Seeder.getSeed());
			} else {
				const [mnemonic, seed] = await PasswordHelpers.seedPassword(password, false);
				await testPassword(false, seed);
			}

		})
	}

	static async changePassword(newPassword){
		return new Promise(async resolve => {

			const oldSeed = await Seeder.getSeed();

			// Setting a new salt every time the password is changed.
			await StorageService.setSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));
			const [newMnemonic, newSeed] = await PasswordHelpers.seedPassword(newPassword, true);

			// Re-encrypting keypairs
			const scatter = StoreService.get().state.scatter.clone();
			scatter.keychain.keypairs.map(keypair => {
				keypair.decrypt(oldSeed);
				keypair.encrypt(newSeed);
			});
			scatter.keychain.identities.map(id => {
				id.decrypt(oldSeed);
				id.encrypt(newSeed);
			});

			await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
			await StorageService.swapHistory(StoreService.get().state.history);
			await StorageService.setTranslation(Locale.fromJson(StoreService.get().state.language.json));
			StoreService.get().dispatch(Actions.LOAD_HISTORY);
			StoreService.get().dispatch(UIActions.LOAD_LANGUAGE);
			resolve(newMnemonic);

		})
	}

	static async setPIN(pin, verify = false){
		return new Promise(resolve => {
			const set = async () => {
				const scatter = StoreService.get().state.scatter.clone();
				scatter.pin = pin ? Hasher.unsaltedQuickHash(pin) : null;
				resolve(await StoreService.get().dispatch(Actions.SET_SCATTER, scatter));
			};

			if(verify) PopupService.push(Popup.verifyPassword(verified => {
				if(!verified) return resolve(null);
				set();
			}));

			else set();
		})
	}

	static async verifyPIN(){
		if(!StoreService.get().state.scatter.pin || !StoreService.get().state.scatter.pin.length) return true;
		return new Promise(resolve => {
			PopupService.push(Popup.enterPIN(verified => {
				resolve(verified);
			}))
		})
	}

}