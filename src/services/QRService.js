import QRCode from 'qrcode';
import StorageService from '../services/StorageService';

export default class QRService {

    static createQR(data){
        const qrData = JSON.stringify({data, salt:StorageService.getSalt()});
        return QRCode.toDataURL(qrData,{ errorCorrectionLevel: 'L' });
    }

}