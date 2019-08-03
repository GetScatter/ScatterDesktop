import Identity, {LocationInformation} from './Identity';
import Permission from './Permission';
import Keypair from './Keypair';
import Account from './Account';
import AuthorizedApp from './AuthorizedApp';
import CreditCard from "./CreditCard";

export default class Keychain {

    constructor(){
        this.keypairs = [];
        this.accounts = [];
        this.identities = [];
        this.locations = [];
        this.permissions = [];
        this.cards = [];
        this.apps = [];
        this.avatars = {};

        this.lastUsedIdentity = null;
    }

    static placeholder(){ return new Keychain(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('keypairs')) p.keypairs = json.keypairs.map(x => Keypair.fromJson(x));
        if(json.hasOwnProperty('accounts')) p.accounts = json.accounts.map(x => Account.fromJson(x));
        if(json.hasOwnProperty('identities')) p.identities = json.identities.map(x => Identity.fromJson(x));
        if(json.hasOwnProperty('locations')) p.locations = json.locations.map(x => LocationInformation.fromJson(x));
        if(json.hasOwnProperty('permissions')) p.permissions = json.permissions.map(x => Permission.fromJson(x));
        if(json.hasOwnProperty('cards')) p.cards = json.cards.map(x => CreditCard.fromJson(x));
        if(json.hasOwnProperty('apps')) p.apps = json.apps.map(x => AuthorizedApp.fromJson(x));
        return p;
    }

    clone(){ return Keychain.fromJson(JSON.parse(JSON.stringify(this))) }

    findIdentity(id){
        return this.identities.find(identity => identity.id === id);
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
        this.identities.find(id => id.id === identity.id)
            ? this.identities = this.identities.map(id => id.id === identity.id ? identity : id)
            : this.identities.unshift(identity);
    }

    removeIdentity(identity){
        this.identities = this.identities.filter(id => id.id !== identity.id);
        this.permissions = this.permissions.filter(perm => perm.identity !== identity.id);
        delete this.avatars[identity.id];
    }

    updateOrPushLocation(location){
        this.locations.find(id => id.id === location.id)
            ? this.locations = this.locations.map(id => id.id === location.id ? location : id)
            : this.locations.unshift(location);
    }

    removeLocation(location){
        this.locations = this.locations.filter(x => x.id !== location.id);
        this.identities.map(identity => {
            if(identity.location === location.id){
                identity.location = null;
            }
        })
    }

    getKeyPairByName(name){
        return this.keypairs.find(key => key.name.toLowerCase() === name.toLowerCase())
    }

    getKeyPairByPublicKey(publicKey){
        if(!publicKey) return;
        return this.keypairs.find(key => key.publicKeys.find(x => x.key.toLowerCase() === publicKey.toLowerCase()))
    }

    removeKeyPair(keypair){
        const accountsToRemove = this.accounts.filter(x => x.keypairUnique === keypair.unique()).map(x => x.unique());
        this.permissions = this.permissions.filter(x => !x.accounts.some(a => accountsToRemove.includes(a)));
        this.accounts = this.accounts.filter(x => x.keypairUnique !== keypair.unique());
        this.keypairs = this.keypairs.filter(key => key.unique() !== keypair.unique());
        this.correctAppLinks();
    }

    addAccount(account){
        if(!this.accounts.find(a => a.unique() === account.unique()))
            this.accounts.push(account);
    }

    removeAccount(account){
        const accountsToRemove = this.accounts.filter(x => x.unique() === account.unique()).map(x => x.unique());
        this.permissions = this.permissions.filter(x => !x.accounts.some(a => accountsToRemove.includes(a)));
        this.accounts = this.accounts.filter(a => a.unique() !== account.unique());
	    this.correctAppLinks();
    }

	correctAppLinks(){
		const origins = this.permissions.map(x => x.origin);
		this.apps = this.apps.filter(x => origins.includes(x => x.origin));
	}
}