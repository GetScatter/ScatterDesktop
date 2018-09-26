import QRCode from 'qrcode';
import StorageService from '../services/StorageService';
import PopupService from '../services/PopupService';
import PasswordService from '../services/PasswordService';
import KeyPairService from '../services/KeyPairService';
import {Popup} from '../models/popups/Popup'
import AES from 'aes-oop';
import {store} from '../store/store'
import Mnemonic from '../util/Mnemonic'

export default class QRService {

    static createQR(data){
        return new Promise(resolve => {
            PopupService.push(Popup.textPrompt(
                'Enter a PIN',
                'You can either leave this blank to use your existing password as the encryption key or enter a new one to re-encrypt it with.',
                'key',
                'Okay', {placeholder:'Enter a Password or PIN', type:'password'}, async pass => {
                    if(!pass || !pass.length) {
                        resolve(QRCode.toDataURL(JSON.stringify({data, salt: StorageService.getSalt()}), {errorCorrectionLevel: 'L'}));
                    } else {

                        PopupService.push(Popup.textPrompt(
                            'Confirm Password',
                            'Since you want to use a different PIN, you must confirm your password first.',
                            'lock',
                            'Okay', {placeholder:'Confirm your current Password', type:'password'}, async confirm => {
                                const confirmed = await PasswordService.verifyPassword(confirm, false);
                                if(!confirmed) return resolve(null);

                                const oldSeed = store.state.seed;
                                const newSeed = (await Mnemonic.generateMnemonic(pass, StorageService.getSalt()))[1];
                                const dData = AES.encrypt(AES.decrypt(data, oldSeed), newSeed);
                                resolve(QRCode.toDataURL(JSON.stringify({data:dData, salt: StorageService.getSalt()}), {errorCorrectionLevel: 'L'}));
                            }))




                    }

            }))
        })
    }

    static async createUnEncryptedQR(data){
        return QRCode.toDataURL(JSON.stringify(data), {errorCorrectionLevel: 'L'});
    }

    static async decryptQR(data, salt, password){
        const [mnemonic, seed] = await Mnemonic.generateMnemonic(password, salt);
        return AES.decrypt(data, seed);
    }

}