import IdGenerator from "../util/IdGenerator";
import PluginRepository from "../plugins/PluginRepository";
import {Blockchains} from "./Blockchains";

export default class Token {

    constructor(blockchain = Blockchains.EOSIO, contract = '', symbol = '', name = null, decimals = null){
        this.id = IdGenerator.text(24);
        this.blockchain = blockchain;
        this.contract = contract;
        this.symbol = symbol;
        this.name = name ? name : symbol;
	    this.decimals = decimals ? decimals : PluginRepository.plugin(blockchain).defaultDecimals();

	    this.amount = 0;
    }

    static placeholder(){ return new Token(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    static fromUnique(unique){
    	const p = this.placeholder();
    	const [blockchain, contract, symbol] = unique.split(':');
    	p.blockchain = blockchain;
    	p.contract = contract;
    	p.symbol = symbol.toUpperCase();
    	p.decimals = PluginRepository.plugin(blockchain).defaultDecimals();
    	return p;
    }

	clone(){ return Token.fromJson(JSON.parse(JSON.stringify(this))) }

    unique(){ return `${this.blockchain}:${this.contract.toLowerCase()}:${this.symbol.toLowerCase()}` }

    add(quantity){
	    this.amount = (parseFloat(this.amount) + parseFloat(quantity)).toFixed(this.decimals);
    }

    needsContract(){
    	switch(this.blockchain){
		    case Blockchains.TRX: return false;
		    default: return true;
	    }
    }
}