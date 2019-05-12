import {Blockchains, BlockchainsArray} from './Blockchains';
import IdGenerator from '../util/IdGenerator';
import Token from "./Token";
import PluginRepository from "../plugins/PluginRepository";
import StoreService from "../services/utility/StoreService";

export default class Network {
    constructor(_name = '', _protocol = 'https', _host = '', _port = 0, blockchain = Blockchains.EOSIO, chainId = '', _path = ''){
        this.id = IdGenerator.numeric(12);
        this.name = _name;
        this.protocol = _protocol;
        this.host = _host;
        this.port = _port;
        this.path = _path;
        this.blockchain = blockchain;
        this.chainId = chainId.toString();

        this.fromOrigin = null;
        this.createdAt = +new Date();

        this.token = null;
    }

    static placeholder(){ return new Network(); }

    static fromJson(json){
        const p = Object.assign(Network.placeholder(), json);
        p.chainId = p.chainId ? p.chainId.toString() : '';
        p.token = json.hasOwnProperty('token') && json.token ? Token.fromJson(json.token) : null;
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
    fullhost(){ return `${this.protocol}://${this.host}${this.port ? ':' : ''}${this.port}${this.path ? this.path : ''}` }
    clone(){ return Network.fromJson(JSON.parse(JSON.stringify(this))) }

    isValid(){
        if(!BlockchainsArray.map(x => x.value).includes(this.blockchain)) return false;
        return this.host.length && this.port.toString().length && this.chainId.length
    }

    setPort(){
        if(!this.port) this.port = 80;
        if(![80,443].includes(parseInt(this.port))) return;
        this.port = this.protocol === 'http' ? 80 : 443;
    }

	systemToken(){
        if(this.token) return this.token;
        const token = PluginRepository.plugin(this.blockchain).defaultToken();
        token.chainId = this.chainId;
        return token;
	}

	accounts(unique = false){
		const accounts = StoreService.get().getters.accounts.filter(x => x.networkUnique === this.unique());
		if(!unique) return accounts;
		return accounts.reduce((acc, account) => {
			if(!acc.find(x => account.network().unique() === x.network().unique()
				&& account.sendable() === x.sendable())) acc.push(account);
			return acc;
		}, [])

	}
}