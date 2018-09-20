import ecc from 'eosjs-ecc';
const {PrivateKey} = ecc;
import bip39 from 'bip39'

import PluginRepository from '../plugins/PluginRepository';

export default class Crypto {

    static async generatePrivateKey(){
        return (await PrivateKey.randomKey()).toBuffer();
    }

    static bufferToPrivateKey(buffer, blockchain){
        return PluginRepository.plugin(blockchain).bufferToHexPrivate(buffer);
        // if(blockchain === 'eos' ) return PrivateKey.fromBuffer(buffer).toString()
        // else return buffer.toString('hex');
    }

    static privateKeyToBuffer(privateKey, blockchain){
        return PluginRepository.plugin(blockchain).hexPrivateToBuffer(privateKey);
        // if(blockchain === 'eos') return new PrivateKey(privateKey).toBuffer();
        // else return Buffer.from(privateKey, 'hex');
    }

    static bufferToHash(buffer){
        return ecc.sha256(buffer);
    }

}