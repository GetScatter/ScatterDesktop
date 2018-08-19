import {BlockchainsArray, Blockchains} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants';

import Alert from '../models/alerts/Alert'
import PopupService from './PopupService'
import {Popup} from '../models/popups/Popup'

import {store} from '../store/store';
import Keypair from '../models/Keypair';

import FileService from './FileService';

export default class KeyPairService {

    static isValidPrivateKey(keypair){
        const plugin = PluginRepository.plugin(keypair.blockchain);
        return plugin.validPrivateKey(keypair.privateKey);
    }

    /***
     * Tries to make a keypair in place from a private key
     * @param keypair
     * @returns {Promise.<void>}
     */
    static async makePublicKey(keypair){
        return new Promise((resolve) => {
            setTimeout(() => {
                if(keypair.privateKey.length < 50) {
                    resolve(false);
                    return false;
                }

                let publicKey = '';

                BlockchainsArray.map(blockchainKV => {
                    try {
                        if(!publicKey.length) {
                            const blockchain = blockchainKV.value;

                            const plugin = PluginRepository.plugin(blockchain);
                            if (plugin && plugin.validPrivateKey(keypair.privateKey)) {
                                publicKey = plugin.privateToPublic(keypair.privateKey, keypair.fork);
                                keypair.blockchain = blockchain;
                            }
                        }
                    } catch(e){}
                });

                if(publicKey) keypair.publicKey = publicKey;
                resolve(true);
            },100)
        })
    }

    static async generateKeyPair(keypair, prefix = null){
        const plugin = PluginRepository.plugin(keypair.blockchain);
        if(!plugin) return false;

        plugin.randomPrivateKey().then(privateKey => {
            const publicKey = plugin.privateToPublic(privateKey, prefix);
            if(plugin.validPublicKey(publicKey, prefix) && plugin.validPrivateKey(privateKey)){
                keypair.publicKey = publicKey;
                keypair.privateKey = privateKey;
            }
        });

        return true;
    }

    static saveKeyPair(keypair, callback){
        const scatter = store.state.scatter.clone();

        if(!keypair.name.length)
            return PopupService.push(Popup.prompt('Invalid Keypair Name', 'The keypair name you have entered is invalid', 'ban', 'Okay'));
        if(scatter.keychain.getKeyPair(keypair))
            return PopupService.push(Popup.prompt('Keypair Exists', 'There is already a keypair with the key', 'ban', 'Okay'));
        if(scatter.keychain.getKeyPairByName(keypair.name))
            return PopupService.push(Popup.prompt('Keypair Exists', 'There is already a keypair with the key', 'ban', 'Okay'));

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

    static importKeyPairWithSeed(callback){
        FileService.importData().then((data) => {
            const keypairAndSeed = data.split(/\|[A-Z]+\|/);
            const keypair = Keypair.fromJson(JSON.parse(keypairAndSeed[0]));
            const seed = keypairAndSeed[1];
            keypair.decrypt(seed);
            this.saveKeyPair(keypair, () => callback(keypair));
        });
    }

    static exportKeyPairWithSeed(keypair, callback){
        const data = JSON.stringify(keypair) + '|SEED|' + store.state.seed;
        const filename = `scatter_keypair_${keypair.id}`;

        FileService.exportData(data, filename).then((success) => callback(success));
    }

    static getKeyPairFromPublicKey(publicKey, decrypt = false){
        const keypair = store.state.scatter.keychain.keypairs.find(x => x.publicKey === publicKey);
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
