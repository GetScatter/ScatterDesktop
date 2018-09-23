import IdGenerator from '../util/IdGenerator'
import {Blockchains} from './Blockchains';

export default class Contact {

    constructor(_name = '', _recipient = ''){
        this.id = IdGenerator.text(24);
        this.name = _name;
        this.recipient = _recipient;
    }

    static placeholder(){ return new Contact(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }

}