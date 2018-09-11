import QRCode from 'qrcode';
import StorageService from '../services/StorageService';
import PopupService from '../services/PopupService';
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
                    let qrData = null;

                    if(!pass || !pass.length) {
                        qrData = JSON.stringify({data, salt: StorageService.getSalt()});
                    } else {
                        const oldSeed = store.state.seed;
                        const newSeed = (await Mnemonic.generateMnemonic(pass, StorageService.getSalt()))[1];
                        const dData = AES.encrypt(AES.decrypt(data, oldSeed), newSeed);
                        qrData = JSON.stringify({data:dData, salt: StorageService.getSalt()});
                    }

                    resolve(QRCode.toDataURL(qrData, {errorCorrectionLevel: 'L'}));
            }))
        })
    }

    static async createUnEncryptedQR(data){
        return QRCode.toDataURL(JSON.stringify(data), {errorCorrectionLevel: 'L'});
    }

}