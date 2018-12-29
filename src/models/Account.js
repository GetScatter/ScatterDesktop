import PluginRepository from '../plugins/PluginRepository';
import {store} from '../store/store'
import {Blockchains} from "./Blockchains";
import Token from "./Token";

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
        return store.state.scatter.settings.networks.find(x => x.unique() === this.networkUnique);
    }

    keypair(){
        return store.state.scatter.keychain.keypairs.find(x => x.unique() === this.keypairUnique);
    }

    blockchain(){
    	if(!this.keypair()) return Blockchains.EOSIO;
        return this.keypair().publicKeys.find(x => x.key === this.publicKey).blockchain;
    }

    authorities(){
	    if(!this.authority.length) return [];
	    return store.getters.accounts
            .filter(x => x.identifiable() === this.identifiable() && x.keypairUnique === this.keypairUnique)
            .sort((a,b) => a.authority.localeCompare(b.authority));
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
	    if(!store.state.balances) return 0;
	    if(!store.state.balances.hasOwnProperty(this.identifiable())) return 0;
	    if(!store.state.balances[this.identifiable()]) return 0;
	    return store.state.balances[this.identifiable()].filter(x => !systemToken ? true : x.identifiable() !== systemToken.identifiable()).length;
    }

    tokens(){
	    if(!store.state.balances) return [];
	    if(!store.state.balances.hasOwnProperty(this.identifiable())) return [];
	    if(!store.state.balances[this.identifiable()]) return [];
	    return store.state.balances[this.identifiable()];
    }

    tokenBalance(token){
    	const balance = this.tokens().find(x => x.uniqueWithChain() === token.uniqueWithChain());
    	if(!balance) return 0;
    	return balance.amount;
    }

    systemBalance(withSymbol = false){
	    if(!store.state.balances) return 0;
	    if(!store.state.balances.hasOwnProperty(this.identifiable())) return 0;
	    if(!store.state.balances[this.identifiable()]) return 0;
	    const systemBalance = store.state.balances[this.identifiable()].find(x =>  Token.fromJson(x).identifiable() === this.network().systemToken().identifiable());
	    if(!systemBalance) return 0;
	    return `${systemBalance.amount} ${withSymbol ? systemBalance.symbol : ''}`;
    }

    totalFiatBalance(){
	    return this.tokens().reduce((acc, x) => {
	    	acc += parseFloat(x.fiatBalance(false))
		    return acc;
	    }, 0)
    }
}
