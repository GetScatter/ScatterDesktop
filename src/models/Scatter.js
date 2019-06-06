import Meta from './Meta';
import Keychain from './Keychain';
import Settings from './Settings';
import AES from 'aes-oop';
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'
import Recurring from "./Recurring";
import PluginRepository from "../plugins/PluginRepository";
import Identity, {LocationInformation} from "./Identity";
import Contact from "./Contact";
import Keypair from "./Keypair";

export default class Scatter {

    constructor(){
        this.meta = Meta.placeholder();
        this.keychain = Keychain.placeholder();
        this.settings = Settings.placeholder();
        this.contacts = [];
        this.hash = Hasher.unsaltedQuickHash(IdGenerator.text(2048));

        this.recurring = Recurring.placeholder();

        this.toured = false;
        this.onboarded = false;

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
	    scatter.keychain.locations = [LocationInformation.fromJson({name:'Home'})];
	    firstIdentity.location = scatter.keychain.locations[0];

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

	    if(json.hasOwnProperty('contacts')) p.contacts = json.contacts.map(x => Contact.fromJson(x));

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
        // Encrypting in-place.
        this.keychain.cards.map(card => card.encrypt(seed));
        this.keychain.keypairs.map(keypair => keypair.encrypt(seed));
        this.keychain.identities.map(id => id.encrypt(seed));

        // Encrypting clone
        const clone = this.clone();
        clone.encrypt(seed);
        return clone;
    }
}
