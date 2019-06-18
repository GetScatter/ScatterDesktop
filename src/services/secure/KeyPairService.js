import {BlockchainsArray, Blockchains, blockchainName} from '../../models/Blockchains';
import PluginRepository from '../../plugins/PluginRepository'
import * as Actions from '../../store/constants';

import PopupService from '../utility/PopupService'
import {Popup} from '../../models/popups/Popup'

import Crypto from '../../util/Crypto';
import {store} from '../../store/store';
import Keypair from '../../models/Keypair';
import Account from '../../models/Account'
import AccountService from "../blockchain/AccountService";
import HardwareService from "./HardwareService";
import {ipcAsync} from "../../util/ElectronHelpers";
import StoreService from "../utility/StoreService";
import IdGenerator from "../../util/IdGenerator";

export default class KeyPairService {

    static getImportedKeyBlockchains(privateKey){
        let blockchains = [];
        BlockchainsArray.map(blockchainKV => {
            try {
                const plugin = PluginRepository.plugin(blockchainKV.value);
                if(plugin.validPrivateKey(privateKey)) blockchains.push(blockchainKV.value);
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
                    } catch(e){
                        console.log('err', e);
                    }
                });

                resolve(true);
            },100)
        })
    }

    static async generateKeyPair(keypair){
        keypair.privateKey = await Crypto.generatePrivateKey();
        return true;
    }

    static convertKey(keypair, blockchain){
	    const clone = keypair.clone();
	    clone.id = IdGenerator.text(24);
	    clone.name = `${blockchainName(blockchain)} copy of ${keypair.name}`;
	    clone.blockchains = [blockchain];
	    clone.createdAt = +new Date();
	    return clone;
    }

    static async saveKeyPair(keypair){
        if(!keypair.name.length) keypair.name = `Key-${IdGenerator.text(8)}`;
        if(!keypair.isUnique()) return PopupService.push(Popup.snackbar("Keypair already exists."));
        const scatter = StoreService.get().state.scatter.clone();
        scatter.keychain.keypairs.push(Keypair.fromJson(keypair));
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async updateKeyPair(keypair){
        if(!keypair.name.length) return;
        const scatter = StoreService.get().state.scatter.clone();
        scatter.keychain.keypairs.find(x => x.unique() === keypair.unique()).name = keypair.name;
        scatter.keychain.keypairs.find(x => x.unique() === keypair.unique()).blockchains = keypair.blockchains;
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async removeKeyPair(keypair){
        const scatter = StoreService.get().state.scatter.clone();
        scatter.keychain.removeKeyPair(keypair);
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static getKeyPairFromPublicKey(publicKey, decrypt = false){
        const keypair = StoreService.get().getters.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey));
        if(keypair) return keypair.clone();


        const identity = StoreService.get().state.scatter.keychain.identities.find(x => x.publicKey === publicKey);
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

    static async getHardwareKeyList(external, delta = 0, tries = 0){
	    if(typeof external.interface.getAddress !== 'function') return false;
	    if(tries >= 5) return false;

	    return external.interface.getAddress(delta).catch(async err => {
		    if(err.toString().match('CLA_NOT_SUPPORTED') || err.toString().match('Cannot write to HID device')){
			    await HardwareService.openConnections();
			    return this.getHardwareKeyList(external, delta, tries++);
		    }
		    return false;
	    })
    }


    static async loadFromHardware(keypair, tries = 0){
        if(typeof keypair.external.interface.getPublicKey !== 'function') return false;
        if(tries >= 5) return false;

        return keypair.external.interface.getPublicKey().then(key => {
            if(PluginRepository.plugin(keypair.external.blockchain).validPublicKey(key)){
                keypair.external.publicKey = key;
                keypair.publicKeys.push({blockchain:keypair.external.blockchain, key});
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