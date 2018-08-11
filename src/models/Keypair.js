import AES from 'aes-oop';
import {Blockchains} from './Blockchains';
import IdGenerator from '../util/IdGenerator';
import ExternalWallet from './ExternalWallet';

export default class Keypair {

    constructor(){
        this.id = IdGenerator.text(24);
        this.blockchain = Blockchains.EOS;
        this.name = '';
        this.privateKey = '';
        this.publicKey = '';

        this.external = null;
    }

    static placeholder(){ return new Keypair(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('external') && !!json.external) p.external = ExternalWallet.fromJson(json.external);
        return p;
    }

    unique(){ return `${this.blockchain}:${this.publicKey.toLowerCase()}`; }
    clone(){ return Keypair.fromJson(JSON.parse(JSON.stringify(this))) }

    static blockchain(publicKey){
        if(publicKey.indexOf('EOS') !== -1) return Blockchains.EOS;
        if(publicKey.indexOf('TLOS') !== -1) return Blockchains.TLOS;
        if(publicKey.indexOf('0x') !== -1 && publicKey.length === 42) return Blockchains.ETH;
        return null;
    }

    /***
     * Checks whether a private key is encrypted
     * @returns {boolean}
     */
    isEncrypted(){ switch(this.blockchain) {
        // EOS private keys are 51 chars long
        case Blockchains.EOS: return this.privateKey.length > 51;
        // ETH private keys are 64 chars long
        case Blockchains.ETH: return this.privateKey.length > 64;
        // TLOS private keys are 51 chars long
        case Blockchains.TLOS: return this.privateKey.length > 51;
    }}

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
        if(this.isEncrypted())
            this.privateKey = AES.decrypt(this.privateKey, seed);
    }
}