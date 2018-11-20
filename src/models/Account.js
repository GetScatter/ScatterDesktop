import PluginRepository from '../plugins/PluginRepository';
import {store} from '../store/store'

export default class Account {
    constructor(){
        this.keypairUnique = '';
        this.networkUnique = '';
        this.publicKey = '';
        this.name = '';
        this.authority = '';

        this.logins = 0;
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
        return this.keypair().publicKeys.find(x => x.key === this.publicKey).blockchain;
    }

    static placeholder(){ return new Account(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    unique(){ return this.keypairUnique + this.networkUnique + this.name + this.authority + this.publicKey; }
    identifiable(){ return this.networkUnique + this.sendable(); }
    clone(){ return Account.fromJson(JSON.parse(JSON.stringify(this))) }

    asReturnable(){
        return PluginRepository.plugin(this.blockchain()).returnableAccount(this);
    }

    tokenCount(){
	    if(!store.state.balances) return 0;
	    if(!store.state.balances.hasOwnProperty(this.identifiable())) return 0;
	    if(!store.state.balances[this.identifiable()]) return 0;
	    return store.state.balances[this.identifiable()].length;
    }
}
