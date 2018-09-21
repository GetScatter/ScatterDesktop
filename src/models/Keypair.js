import AES from 'aes-oop';
import {Blockchains} from './Blockchains';
import IdGenerator from '../util/IdGenerator';
import ExternalWallet from './ExternalWallet';

export default class Keypair {

    constructor(){
        this.id = IdGenerator.text(24);
        this.name = '';
        this.privateKey = '';
        this.keyHash = '';

        this.external = null;
        this.fork = null;

        this.publicKeys = [];
    }

    static placeholder(){ return new Keypair(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('external') && !!json.external) p.external = ExternalWallet.fromJson(json.external);
        return p;
    }

    unique(){ return this.id; }
    clone(){ return Keypair.fromJson(JSON.parse(JSON.stringify(this))) }

    static blockchain(publicKey){
        if(publicKey.indexOf('EOS') !== -1) return Blockchains.EOSIO;
        if(publicKey.indexOf('0x') !== -1 && publicKey.length === 42) return Blockchains.ETH;
        return null;
    }

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
            if(typeof this.privateKey === 'object') this.privateKey = this.privateKey.data;
        }
    }
}