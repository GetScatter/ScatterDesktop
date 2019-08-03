import AES from 'aes-oop';
import {blockchainName, Blockchains} from './Blockchains';
import IdGenerator from '../util/IdGenerator';
import Crypto from '../util/Crypto';
import ExternalWallet from './hardware/ExternalWallet';
import StoreService from "../services/utility/StoreService";

export default class Keypair {

    constructor(blockchains){
        this.id = IdGenerator.text(24);
        this.name = '';
        this.privateKey = '';

        this.external = null;
        this.fork = null;

        this.publicKeys = [];
        this.blockchains = blockchains ? blockchains : [Blockchains.EOSIO, Blockchains.ETH, Blockchains.TRX];

        this.createdAt = +new Date();
    }

    static placeholder(blockchains){ return new Keypair(blockchains); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('external') && !!json.external) p.external = ExternalWallet.fromJson(json.external);
        return p;
    }

    resetExternal(){
        this.external.interface.close();
        this.external.interface.open();
        // this.external = ExternalWallet.fromJson(this.external);
    }

    accounts(unique = false){
        const accounts = StoreService.get().state.scatter.keychain.accounts.filter(x => x.keypairUnique === this.unique());
	    if(!unique) return accounts;
	    return accounts.reduce((acc, account) => {
		    if(!acc.find(x => account.network().unique() === x.network().unique()
			    && account.sendable() === x.sendable())) acc.push(account);
		    return acc;
	    }, [])

    }

    enabledKey(){
        return this.publicKeys.find(x => x.blockchain === this.blockchains[0]);
    }

	isUnique(){
		return !StoreService.get().getters.keypairs.find(x => {
			return x.enabledKey().key === this.enabledKey().key
		})
	}

	setName(){
		this.name = `${blockchainName(this.enabledKey().blockchain)} Key - ${new Date().toDateString()} - ${IdGenerator.text(4)}`
	}

    unique(){ return this.id; }
    clone(){ return Keypair.fromJson(JSON.parse(JSON.stringify(this))) }

    /***
     * Checks whether a private key is encrypted
     * @returns {boolean}
     */
    isEncrypted(){
        return typeof this.privateKey === 'string' && this.privateKey.length > 100;
    }

    /***
     * Encrypts this Keypair's Private Key
     * @param seed - The seed to encrypt with
     */
    encrypt(seed){
        if(!this.isEncrypted())
            this.privateKey = AES.encrypt(this.privateKey, seed);
    }

    /***
     * Decrypts this Keypair's Private Key
     * @param seed - The seed to decrypt with
     */
    decrypt(seed){
        if(this.isEncrypted()) {
            this.privateKey = AES.decrypt(this.privateKey, seed);
            if(typeof this.privateKey === 'object' && this.privateKey.hasOwnProperty('data')) this.privateKey = this.privateKey.data;
        }
    }
}