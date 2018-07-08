import * as Actions from './ApiActions';

export default class Action {

    constructor(_type = '', _payload = {}, _resolver = '', _domain = ''){
        this.type = _type;
        this.payload = _payload;
    }

    static placeholder(){ return new Action(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }

    error(payload){ return new Action('error', payload); }
}