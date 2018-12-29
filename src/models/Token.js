import IdGenerator from "../util/IdGenerator";
import PluginRepository from "../plugins/PluginRepository";
import {Blockchains} from "./Blockchains";
import {store} from "../store/store";
import BigNumber from "bignumber.js";

export default class Token {

    constructor(blockchain = Blockchains.EOSIO, contract = '', symbol = '', name = null, decimals = null, chainId = ''){
        this.id = IdGenerator.text(24);
        this.blockchain = blockchain;
        this.contract = contract;
        this.symbol = symbol;
        this.name = name ? name : symbol;
	    this.decimals = decimals ? decimals : PluginRepository.plugin(blockchain).defaultDecimals();

	    this.amount = 0;

	    this.chainId = chainId;
	    this.unusable = null;
    }

    static placeholder(){ return new Token(); }
    static fromJson(json){
	    const p = Object.assign(this.placeholder(), json);
	    if(!json.hasOwnProperty('name') || !json.name.length) p.name = json.symbol;
	    return p;
    }
    static fromUnique(unique){
    	const p = this.placeholder();
    	const [blockchain, contract, symbol, chainId] = unique.split(':');
    	p.blockchain = blockchain;
    	p.contract = contract;
    	p.symbol = symbol.toUpperCase();
    	p.chainId = chainId;
    	p.decimals = PluginRepository.plugin(blockchain).defaultDecimals();
    	return p;
    }

	clone(){ return Token.fromJson(JSON.parse(JSON.stringify(this))) }

    unique(){ return `${this.blockchain}:${this.contract.toLowerCase()}:${this.symbol.toLowerCase()}` }
    uniqueWithChain(includeUnusable = true){ return `${this.blockchain}:${this.contract.toLowerCase()}:${this.symbol.toLowerCase()}:${this.chainId}${includeUnusable && this.unusable ? `:${this.unusable}` : ''}` }
    identifiable(){ return `${this.blockchain}:${this.contract.toLowerCase()}` }

    add(quantity){
	    this.amount = (parseFloat(this.amount) + parseFloat(quantity)).toFixed(this.decimals);
    }

    network(){
    	const networks = store.state.scatter.settings.networks;
    	if(!this.chainId || !this.chainId.length) return networks.find(x => x.unique() === PluginRepository.plugin(this.blockchain).getEndorsedNetwork().unique());
    	return networks.find(x => x.blockchain === this.blockchain && x.chainId === this.chainId);
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

	fiatBalance(withSymbol = true, price = null){
    	const unusableReplacement = this.uniqueWithChain().replace(`:${this.unusable}`, '');
		if(store.state.prices.hasOwnProperty(this.uniqueWithChain())){
			price = price ? price : parseFloat(store.state.prices[this.uniqueWithChain()][store.getters.displayCurrency]);
			return `${parseFloat(price * parseFloat(this.amount)).toFixed(4)} ${withSymbol ? store.getters.displayCurrency : ''}`;
		}
		else if(this.unusable && store.state.prices.hasOwnProperty(unusableReplacement)){
			price = price ? price : parseFloat(store.state.prices[unusableReplacement][store.getters.displayCurrency]);
			return `${parseFloat(price * parseFloat(this.amount)).toFixed(4)} ${withSymbol ? store.getters.displayCurrency : ''}`;
		}

		else {
			return null;
		}
	}

	fiatPrice(withSymbol = true){
		if(store.state.prices.hasOwnProperty(this.uniqueWithChain())){
			const price = parseFloat(store.state.prices[this.uniqueWithChain()][store.getters.displayCurrency]);
			return `${parseFloat(price).toFixed(4)} ${withSymbol ? store.getters.displayCurrency : ''}`
		} else {
			return null;
		}
	}

	totalBalance(){
		if(store.getters.totalBalances.totals.hasOwnProperty(this.uniqueWithChain())){
			return store.getters.totalBalances.totals[this.uniqueWithChain()];
		} else {
			return null;
		}
	}

	symbolClass(){
    	const iconSearch = `${this.blockchain}-${this.symbol}`.toLowerCase();
    	const icons = ['eth-tusd', 'btc-btc', 'eos-eos', 'eth-dai', 'trx-trx', 'eth-eth'];
    	return icons.includes(iconSearch) ? `token-icon token-${iconSearch}` : null;
	}

	truncatedSymbol(){
		return this.symbol.length > 4 ? this.symbol[0] : this.symbol
	}
}