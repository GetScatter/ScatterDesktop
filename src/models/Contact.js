import IdGenerator from '../util/IdGenerator'
import {Blockchains} from './Blockchains';

export default class Contact {

    constructor(_name = '', _recipient = '', _blockchain = Blockchains.EOSIO){
        this.id = IdGenerator.text(24);
        this.name = _name;
        this.recipient = _recipient;
        this.blockchain = _blockchain;
    }

    static placeholder(){ return new Contact(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }

    unique(){ return `${this.blockchain}::${this.recipient}::${this.name}`.toLowerCase().trim(); }
	clone(){ return Contact.fromJson(JSON.parse(JSON.stringify(this))) }

}