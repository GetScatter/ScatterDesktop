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

    formatted(){
        return PluginRepository.plugin(this.blockchain()).accountFormatter(this);
    }

    formattedWithNetwork(networks){
        const networkName = networks.find(x => x.unique() === this.networkUnique).name;
        return `${networkName} - ${this.formatted()}`;
    }

    network(){
        return store.state.scatter.settings.networks.find(x => x.unique() === this.networkUnique);
    }

    keypair(){
        return store.state.scatter.keychain.keypairs.find(x => x.unique() === this.keypairUnique);
    }

    blockchain(){
        return this.keypairUnique.split(':')[0];
    }

    static placeholder(){ return new Account(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    unique(){ return this.keypairUnique + this.networkUnique + this.name + this.authority; }
    clone(){ return Account.fromJson(JSON.parse(JSON.stringify(this))) }

    asReturnable(){
        return PluginRepository.plugin(this.blockchain()).returnableAccount(this);
    }
}
