import Meta from './Meta';
import Keychain from './Keychain';
import Settings from './Settings';
import AES from 'aes-oop';
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'
import Recurring from "./Recurring";
import PluginRepository from "../plugins/PluginRepository";
import Identity from "./Identity";

export default class Scatter {

    constructor(){
        this.meta = Meta.placeholder();
        this.keychain = Keychain.placeholder();
        this.settings = Settings.placeholder();
        this.contacts = [];
        this.hash = Hasher.unsaltedQuickHash(IdGenerator.text(2048));

        this.recurring = Recurring.placeholder();

        this.toured = false;

        this.pin = null;
        this.pinForAll = false;
    }

    static async create(){
        const scatter = new Scatter();
	    await Promise.all(PluginRepository.signatureProviders().map(async plugin => {
		    const network = plugin.getEndorsedNetwork();
		    scatter.settings.networks.push(network);
	    }));

	    const firstIdentity = Identity.placeholder();
	    await firstIdentity.initialize(scatter.hash);

	    firstIdentity.name = 'MyFirstIdentity';
	    scatter.keychain.updateOrPushIdentity(firstIdentity);
	    return scatter;
    }
    static placeholder(){ return new Scatter(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('meta')) p.meta = Meta.fromJson(json.meta);
        if(json.hasOwnProperty('settings')) p.settings = Settings.fromJson(json.settings);
        if(json.hasOwnProperty('keychain'))
            p.keychain = (typeof json.keychain === 'string')
                ? json.keychain : Keychain.fromJson(json.keychain);

        return p;
    }

    clone(){ return Scatter.fromJson(JSON.parse(JSON.stringify(this))) }

    isEncrypted(){
        return typeof this.keychain !== 'object'
    }

    /***
     * Encrypts the entire keychain
     * @param seed - The seed to encrypt with
     */
    decrypt(seed){
        if(this.isEncrypted()) this.keychain = Keychain.fromJson(AES.decrypt(this.keychain, seed));
    }

    /***
     * Decrypts the entire keychain
     * @param seed - The seed to decrypt with
     */
    encrypt(seed){
        if(!this.isEncrypted()) this.keychain = AES.encrypt(this.keychain, seed);
    }

    savable(seed){
        this.keychain.keypairs.map(keypair => keypair.encrypt(seed));

        const clone = this.clone();
        clone.keychain.identities.map(id => id.encrypt(seed));

        // Keychain is always stored encrypted.
        clone.encrypt(seed);

        return clone;
    }
}
