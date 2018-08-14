import Identity from './Identity';
import Permission from './Permission';
import Keypair from './Keypair';
import Account from './Account';
import ObjectHelpers from '../util/ObjectHelpers';
import AppLink from './AppLink';

export default class Keychain {

    constructor(){
        this.keypairs = [];
        this.accounts = [];
        this.linkedApps = [];
        this.identities = [];
        this.permissions = [];
    }

    static placeholder(){ return new Keychain(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('keypairs')) p.keypairs = json.keypairs.map(x => Keypair.fromJson(x));
        if(json.hasOwnProperty('accounts')) p.accounts = json.accounts.map(x => Account.fromJson(x));
        if(json.hasOwnProperty('linkedApps')) p.linkedApps = json.linkedApps.map(AppLink.fromJson);
        if(json.hasOwnProperty('identities')) p.identities = json.identities.map(x => Identity.fromJson(x));
        if(json.hasOwnProperty('permissions')) p.permissions = json.permissions.map(x => Permission.fromJson(x));
        return p;
    }

    clone(){ return Keychain.fromJson(JSON.parse(JSON.stringify(this))) }

    findIdentity(publicKey){
        return this.identities.find(id => id.publicKey === publicKey);
    }

    updateOrPushIdentity(identity){
        this.identities.find(id => id.publicKey === identity.publicKey)
            ? this.identities = this.identities.map(id => id.publicKey === identity.publicKey ? identity : id)
            : this.identities.unshift(identity);
    }
    removeIdentity(identity){
        this.identities = this.identities.filter(id => id.publicKey !== identity.publicKey);
        this.permissions = this.permissions.filter(perm => perm.identity !== identity.publicKey);
    }

    getKeyPair(keypair){
        return this.getKeyPairByPublicKey(keypair.publicKey);
        // return this.keypairs.find(key => key.publicKey.toLowerCase() === keypair.publicKey.toLowerCase())
    }

    getKeyPairByName(name){
        return this.keypairs.find(key => key.name.toLowerCase() === name.toLowerCase())
    }

    getKeyPairByPublicKey(publicKey){
        return this.keypairs.find(key => key.publicKey.toLowerCase() === publicKey.toLowerCase())
    }

    removeKeyPair(keypair){
        const accountsToRemove = this.accounts.filter(x => x.keypairUnique === keypair.unique()).map(x => x.unique());
        this.permissions = this.permissions.filter(x => !x.accounts.some(a => accountsToRemove.includes(a)));
        this.accounts = this.accounts.filter(x => x.keypairUnique !== keypair.unique());
        this.keypairs = this.keypairs.filter(key => key.unique() !== keypair.unique());
    }

    addAccount(account){
        if(!this.accounts.find(a => a.unique() === account.unique()))
            this.accounts.push(account);
    }

    removeAccount(account){
        const accountsToRemove = this.accounts.filter(x => x.unique() === account.unique()).map(x => x.unique());
        this.permissions = this.permissions.filter(x => !x.accounts.some(a => accountsToRemove.includes(a)));
        this.accounts = this.accounts.filter(a => a.unique() !== account.unique());
    }

    updateOrPushAppLink(appLink){
        this.linkedApps.find(app => app.id === appLink.id)
            ? this.linkedApps = this.linkedApps.map(app => app.id === appLink.id ? appLink : app)
            : this.linkedApps.unshift(appLink);
    }

    removeAppLink(appLink){
        this.linkedApps = this.linkedApps.filter(a => a.id !== appLink.id);
    }
}