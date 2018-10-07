import {BlockchainsArray, Blockchains} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants';

import PopupService from '../services/PopupService'
import {Popup} from '../models/popups/Popup'

import Crypto from '../util/Crypto';
import {store} from '../store/store';
import Keypair from '../models/Keypair';
import Account from '../models/Account'

export default class KeyPairService {

    static isValidPrivateKey(keypair){
        let valid = false;
        BlockchainsArray.map(blockchainKV => {
            if(valid) return;
            try {
                const plugin = PluginRepository.plugin(blockchainKV.value);
                valid = plugin.validPrivateKey(keypair.privateKey);
            } catch(e){}
        });
        return valid;
    }

    static convertHexPrivateToBuffer(keypair){
        if(typeof keypair.privateKey !== 'string') return false;
        let buffered = false;
        BlockchainsArray.map(blockchainKV => {
            if(buffered) return;
            try {
                const plugin = PluginRepository.plugin(blockchainKV.value);
                if(plugin.validPrivateKey(keypair.privateKey)){
                    keypair.privateKey = plugin.hexPrivateToBuffer(keypair.privateKey);
                    buffered = true;
                }
            } catch(e){}
        });
    }

    /***
     * Tries to make a keypair in place from a private key
     * @param keypair
     * @returns {Promise.<void>}
     */
    static async makePublicKeys(keypair){
        return new Promise((resolve) => {
            setTimeout(() => {
                if(keypair.isEncrypted()) return;
                keypair.publicKeys = [];

                BlockchainsArray.map(blockchainKV => {
                    try {
                        const blockchain = blockchainKV.value;
                        const plugin = PluginRepository.plugin(blockchain);
                        let p = keypair.privateKey;
                        if(typeof p !== 'string') p = plugin.bufferToHexPrivate(p);
                        keypair.publicKeys.push({blockchain, key:plugin.privateToPublic(p, keypair.fork)});
                    } catch(e){}
                });

                resolve(true);
            },100)
        })
    }

    static async generateKeyPair(keypair){
        keypair.privateKey = await Crypto.generatePrivateKey();
        keypair.hash();
        return true;
    }

    static async saveKeyPair(keypair){
        const scatter = store.state.scatter.clone();
        scatter.keychain.keypairs.push(Keypair.fromJson(keypair));
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static updateKeyPair(keypair){
        const scatter = store.state.scatter.clone();
        scatter.keychain.keypairs.find(x => x.unique() === keypair.unique()).name = keypair.name;
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async removeKeyPair(keypair){
        const scatter = store.state.scatter.clone();
        scatter.keychain.removeKeyPair(keypair);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static getKeyPairFromPublicKey(publicKey, decrypt = false){
        const keypair = store.state.scatter.keychain.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey));
        if(keypair) {
            if(decrypt) keypair.decrypt(store.state.seed);
            return keypair;
        }

        const identity = store.state.scatter.keychain.identities.find(x => x.publicKey === publicKey);
        if(identity) {
            if(decrypt) identity.decrypt(store.state.seed);
            return Keypair.fromJson({
                name:identity.name,
                publicKeys:[{blockchain:Blockchains.EOSIO, key:publicKey}],
                privateKey:identity.privateKey
            });
        }

        return null;
    }

    static publicToPrivate(publicKey){
        const keypair = this.getKeyPairFromPublicKey(publicKey, true);
        if(keypair) return keypair.privateKey;
        return null;
    }

    static isHardware(publicKey){
        const keypair = this.getKeyPairFromPublicKey(publicKey);
        if(!keypair) throw new Error('Keypair doesnt exist on keychain');
        return keypair.external !== null;
    }

    static async loadFromHardware(keypair){
        return keypair.external.interface.getPublicKey().then(key => {
            if(PluginRepository.plugin(keypair.external.blockchain).validPublicKey(key)){
                keypair.external.publicKey = key;
                keypair.publicKeys.push({blockchain:keypair.external.blockchain, key});
                keypair.hash();
                return true;
            } else return false;
        }).catch(() => {
            return false;
        })
    }
    
}