import PluginRepository from '../plugins/PluginRepository';
import {store} from '../store/store'
import {Blockchains} from "./Blockchains";

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
}
