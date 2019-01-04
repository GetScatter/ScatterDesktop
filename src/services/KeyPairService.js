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
import IdGenerator from "../util/IdGenerator";
import BalanceService from "./BalanceService";

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
        keypair.loose = false;
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

    static async loadFromHardware(keypair, tries = 0){
        console.log(typeof keypair.external.interface.getPublicKey);
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

	static async checkMnemonicKeys(){
        let foundAllKeys = false;
        while(!foundAllKeys){
	        const keypair = Keypair.placeholder();
	        keypair.name = `Key-${IdGenerator.text(8)}`;
	        await this.generateKeyPair(keypair);
	        await this.makePublicKeys(keypair);
	        if(await this.isFullKey(keypair)){
	            await this.saveKeyPair(keypair);
	            await AccountService.importAllAccounts(keypair);
            } else {
	            foundAllKeys = true;
            }
        }
    }

	static async isFullKey(keypair){
        const networks = store.state.scatter.settings.networks;
        return (await Promise.all(keypair.publicKeys.map(async k => {
	        const plugin = PluginRepository.plugin(k.blockchain);
	        let accounts = [];
	        await AccountService.accountsFrom(
		        plugin,
		        networks.filter(x => x.blockchain === k.blockchain),
		        accounts,
		        keypair
	        );

	        // If EOSIO and finds accounts on chains, then key is used.
	        if(k.blockchain === Blockchains.EOSIO && accounts.length) return true;

	        return (await Promise.all(accounts.map(async account => {
		        const systemBalance = await plugin.balanceFor(account, account.network().systemToken());
		        return systemBalance.amount > 0;
	        }))).some(x => x);
        }))).some(x => x);
    }
    
}