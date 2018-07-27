import QRCode from 'qrcode';

export default class QRService {

    static createQR(data){
        return QRCode.toDataURL(data,{ errorCorrectionLevel: 'L' });
    }

}