import Identity from './Identity';
import Permission from './Permission';
import Keypair from './Keypair';
import Account from './Account';
import AuthorizedApp from './AuthorizedApp';
import ObjectHelpers from '../util/ObjectHelpers';

export default class Keychain {

    constructor(){
        this.keypairs = [];
        this.accounts = [];
        this.identities = [];
        this.permissions = [];
        this.apps = [];
    }

    static placeholder(){ return new Keychain(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('keypairs')) p.keypairs = json.keypairs.map(x => Keypair.fromJson(x));
        if(json.hasOwnProperty('accounts')) p.accounts = json.accounts.map(x => Account.fromJson(x));
        if(json.hasOwnProperty('identities')) p.identities = json.identities.map(x => Identity.fromJson(x));
        if(json.hasOwnProperty('permissions')) p.permissions = json.permissions.map(x => Permission.fromJson(x));
        if(json.hasOwnProperty('apps')) p.apps = json.apps.map(x => AuthorizedApp.fromJson(x));
        return p;
    }

    clone(){ return Keychain.fromJson(JSON.parse(JSON.stringify(this))) }

    findIdentity(publicKey){
        return this.identities.find(id => id.publicKey === publicKey);
    }

    updateOrPushApp(app){
        this.apps.find(x => x.origin === app.origin)
            ? this.apps = this.apps.map(x => x.origin === app.origin ? app : x)
            : this.apps.unshift(app);
    }

    removeApp(app){
        this.apps = this.apps.filter(x => x.origin !== app.origin);
    }

    findApp(origin){
        return this.apps.find(x => x.origin === origin);
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

    getKeyPairByName(name){
        return this.keypairs.find(key => key.name.toLowerCase() === name.toLowerCase())
    }

    getKeyPairByPublicKey(publicKey){
        return this.keypairs.find(key => key.publicKeys.find(x => x.key.toLowerCase() === publicKey.toLowerCase()))
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
}