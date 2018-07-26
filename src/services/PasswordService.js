import {store} from '../store/store';
import * as Actions from '../store/constants'
import Mnemonic from '../util/Mnemonic'
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'
import StorageService from '../services/StorageService';
import AES from 'aes-oop';
import Scatter from '../models/Scatter';
import SocketService from '../services/SocketService'
import PopupService from '../services/PopupService'
import {Popup} from '../models/popups/Popup'

export default class PasswordService {

    static isValidPassword(password, confirmPassword = null){
        // TODO: Password error prompts
        if(!password || password.length < 8) {
            PopupService.push(Popup.prompt("Invalid Password", "Passwords must be at least 8 characters long.", "ban", "Okay"));
            return false;
        }

        if(confirmPassword !== null && password !== confirmPassword) {
          PopupService.push(Popup.prompt("Confirmation Mismatch", "The confirmation password does not match.", "ban", "Okay"));
            return false;
        }

        // TODO: Strengthen password restrictions

        return true;
    }

    static async seedPassword(password){
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

                await store.commit(Actions.SET_SEED, seed);
                resolve([mnemonic, seed]);
            } catch(e){
                resolve([null, null]);
            }
        })
    }

    static async verifyPassword(password = null){
        return new Promise(async resolve => {
            if(password) await this.seedPassword(password);

            try {
                let scatter = StorageService.getScatter();
                scatter = AES.decrypt(scatter, store.state.seed);
                store.commit(Actions.SET_SCATTER, scatter);

                if(!scatter.hasOwnProperty('keychain')) throw new Error();

                scatter = Scatter.fromJson(scatter);
                scatter.decrypt(store.state.seed);
                store.dispatch(Actions.SET_SCATTER, scatter);
                resolve(true);
            } catch(e) {
                resolve(false);
                SocketService.closeAll();
            }
        })
    }

    static async changePassword(newPassword){
        return new Promise(async resolve => {

            const oldSeed = store.state.seed;

            // Setting a new salt every time the password is changed.
            await StorageService.setSalt(Hasher.insecureHash(IdGenerator.text(32)));
            const [newMnemonic, newSeed] = await Mnemonic.generateMnemonic(newPassword);

            // Re-encrypting keypairs
            const scatter = store.state.scatter.clone();
            scatter.keychain.keypairs.map(keypair => {
                keypair.decrypt(oldSeed);
                keypair.encrypt(newSeed);
            });
            scatter.keychain.identities.map(id => {
                id.decrypt(oldSeed);
                id.encrypt(newSeed);
            });

            //TODO: Prompt mnemonic

            await store.commit(Actions.SET_SEED, newSeed);
            await store.dispatch(Actions.SET_SCATTER, scatter);
            resolve(newMnemonic);

        })
    }

}
