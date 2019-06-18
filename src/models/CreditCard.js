import AES from 'aes-oop';
import IdGenerator from '../util/IdGenerator';
import Crypto from '../util/Crypto';
import StoreService from "../services/utility/StoreService";
import Settings from "./Settings";

export class CreditCardSecureProperties {

    constructor(){
        this.number = '';
        this.cvx = '';
        this.authTokens = {};
    }

	static placeholder(){ return new CreditCardSecureProperties(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }
	clone(){ return CreditCardSecureProperties.fromJson(JSON.parse(JSON.stringify(this))) }

}

export default class CreditCard {

    constructor(){
        this.id = IdGenerator.text(24);
        this.identityId = null;
        this.locationId = null;
        this.name = '';
        this.lastFour = '';
        this.expiration = '';
        this.cardHash = '';

        this.secure = CreditCardSecureProperties.placeholder();

        this.createdAt = +new Date();
    }

    static placeholder(){ return new CreditCard(); }
    static fromJson(json){
	    let p = Object.assign(this.placeholder(), json);
	    if(json.hasOwnProperty('secure')) p.secure = CreditCardSecureProperties.fromJson(json.secure);
	    return p;
    }
	unique(){ return this.id; }
	clone(){ return CreditCard.fromJson(JSON.parse(JSON.stringify(this))) }
    hash(){ this.cardHash = Crypto.bufferToHash(this.secure.number); }

    isEncrypted(){
        return typeof this.secure === 'string' && this.secure.length > 100;
    }

    encrypt(seed){
        if(!this.isEncrypted()) this.secure = AES.encrypt(this.secure, seed);
    }

    decrypt(seed){
        if(this.isEncrypted()) this.secure = AES.decrypt(this.secure, seed);
    }

    identity(){
        return StoreService.get().getters.identities.find(x => x.id === this.identityId);
    }
}