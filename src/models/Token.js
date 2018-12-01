import IdGenerator from "../util/IdGenerator";
import PluginRepository from "../plugins/PluginRepository";
import {Blockchains} from "./Blockchains";
import {store} from "../store/store";
import BigNumber from "bignumber.js";

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
    identifiable(){ return `${this.blockchain}:${this.contract.toLowerCase()}` }

    add(quantity){
	    this.amount = (parseFloat(this.amount) + parseFloat(quantity)).toFixed(this.decimals);
    }

    needsContract(){
    	switch(this.blockchain){
		    case Blockchains.TRX: return false;
		    default: return true;
	    }
    }

    formatted(){
    	return `${this.amount} ${this.symbol}`;
    }

	fiatBalance(){
		if(store.state.prices.hasOwnProperty(this.unique())){
			const price = parseFloat(store.state.prices[this.unique()][store.getters.displayCurrency]);
			return `${parseFloat(price * parseFloat(this.amount)).toFixed(2)} ${store.getters.displayCurrency}`;
		} else {
			return null;
		}
	}

	fiatPrice(){
		if(store.state.prices.hasOwnProperty(this.unique())){
			const price = parseFloat(store.state.prices[this.unique()][store.getters.displayCurrency]);
			return `${parseFloat(price).toFixed(2)} ${store.getters.displayCurrency}`
		} else {
			return null;
		}
	}
}