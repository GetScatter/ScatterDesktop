import ecc from 'eosjs-ecc';
const {PrivateKey} = ecc;

import PluginRepository from '../plugins/PluginRepository';
import {store} from '../store/store'
import Mnemonic from "./Mnemonic";
import {AES} from "aes-oop";
import * as Actions from "../store/constants";

export default class Crypto {

    static async generatePrivateKey(){
        const mnemonic = await this.getRootMnemonic();
        const keyHashes = store.state.scatter.keychain.keypairs.map(x => x.keyHash);

        for(let i = 0; i < 150; i++){
            const seedBuf = Mnemonic.mnemonicKey(mnemonic, i);
	        const buffer = (await PrivateKey.fromBuffer(seedBuf)).toBuffer();
	        const hash = this.bufferToHash(buffer);
	        if(!keyHashes.includes(hash)) return buffer;
        }

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

    static async getRootMnemonic(){
        if(!store.state.scatter.keychain.mnemonic) await this.setRootMnemonic();
        return AES.decrypt(store.state.scatter.keychain.mnemonic, store.state.seed).mnemonic;
    }

    static async setRootMnemonic(mnemonic = null){
        if(!mnemonic) mnemonic = await Mnemonic.randomMnemonic();
        const scatter = store.state.scatter.clone();
        scatter.keychain.mnemonic = AES.encrypt({mnemonic}, store.state.seed);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

}