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

    hasPermission(checksum, fields = []){
        const fieldKeys = () => Array.isArray(fields) ? fields : Object.keys(fields);

        const permission = this.getPermission(checksum);
        console.log('checksum', checksum, permission);
        if(!permission) return false;

        // If no fields are supplied but permission exists | valid.
        if(fields === null || !fieldKeys().length) return true;

        let fieldsCloneA = Object.assign({}, fields);
        let fieldsCloneB = Object.assign({}, permission.fields);
        permission.mutableFields.map(field => {
            delete fieldsCloneA[field];
            delete fieldsCloneB[field];
        });

        return ObjectHelpers.deepEqual(fieldsCloneA, fieldsCloneB);

    }

    findIdentity(publicKey){
        return this.identities.find(id => id.publicKey === publicKey);
    }
    findIdentityFromDomain(domain){
        const idFromPermissions =  this.permissions.find(permission => permission.isIdentity && permission.domain === domain);
        if(idFromPermissions) return this.findIdentity(idFromPermissions.identity);
        else return null;
    }
    updateOrPushIdentity(identity){
        this.identities.find(id => id.publicKey === identity.publicKey)
            ? this.identities = this.identities.map(id => id.publicKey === identity.publicKey ? identity : id)
            : this.identities.unshift(identity);
    }
    removeIdentity(identity){
        this.identities = this.identities.filter(id => id.publicKey !== identity.publicKey);
    }

    findAccountsWithPublicKey(publicKey){
        return this.identities.map(id => id.getAccountFromPublicKey(publicKey)).filter(acc => !!acc);
    }

    forBackup(){
        const clone = this.clone();
        clone.keypairs = [];
        clone.permissions = [];
        return clone;

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
        this.keypairs = this.keypairs.filter(key => key.unique() !== keypair.unique());
    }

    addAccount(account){
        if(!this.accounts.find(a => a.unique() === account.unique()))
            this.accounts.push(account);
    }

    removeAccount(account){
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