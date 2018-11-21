import ecc from 'eosjs-ecc';
const {PrivateKey} = ecc;

import PluginRepository from '../plugins/PluginRepository';

export default class Crypto {

    static async generatePrivateKey(){
        return (await PrivateKey.randomKey()).toBuffer();
    }

    static bufferToPrivateKey(buffer, blockchain){
        return PluginRepository.plugin(blockchain).bufferToHexPrivate(buffer);
    }

    static privateKeyToBuffer(privateKey, blockchain){
        return PluginRepository.plugin(blockchain).hexPrivateToBuffer(privateKey);
    }

    static bufferToHash(buffer){
        return ecc.sha256(buffer);
    }

}