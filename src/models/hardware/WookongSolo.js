import PopupService from '../../services/PopupService';
import { Popup } from '../popups/Popup';
import { getPublicKey, signTransaction } from "wookong-solo";

const cache = {};

export default class WookongSolo {
    constructor(blockchain){
        console.log("wookong constructor");
        this.blockchain = blockchain;
        this.init();
    }

    static typeToInterface(blockchain){
        console.log("wookong typeToInterface");
        if(!cache.hasOwnProperty(blockchain)) cache[blockchain] = new WookongSolo(blockchain);
        return cache[blockchain];
    };

    async init(){
        this.canConnect = async () => {
            console.log("wookong canConnect");
            return true;
        };
        this.getPublicKey = async () => {
            console.log("wookong getPublicKey");
            const publicKey = await getPublicKey();

            console.log("publicKey: " + publicKey);
            return publicKey;
        };
        this.sign = async (publicKey, rawTxHex, abi) => {
            console.log("wookong sign");
            console.log('rawTxHex is:', JSON.stringify(rawTxHex));
            console.log('rawTxHex.buf is:', JSON.stringify(rawTxHex.buf));
            let res = {};
            try {
                res = await signTransaction(rawTxHex);
            } catch (error) {
                console.log('sign exception: ', error);
            }

            console.log("res payload" + res.payload);
            return res.payload;
        }
    }
}