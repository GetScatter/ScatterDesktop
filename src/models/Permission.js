import {store} from '../store/store'
import Hasher from '../util/Hasher';
import IdGenerator from '../util/IdGenerator';

export default class Permission {

    constructor(){
        this.id = IdGenerator.numeric(24);
        // Mandatory
        this.origin = '';

        this.identity = '';
        this.accounts = [];

        // Optional
        this.contract = null;
        this.contractHash = null;
        this.action = null;
        this.mutableActionFields = [];
        this.immutableActionFields = [];

        this.timestamp = 0;

        this.identityRequirements = [];

        this.isIdentity = false;
        this.isIdentityRequirements = false;
        this.isContractAction = false;
    }

    static placeholder(){ return new Permission(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    clone(){ return Permission.fromJson(JSON.parse(JSON.stringify(this))) }

    static fromAction(origin, identity, accounts, added){
        const base = Permission.fromJson({
            origin,
            identity:identity.publicKey,
            accounts:accounts.map(x => x.unique())
        });
        return Object.assign(base, added);
    }

    checksum(){
        return Hasher.unsaltedQuickHash(
            this.origin+
            this.identity+
            (this.accounts||[]).join(',')+
            this.contract+
            this.contractHash+
            this.action+
            (this.identityRequirements||[]).join(',')
        )
        // (this.mutableActionFields||[]).join(',')+
    }

    getIdentity(){
        return store.state.scatter.keychain.findIdentity(this.identity);
    }

    getAccounts(){
        const accounts = store.state.scatter.keychain.accounts;
        return this.accounts.map(unique => accounts.find(x => x.unique() === unique));
    }

    isIdentityPermissionFor(origin){
        return this.isIdentity && this.origin === origin;
    }

    static createImmutableFieldsHash(allFields, mutableFields){
        return Hasher.unsaltedQuickHash(Object.keys(allFields).map(key => {
            if(!mutableFields.includes(key)) return allFields[key];
            else return null;
        }).filter(x => x).sort().join(','));
    }
}