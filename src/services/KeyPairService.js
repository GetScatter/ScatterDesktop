import {BlockchainsArray, Blockchains} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants';

import PopupService from '../services/PopupService'
import {Popup} from '../models/popups/Popup'

import Crypto from '../util/Crypto';
import {store} from '../store/store';
import Keypair from '../models/Keypair';
import Account from '../models/Account'
import AccountService from "./AccountService";
import HardwareService from "./HardwareService";
import {ipcAsync} from "../util/ElectronHelpers";

export default class KeyPairService {

    static getImportedKeyBlockchains(privateKey){
        let blockchains = [];
        BlockchainsArray.map(blockchainKV => {
            try {
                const plugin = PluginRepository.plugin(blockchainKV.value);
                if(plugin.validPrivateKey(privateKey))
                    blockchains.push(blockchainKV.value);
            } catch(e){}
        });
        return blockchains;
    }

    static isValidPrivateKey(keypair){
        return !!this.getImportedKeyBlockchains(keypair.privateKey).length;
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

    static async addOrRemoveBlockchain(keypair, blockchain){

        // Removing
	    if(keypair.blockchains.includes(blockchain)){
		    keypair.blockchains = keypair.blockchains.filter(x => x !== blockchain);
		    const accountsToRemove = keypair.accounts().filter(x => x.blockchain() === blockchain);
		    await AccountService.removeAccounts(accountsToRemove);
		    KeyPairService.updateKeyPair(keypair);
        }

        // Adding
	    else {
		    keypair.blockchains.push(blockchain);
		    await AccountService.importAllAccounts(keypair, false, [blockchain]);
		    KeyPairService.updateKeyPair(keypair);
        }


	    return true;
    }

    static updateKeyPair(keypair){
        if(!keypair.name.length) return;
        const scatter = store.state.scatter.clone();
        scatter.keychain.keypairs.find(x => x.unique() === keypair.unique()).name = keypair.name;
        scatter.keychain.keypairs.find(x => x.unique() === keypair.unique()).blockchains = keypair.blockchains;
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async removeKeyPair(keypair){
        const scatter = store.state.scatter.clone();
        scatter.keychain.removeKeyPair(keypair);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static getKeyPairFromPublicKey(publicKey, decrypt = false){
        const keypair = store.getters.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey));
        if(keypair) return keypair.clone();


        const identity = store.state.scatter.keychain.identities.find(x => x.publicKey === publicKey);
        if(identity) {
            return Keypair.fromJson({
                name:identity.name,
                publicKeys:[{blockchain:Blockchains.EOSIO, key:publicKey}],
                privateKey:identity.privateKey
            });
        }

        return null;
    }

    static async publicToPrivate(publicKey){
        const keypair = this.getKeyPairFromPublicKey(publicKey, true);
        keypair.decrypt(await ipcAsync('seed'));
        if(keypair) return keypair.privateKey;
        return null;
    }

    static async encryptPrivateKey(privateKey) {
	    const keypair = Keypair.fromJson({
		    privateKey
        });
	    keypair.encrypt(await ipcAsync('seed'));
	    return keypair.privateKey;
    }

    static async decryptPrivateKey(encryptedPrivateKey) {
	    const keypair = Keypair.fromJson({
            privateKey:encryptedPrivateKey
        });
	    keypair.decrypt(await ipcAsync('seed'));
	    return keypair.privateKey;
    }


    static async loadFromHardware(keypair, tries = 0){
        if(typeof keypair.external.interface.getPublicKey !== 'function') return false;

        if(tries >= 5) return false;
        return keypair.external.interface.getPublicKey().then(key => {
            if(PluginRepository.plugin(keypair.external.blockchain).validPublicKey(key)){
                keypair.external.publicKey = key;
                keypair.publicKeys.push({blockchain:keypair.external.blockchain, key});
                keypair.hash();
                return true;
            } else return false;
        }).catch(async err => {
            if(err.toString().match('Cannot write to HID device')){
                await HardwareService.openConnections();
                return this.loadFromHardware(keypair, tries++);
            }
            return false;
        })
    }

	static isHardware(publicKey){
		const keypair = this.getKeyPairFromPublicKey(publicKey);
		if(!keypair) throw new Error('Keypair doesnt exist on keychain');
		return keypair.external !== null;
	}
    
}