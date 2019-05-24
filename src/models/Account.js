import PluginRepository from '../plugins/PluginRepository';
import {Blockchains} from "./Blockchains";
import Token from "./Token";
import StoreService from "../services/utility/StoreService";

export default class Account {
    constructor(){
        this.keypairUnique = '';
        this.networkUnique = '';
        this.publicKey = '';
        this.name = '';
        this.authority = '';

        this.logins = 0;

        this.createdAt = +new Date();
        this.fromOrigin = null;
    }

    sendable(){
        return PluginRepository.plugin(this.blockchain()).accountsAreImported() ? this.name : this.publicKey;
    }

    formatted(){
        return PluginRepository.plugin(this.blockchain()).accountFormatter(this);
    }

    network(){
        return StoreService.get().state.scatter.settings.networks.find(x => x.unique() === this.networkUnique);
    }

    keypair(){
        return StoreService.get().state.scatter.keychain.keypairs.find(x => x.unique() === this.keypairUnique);
    }

    blockchain(){
    	if(!this.keypair()) return Blockchains.EOSIO;
        return this.keypair().publicKeys.find(x => x.key === this.publicKey).blockchain;
    }

    authorities(){
	    if(!this.authority.length) return [];
	    return StoreService.get().getters.accounts
            .filter(x => x.identifiable() === this.identifiable() && x.keypairUnique === this.keypairUnique)
            .sort((a,b) => a.authority.localeCompare(b.authority));
    }

    hasDangerousAuthority(){
    	return this.authorities().find(x => x.authority === 'owner');
    }

    static placeholder(){ return new Account(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    unique(){ return this.keypairUnique + this.networkUnique + this.name + this.authority + this.publicKey; }
    identifiable(){ return this.networkUnique + this.sendable(); }
    clone(){ return Account.fromJson(JSON.parse(JSON.stringify(this))) }

    asReturnable(){
        const returnable = PluginRepository.plugin(this.blockchain()).returnableAccount(this);
        returnable.chainId = this.network().chainId;
        returnable.isHardware = !!this.keypair().external;
        return returnable;
    }

    tokenCount(systemToken = null){
	    if(!StoreService.get().state.balances) return 0;
	    if(!StoreService.get().state.balances.hasOwnProperty(this.identifiable())) return 0;
	    if(!StoreService.get().state.balances[this.identifiable()]) return 0;
	    return StoreService.get().state.balances[this.identifiable()].filter(x => !systemToken ? true : x.identifiable() !== systemToken.identifiable()).length;
    }

    tokens(){
    	let base = [this.network().systemToken()];
	    if(!StoreService.get().state.balances) return base;
	    if(!StoreService.get().state.balances.hasOwnProperty(this.identifiable())) return base;
	    if(!StoreService.get().state.balances[this.identifiable()]) return base;
	    return StoreService.get().state.balances[this.identifiable()];
    }

    balanceFor(token){
    	return this.tokens().find(x => x.uniqueWithChain() === token.uniqueWithChain());
    }

    systemBalance(withSymbol = false){
	    if(!StoreService.get().state.balances) return 0;
	    if(!StoreService.get().state.balances.hasOwnProperty(this.identifiable())) return 0;
	    if(!StoreService.get().state.balances[this.identifiable()]) return 0;
	    const systemBalance = StoreService.get().state.balances[this.identifiable()].find(x =>  Token.fromJson(x).identifiable() === this.network().systemToken().identifiable());
	    if(!systemBalance) return 0;
	    return `${systemBalance.amount} ${withSymbol ? systemBalance.symbol : ''}`;
    }

    totalFiatBalance(){
	    return this.tokens().reduce((acc, x) => {
	    	acc += x.fiatBalance(false) ? parseFloat(x.fiatBalance(false)) : 0;
		    return acc;
	    }, 0).toFixed(2)
    }
}
