import IdGenerator from "../util/IdGenerator";
import PluginRepository from "../plugins/PluginRepository";
import {Blockchains, BlockchainsArray} from "./Blockchains";
import StoreService from "../services/utility/StoreService";

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

	    this.fromOrigin = '';
	    this.createdAt = +new Date();
    }

    isValid(){
    	if(Object.keys(this).length !== 11) return false;
    	return BlockchainsArray.map(x => x.value).includes(this.blockchain) &&
		    this.contract.length &&
		    this.symbol.length &&
		    this.name.length &&
		    this.decimals.toString().length &&
		    this.chainId.length
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
    	p.symbol = symbol ? symbol.toUpperCase() : 'INVALID_TOKEN';
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
    	const networks = StoreService.get().state.scatter.settings.networks;
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
		if(StoreService.get().state.prices.hasOwnProperty(this.uniqueWithChain())){
			price = price ? price : parseFloat(StoreService.get().state.prices[this.uniqueWithChain()][StoreService.get().getters.displayCurrency]);
			return `${parseFloat(price * parseFloat(this.amount)).toFixed(4)} ${withSymbol ? StoreService.get().getters.displayCurrency : ''}`;
		}
		else if(this.unusable && StoreService.get().state.prices.hasOwnProperty(unusableReplacement)){
			price = price ? price : parseFloat(StoreService.get().state.prices[unusableReplacement][StoreService.get().getters.displayCurrency]);
			return `${parseFloat(price * parseFloat(this.amount)).toFixed(4)} ${withSymbol ? StoreService.get().getters.displayCurrency : ''}`;
		}

		else {
			return null;
		}
	}

	fiatPrice(withSymbol = true){
		if(StoreService.get().state.prices.hasOwnProperty(this.uniqueWithChain())){
			const price = parseFloat(StoreService.get().state.prices[this.uniqueWithChain()][StoreService.get().getters.displayCurrency]);
			return `${parseFloat(price).toFixed(4)} ${withSymbol ? StoreService.get().getters.displayCurrency : ''}`
		} else {
			return null;
		}
	}

	baseTokenPrice(withSymbol = true){
		if(StoreService.get().state.prices.hasOwnProperty(this.uniqueWithChain())){
			const systemToken = this.network().systemToken();
			if(this.uniqueWithChain(false) === systemToken.uniqueWithChain(false)) return null;
			const baseTokenPrice = parseFloat(StoreService.get().state.prices[systemToken.uniqueWithChain()][StoreService.get().getters.displayCurrency]);
			const price = parseFloat(StoreService.get().state.prices[this.uniqueWithChain()][StoreService.get().getters.displayCurrency]);
			return `${parseFloat(price/baseTokenPrice).toFixed(10)} ${withSymbol ? systemToken.symbol : ''}`
		} else {
			return null;
		}
	}

	totalBalance(){
		if(StoreService.get().getters.totalBalances.totals.hasOwnProperty(this.uniqueWithChain())){
			return StoreService.get().getters.totalBalances.totals[this.uniqueWithChain()];
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
		return this.symbol.length > 4 ? this.symbol.substr(0,4) : this.symbol
	}

	accounts(){
		return StoreService.get().getters.accounts.filter(x => x.network().chainId === this.chainId).reduce((acc,x) => {
			if(!acc.find(y => y.sendable() === x.sendable())) acc.push(x);
			return acc;
		}, []);

		// Problem with doing this is that if the balance checks fail then accounts never show up.
		// const state = StoreService.get().state;
		// if(!state.balances) return [];
		// return Object.keys(state.balances).reduce((acc,accountUnique) => {
		// 	if(state.balances[accountUnique].find(token => token.uniqueWithChain() === this.uniqueWithChain())){
		// 		if(!acc.find(x => x.identifiable() === accountUnique)){
		// 			acc.push(state.scatter.keychain.accounts.find(x => x.identifiable() === accountUnique));
		// 		}
		// 	}
		// 	return acc;
		// }, []);
	}

	static sorter(a,b){
		const untouchable = !!b.unusable ? 1 : !!a.unusable ? -1 : 0;
		const systemTokenUniques = StoreService.get().getters.networkTokens.map(x => x.uniqueWithChain(false));
		const isSelfSystem = systemTokenUniques.includes(b.uniqueWithChain(false)) ? 1 : systemTokenUniques.includes(a.uniqueWithChain(false)) ? -1 : 0;
		return isSelfSystem || untouchable || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0);
	}
}