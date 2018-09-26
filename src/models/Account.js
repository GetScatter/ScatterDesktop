import Keypair from './Keypair';
import PluginRepository from '../plugins/PluginRepository';
import {store} from '../store/store'

export default class Account {
    constructor(){
        this.keypairUnique = '';
        this.networkUnique = '';
        this.publicKey = '';
        this.name = '';
        this.authority = '';
    }

    sendable(){
        return PluginRepository.plugin(this.blockchain()).accountsAreImported() ? this.name : this.publicKey;
    }

    formatted(){
        return PluginRepository.plugin(this.blockchain()).accountFormatter(this);
    }

    formattedWithNetwork(){
        return `${this.network().name} - ${this.formatted()}`;
    }

    network(){
        return store.state.scatter.settings.networks.find(x => x.unique() === this.networkUnique);
    }

    keypair(){
        return store.state.scatter.keychain.keypairs.find(x => x.unique() === this.keypairUnique);
    }

    blockchain(){
        if(!this.keypair()) return;
        return this.keypair().publicKeys.find(x => x.key === this.publicKey).blockchain;
    }

    static placeholder(){ return new Account(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    unique(){ return this.keypairUnique + this.networkUnique + this.name + this.authority + this.publicKey; }
    clone(){ return Account.fromJson(JSON.parse(JSON.stringify(this))) }

    asReturnable(){
        return PluginRepository.plugin(this.blockchain()).returnableAccount(this);
    }
}
