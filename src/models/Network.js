import {Blockchains, BlockchainsArray} from './Blockchains';
import IdGenerator from '../util/IdGenerator';

export default class Network {
    constructor(_name = '', _protocol = 'https', _host = '', _port = 0, blockchain = Blockchains.EOSIO, chainId = ''){
        this.id = IdGenerator.numeric(12);
        this.name = _name;
        this.protocol = _protocol;
        this.host = _host;
        this.port = _port;
        this.blockchain = blockchain;
        this.chainId = chainId.toString();

        this.fromOrigin = null;
        this.createdAt = +new Date();
    }

    static placeholder(){ return new Network(); }

    static fromJson(json){
        const p = Object.assign(Network.placeholder(), json);
        p.chainId = p.chainId ? p.chainId.toString() : '';
        return p;
    }

    static fromUnique(netString){
        const blockchain = netString.split(':')[0];
        if(netString.indexOf(':chain:') > -1)
            return new Network('', '', '','',blockchain, netString.replace(`${blockchain}:chain:`,''));

        const splits = netString.replace(`${blockchain}:`, '').split(':');
        return new Network('', '', splits[0], parseInt(splits[1] || 80), blockchain)
    }

    unique(){ return (`${this.blockchain}:` + (this.chainId.length ? `chain:${this.chainId}` : `${this.host}:${this.port}`)).toLowerCase(); }
    hostport(){ return `${this.host}${this.port ? ':' : ''}${this.port}` }
    fullhost(){ return `${this.protocol}://${this.host}${this.port ? ':' : ''}${this.port}` }
    clone(){ return Network.fromJson(JSON.parse(JSON.stringify(this))) }
    isEmpty(){ return !this.host.length; }
    isValid(){
        if(!BlockchainsArray.map(x => x.value).includes(this.blockchain)) return false;
        return (this.host.length && this.port) || this.chainId.length
    }
    filledNetwork(){
        return this.name.length && this.port.toString().length && this.chainId.length && this.host.length
    }
    setPort(){
        if(!this.port) this.port = 80;
        if(![80,443].includes(parseInt(this.port))) return;
        this.port = this.protocol === 'http' ? 80 : 443;
    }
}