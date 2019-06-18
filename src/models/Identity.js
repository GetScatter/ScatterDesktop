import AES from 'aes-oop';
import IdGenerator from '../util/IdGenerator'
import Network from '../models/Network'
import StoreService from "../services/utility/StoreService";
import * as Actions from "../store/constants";





/********************************************/
/*            REQUIREABLE FIELDS            */
/********************************************/

export const PersonalFields = {
    firstname:'firstname',
    lastname:'lastname',
    email:'email',
    birthdate:'birthdate'
};

export const LocationFields = {
    phone:'phone',
    address:'address',
    city:'city',
    state:'state',
    country:'country',
    zipcode:'zipcode'
};

export class IdentityRequiredFields {
    constructor(){
        this.accounts = [];
        this.personal = [];
        this.location = [];
    }

    static placeholder(){ return new IdentityRequiredFields(); }
    static fromJson(json){ return Object.assign(new IdentityRequiredFields(), json); }
    clone(){ return IdentityRequiredFields.fromJson(JSON.parse(JSON.stringify(this))) }

    isEmpty(){
        return !this.personal.length
            && !this.location.length
    }

    isValid(){
        if(JSON.stringify(Object.keys(new IdentityRequiredFields())) !== JSON.stringify(Object.keys(this))) return false;
        if(!this.personal.every(field => Object.keys(PersonalFields).includes(field))) return false;
        if(!this.location.every(field => Object.keys(LocationFields).includes(field))) return false;
        return true;
    }

    forPermission(){
        let fields = [];
        this.accounts.map(x => fields.push(`account:${Network.fromJson(x).unique()}`));
        this.location.map(x => fields.push(`location:${x}`));
        this.personal.map(x => fields.push(`personal:${x}`));
        return fields.sort();
    }

    static fromPermission(requirements){
        const p = IdentityRequiredFields.placeholder();
        p.accounts = requirements.filter(x => x.indexOf('account:') > -1).map(x => Network.fromUnique(x.split('account:')[1]));
        p.personal = requirements.filter(x => x.indexOf('personal:') > -1).map(x => x.split('personal:')[1]);
        p.location = requirements.filter(x => x.indexOf('location:') > -1).map(x => x.split('location:')[1]);
        return p;

    }
}

/********************************************/
/*          Personal Information            */
/********************************************/

export class PersonalInformation {
    constructor(){ Object.keys(PersonalFields).forEach(fieldName => this[fieldName] = ''); }
    static placeholder(){ return new PersonalInformation(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    findFields(fields){ return fields.filter(field => this.hasOwnProperty(field) && this[field].length); }
}


/********************************************/
/*          Location Information            */
/********************************************/


export class LocationInformation {
    constructor(){
        this.id = IdGenerator.numeric(10);
        this.name = 'Unnamed Location';
        this.isDefault = false;
        Object.keys(LocationFields).forEach(fieldName => this[fieldName] = '');
    }
    static placeholder(){ return new LocationInformation(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
	clone(){ return LocationInformation.fromJson(JSON.parse(JSON.stringify(this))) }
    findFields(fields){
        let foundFields = fields.filter(field => field !== LocationFields.country)
            .filter(field => this.hasOwnProperty(field) && this[field].length);

        if(fields.includes(LocationFields.country) &&
            this.hasOwnProperty('country') &&
            typeof this.country !== 'string')
            foundFields.push(LocationFields.country);

        return foundFields;
    }

    hasFields(fields){ return this.findFields(fields).length === fields.length; }
}



/********************************************/
/*                 Identity                 */
/********************************************/

let {PrivateKey} = require('eosjs-ecc');

export default class Identity {

    constructor(){
        // Basic fields
        this.id = IdGenerator.text(24);

        this.hash = '';
        this.privateKey = '';
        this.publicKey = '';
        this.name = '';

        // Requireable fields
        this.personal = PersonalInformation.placeholder();
        // this.locations = [LocationInformation.placeholder()];
        this.location = null;

        // KYC
        this.kyc = false;
        this.ridl = -1;
    }

    initialize(hash){
        return new Promise((resolve, reject) => {
            PrivateKey.randomKey().then(privateKey => {
                this.privateKey = privateKey.toWif();
                this.publicKey = privateKey.toPublic().toString();
                this.hash = hash;
                resolve(true);
            });
        });
    }

    static placeholder(){ return new Identity(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        p.personal = PersonalInformation.fromJson(json.personal);
        // if(json.hasOwnProperty('locations')) p.locations = json.locations.map(location => LocationInformation.fromJson(location));
        // else p.locations = [LocationInformation.placeholder()];
        return p;
    }

    clone(){ return Identity.fromJson(JSON.parse(JSON.stringify(this))) }
    isEncrypted(){ return this.privateKey.length > 70 }
    encrypt(seed){ if(!this.isEncrypted()) this.privateKey = AES.encrypt(this.privateKey, seed); }
    decrypt(seed){ if(this.isEncrypted()) this.privateKey = AES.decrypt(this.privateKey, seed); }
    defaultLocation(){ return this.getLocation() || StoreService.get().getters.locations[0]; }


    /***
     * Checks if an Identity has specified fields.
     * This is used when an interacting application requires specific information.
     * @param fields - The fields to check for
     * @param selectedLocation
     * @returns {boolean}
     */
    hasRequiredFields(fields, selectedLocation = null){
        const requiredFields = IdentityRequiredFields.fromJson(fields);
        if(!requiredFields.isValid()) return false;

        if(requiredFields.personal.length)
            if(!requiredFields.personal.every(field => this.personal[field].length))
                return false;

        if(selectedLocation){
            if(!selectedLocation.hasFields(fields.location)) return false;
        } else {
	        if(requiredFields.location.length){
	            if(this.getLocation()){
	                return !!this.getLocation().hasFields(requiredFields.location);
                } else {
	                return false;
                }
            }
        }


        return true;
    }

    /***
     * Returns an object with only the required fields from this Identity
     * @param fields
     * @param location
     */
    asOnlyRequiredFields(fields, location = null){
        const requiredFields = IdentityRequiredFields.fromJson(fields);
        if(!requiredFields.isValid()) return null;

        const identity = {hash:this.hash, publicKey:this.publicKey, name:this.name};

        if(requiredFields.personal.length){
            identity.personal = {};
            requiredFields.personal.map(field => identity.personal[field] = this.personal[field]);
        }

        if(requiredFields.location.length){
            identity.location = {};
            if(!location) location = this.defaultLocation();
            if(location) {
	            requiredFields.location.map(field => identity.location[field] = location[field]);
            }
        }

        return identity;
    }

    /***
     * Sets up the fields returned to the application
     * @param requiredFields
     * @param identity
     * @param selectedLocation
     */
    static asReturnedFields(requiredFields, identity, selectedLocation = null){
        const returnedFields = identity.asOnlyRequiredFields(requiredFields, selectedLocation);
        delete returnedFields.hash;
        delete returnedFields.name;
        delete returnedFields.publicKey;
        delete returnedFields.kyc;
        delete returnedFields.ridl;
        return returnedFields;
    }

    /***
     * Returns the value of a property based on the requirable name.
     * @param requirable
     * @param location
     */
    getPropertyValueByName(requirable, location = null){
        if(Object.keys(this).includes(requirable)) return this[requirable];
        else if(Object.keys(this.personal).includes(requirable)) return this.personal[requirable];
        else {
            const field = (location ? location : this.defaultLocation())[requirable];
            return typeof field === 'object' ? field.name : field;

        }
    }

    static nameIsValid(name){
        return /^[a-zA-Z0-9_-]{3,20}$/.test(name)
    }

    fullname(){
        return `${this.personal.firstname || '[NO FIRST NAME]'} ${this.personal.lastname || '[NO LAST NAME]'}`
    }

    getLocation(){
        if(!this.location) return;
        return StoreService.get().getters.locations.find(x => x.id === this.location);
    }

    setAsLastUsed(){
	    const scatter = StoreService.get().state.scatter.clone();
	    scatter.keychain.lastUsedIdentity = this.id;
	    return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }
}