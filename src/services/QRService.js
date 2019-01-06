import QRCode from 'qrcode';
import StorageService from '../services/StorageService';
import PopupService from '../services/PopupService';
import PasswordService from '../services/PasswordService';
import KeyPairService from '../services/KeyPairService';
import {Popup} from '../models/popups/Popup'
import AES from 'aes-oop';
import {store} from '../store/store'
import Mnemonic from '../util/Mnemonic'
import {ipcAsync} from "../util/ElectronHelpers";

export default class QRService {

    static createQR(data, pass = null){
        return new Promise(async resolve => {
	        if(!pass || !pass.length) {
		        resolve(QRCode.toDataURL(JSON.stringify({data, salt: StorageService.getSalt()}), {errorCorrectionLevel: 'L'}));
	        } else {
		        const oldSeed = await ipcAsync('seed');
		        const newSeed = (await Mnemonic.generateMnemonic(pass, StorageService.getSalt()))[1];
		        const dData = AES.encrypt(AES.decrypt(data, oldSeed), newSeed);
		        resolve(QRCode.toDataURL(JSON.stringify({data:dData, salt: StorageService.getSalt()}), {errorCorrectionLevel: 'L'}));
	        }
        })
    }

    static async createUnEncryptedQR(data){
        return QRCode.toDataURL(JSON.stringify(data), {errorCorrectionLevel: 'L'});
    }

    static async decryptQR(data, salt, password){
        const [mnemonic, seed] = await Mnemonic.generateMnemonic(password, salt);
        try {
	        return AES.decrypt(data, seed)
        } catch(e){
        	console.error('Error decrypting QR: ', e);
        	return null;
        }
    }

}