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
        const plugin = PluginRepository.plugin(keypair.blockchain);
        return plugin.validPrivateKey(keypair.privateKey);
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
                        keypair.publicKeys.push({blockchain, key:plugin.privateToPublic(keypair.privateKey, keypair.fork)});
                    } catch(e){}
                });

                resolve(true);
            },100)
        })
    }

    static async generateKeyPair(keypair){
        keypair.privateKey = await Crypto.generatePrivateKey();
        keypair.keyHash = Crypto.bufferToHash(keypair.privateKey);
        return true;
    }

    static saveKeyPair(keypair, callback){
        const scatter = store.state.scatter.clone();

        if(!keypair.name.length)
            return PopupService.push(Popup.prompt('Invalid Name', 'The name you have entered is invalid', 'ban', 'Okay'));
        if(scatter.keychain.keypairs.find(x => x.keyHash === keypair.keyHash))
            return PopupService.push(Popup.prompt('Key Exists', 'This key already exists', 'ban', 'Okay'));
        if(scatter.keychain.getKeyPairByName(keypair.name))
            return PopupService.push(Popup.prompt('Name Exists', 'There is already a key with this name', 'ban', 'Okay'));

        scatter.keychain.keypairs.push(Keypair.fromJson(keypair));
        store.dispatch(Actions.SET_SCATTER, scatter).then(() => callback());
    }

    static updateKeyPair(keypair, callback){
        const scatter = store.state.scatter.clone();

        if(!keypair.name.length)
            return PopupService.push(Popup.prompt('Invalid Keypair Name', 'The keypair name you have entered is invalid', 'ban', 'Okay'));

        scatter.keychain.keypairs.find(x => x.unique() === keypair.unique()).name = keypair.name;
        store.dispatch(Actions.SET_SCATTER, scatter).then(() => callback());
    }

    static removeKeyPair(keypair, callback){
        const scatter = store.state.scatter.clone();
        scatter.keychain.removeKeyPair(keypair);
        store.dispatch(Actions.SET_SCATTER, scatter).then(() => callback());
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
                blockchain:Keypair.blockchain(publicKey),
                publicKey,
                privateKey:identity.privateKey
            });
        }

        return null;
    }

    static isHardware(publicKey){
        const keypair = this.getKeyPairFromPublicKey(publicKey);
        if(!keypair) throw new Error('Keypair doesnt exist on keychain');
        return keypair.external !== null;
    }

    static publicToPrivate(publicKey){
        const keypair = this.getKeyPairFromPublicKey(publicKey, true);
        if(keypair) return keypair.privateKey;
        return null;
    }
    
}