import {store} from '../../store/store';
import * as Actions from '../../store/constants'
import Mnemonic from '../../util/Mnemonic'
import Hasher from '../../util/Hasher'
import IdGenerator from '../../util/IdGenerator'
import StorageService from '../utility/StorageService';
import AES from 'aes-oop';
import Scatter from '../../models/Scatter';
import PopupService from '../utility/PopupService'
import {Popup} from '../../models/popups/Popup'
import {localizedState} from "../../localization/locales";
import LANG_KEYS from "../../localization/keys";
import {ipcAsync, ipcFaF, ipcRenderer} from "../../util/ElectronHelpers";
import StoreService from "../utility/StoreService";
import features from "../../features";


export default class PasswordService {

    static passwordStrength(p){
	    const special = "!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?".split('');
	    let points = 0;
	    const upper = p.split('').filter(x => x === x.toUpperCase()).length;
	    points += upper < 5 ? upper : (5 * 2) + (upper-5);
	    const specs = p.split('').filter(x => special.includes(x)).length;
	    points += specs < 5 ? specs : (5 * 2) + (specs-5);
	    points += p.length;
	    const good = 60;
	    const percentage = points / good > 1 ? 1 : points / good;
	    return (percentage*100).toString();
    }

    static isValidPassword(password, confirmPassword = null){
        if(!password || password.length < 8) {
            return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.AUTH.PasswordLength)));
        }

        if(confirmPassword !== null && password !== confirmPassword) {
            return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.AUTH.InvalidConfirmation)));
        }

	    if(features.enforceStrongPasswords){
		    if(this.passwordStrength(password) < 50)
		        return PopupService.push(Popup.snackbar("Password not strong enough."))
	    }

        return true;
    }

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

                if(setToState) ipcFaF('seeding', seed);
                resolve([mnemonic, seed]);
            } catch(e){
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
		            resolve(false);
	            }
            }

            if(!password){
	            await testPassword(true, await ipcAsync('seed'));
            } else {
                const [mnemonic, seed] = await PasswordService.seedPassword(password, false);
	            await testPassword(false, seed, mnemonic);
            }

        })
    }

    static async changePassword(newPassword){
        return new Promise(async resolve => {

            const oldSeed = await ipcAsync('seed');

            // Setting a new salt every time the password is changed.
            await StorageService.setSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));
	        const [newMnemonic, newSeed] = await this.seedPassword(newPassword, true);

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
            await StorageService.setTranslation(StoreService.get().getters.language);
            StoreService.get().dispatch(Actions.LOAD_HISTORY);
            StoreService.get().dispatch(Actions.LOAD_LANGUAGE);
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
