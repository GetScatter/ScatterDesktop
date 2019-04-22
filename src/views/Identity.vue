<template>
    <section class="identity">
        <section v-if="identity">
            <back-bar v-on:back="$router.push({name:RouteNames.HOME})"></back-bar>

            <!--<section class="panel-switch">-->
                <!--<figure class="button" :class="{'active':state === STATES.DETAILS}" @click="state = STATES.DETAILS">{{locale(langKeys.IDENTITY.Title)}}</figure>-->
                <!--<figure class="button" :class="{'active':state === STATES.RIDL}" @click="state = STATES.RIDL">RIDL</figure>-->
            <!--</section>-->


            <section class="panel-container scroller limited" v-if="state === STATES.RIDL">

                <h1>Reputation & Identity Layer (RIDL)</h1>
                <br>

                <!------------------------>
                <!----- IDENTITY NAME ---->
                <!------------------------>
                <cin big="1"
                     :error="isValidName ? null : locale(langKeys.IDENTITY.NameError)"
                     :label="locale(langKeys.IDENTITY.NameLabel)"
                     :placeholder="locale(langKeys.IDENTITY.NamePlaceholder)"
                     :text="identity.name" v-on:changed="x => identity.name = x" />

                <section style="display:flex; margin-top:-10px;" v-if="!isUsingIdentity">
                    <section style="flex:1;">
                        <figure class="ridl-name-status" v-if="identityIsAvailable">This identity name is available.</figure>
                        <figure class="ridl-name-status" v-else-if="identityIsClaimable">You are the owner of this name, but you need to claim it first.</figure>
                        <figure class="ridl-name-status" v-else-if="identityIsUsable">You own and can use this identity.</figure>
                        <figure class="ridl-name-status" v-else>This identity is already owned by another user.</figure>
                    </section>
                    <section style="flex:1; text-align:right;">
                        <btn small="1" v-if="identityIsAvailable && isValidName" :loading="working" text="Register RIDL Name" @click.native="registerForRIDL" />
                        <btn small="1" v-if="identityIsClaimable" :loading="working" text="Claim RIDL Name" @click.native="registerForRIDL" />
                        <btn small="1" v-if="identityIsUsable" :loading="working" text="Use RIDL Identity" @click.native="useRidlIdentity" />
                    </section>
                </section>

                <section style="display:flex; margin-top:-10px;" v-if="isUsingIdentity">
                    <section style="flex:1;">
                        <figure class="ridl-name-status">You are currently using this RIDL Identity</figure>
                    </section>
                    <section style="flex:1; text-align:right;">
                        <btn red="1" small="1" :loading="working" text="Stop Using RIDL Identity" @click.native="identity.ridl = -1" />
                    </section>
                </section>

                <br>
                <br>

                <section class="keys">
	                <section class="disclaimer red less-pad">
		                <b>Changing the identity key while you have a RIDL identity linked will cause the identity's key to change too.</b>
	                </section>

                    <label>Public Key</label>
                    <figure class="public" style="font-size: 13px;"><b>{{identity.publicKey}}</b></figure>
                    <br>

                    <section class="split-inputs">
                        <cin label="Private Key" style="flex:1;" :disabled="!revealed"
                             placeholder="5jk..." :type="revealed ? 'text' : 'password'"
                             :text="privateKey" v-on:changed="x => privateKey = x" />
                        <btn @click.native="reveal()"
                             :text="revealed ? locale(langKeys.GENERIC.Hide) : locale(langKeys.GENERIC.Reveal)"
                             style="flex:0.2; margin-top:4px;" />
                        <btn blue="1" @click.native="saveIdentityPrivateKey" v-if="changingPrivateKey"
                             :text="locale(langKeys.GENERIC.Save)"
                             style="flex:0.2; margin-top:4px;" />
                    </section>
                </section>

	            <figure class="line"></figure>


	            <GetRIDL />


            </section>

            <section class="panel-container scroller limited" v-if="state === STATES.DETAILS">

                <h1>{{locale(langKeys.IDENTITY.Title)}}</h1>
                <br>
                <section class="disclaimer">
                    <b>{{locale(langKeys.IDENTITY.DisclaimerTitleImportant)}}</b> {{locale(langKeys.IDENTITY.DisclaimerTitle)}}
                    <br><br>
                    <p>{{locale(langKeys.IDENTITY.DisclaimerSubtitle)}}</p>
                </section>
                <br>



                <!------------------------>
                <!----- IDENTITY NAME ---->
                <!------------------------>
                <!--<cin big="1"-->
                     <!--:error="isValidName ? null : locale(langKeys.IDENTITY.NameError)"-->
                     <!--:label="locale(langKeys.IDENTITY.NameLabel)"-->
                     <!--:placeholder="locale(langKeys.IDENTITY.NamePlaceholder)"-->
                     <!--:text="identity.name" v-on:changed="x => identity.name = x" />-->

                <!------------------------>
                <!------ NAME / DOB ------>
                <!------------------------>
                <section class="split dynamic">
                    <cin :label="locale(langKeys.IDENTITY.PERSONAL.NameLabel)"
                         :placeholder="locale(langKeys.IDENTITY.PERSONAL.NamePlaceholder)"
                         style="flex:3;"
                         :text="fullname"
                         v-on:changed="x => fullname = x" />

                    <cin :label="locale(langKeys.IDENTITY.PERSONAL.DateOfBirthLabel)"
                         style="flex:1;"
                         type="date" :text="identity.personal.birthdate"
                         v-on:changed="x => identity.personal.birthdate = x" />
                </section>

                <!------------------------>
                <!--------- EMAIL -------->
                <!------------------------>
                <cin :label="locale(langKeys.IDENTITY.PERSONAL.EmailLabel)"
                     placeholder="help@get-scatter.com"
                     :text="identity.personal.email"
                     v-on:changed="x => identity.personal.email = x" />



                <figure class="line"></figure>

                <section class="disclaimer">
                    {{locale(langKeys.IDENTITY.LOCATION.DisclaimerTitle)}}
                    <p>{{locale(langKeys.IDENTITY.LOCATION.DisclaimerSubtitle)}}</p>
                </section>

                <!------------------------>
                <!-- LOCATIONS SELECTOR -->
                <!------------------------>
                <section class="split select">
                    <sel :label="locale(langKeys.IDENTITY.LOCATION.SelectorLabel)"
                         :selected="location"
                         :options="identity.locations"
                         :parser="x => x.name" v-on:changed="x => location = x"></sel>

                    <section>
                        <btn :text="locale(langKeys.IDENTITY.LOCATION.SelectorAddButton)" v-on:clicked="addLocation"></btn>
                        <btn v-if="identity.locations.length > 1" icon="icon-cancel" v-on:clicked="removeLocation"></btn>
                    </section>
                </section>

                <!----------------------->
                <!-- SELECTED LOCATION -->
                <!----------------------->
                <section class="selected-location" v-if="location">
                    <cin :label="locale(langKeys.IDENTITY.LOCATION.NameLabel)"
                         :placeholder="locale(langKeys.IDENTITY.LOCATION.NamePlaceholder)"
                         :error="isValidLocationName ? null : locale(langKeys.IDENTITY.LOCATION.NameError)"
                         :text="location.name"
                         v-on:changed="x => location.name = x" />

                    <!----------------------->
                    <!------- COUNTRY ------->
                    <!----------------------->
                    <section class="split dynamic">
                        <sel :label="locale(langKeys.IDENTITY.LOCATION.CountryLabel)"
                             :selected="location.country" style="flex:3;"
                             :options="[null].concat(countries)"
                             :parser="x => x ? x.name : locale(langKeys.IDENTITY.LOCATION.CountryItemNone)"
                             v-on:changed="x => location.country = x"></sel>
                    </section>
                    <br>

                    <!----------------------->
                    <!------- PHONE # ------->
                    <!----------------------->
                    <section class="split dynamic">
                        <cin :label="locale(langKeys.IDENTITY.LOCATION.PhoneLabel)"
                             :placeholder="locale(langKeys.IDENTITY.LOCATION.PhonePlaceholderArea)"
                             style="flex:2"
                             :text="phone.area" :maxlength="3"
                             type="number" v-on:changed="x => phone.area = x" />

                        <cin :placeholder="locale(langKeys.IDENTITY.LOCATION.PhonePlaceholderPrefix)"
                             style="flex:3" :text="phone.prefix" type="number" v-on:changed="x => phone.prefix = x" />
                        <cin :placeholder="locale(langKeys.IDENTITY.LOCATION.PhonePlaceholderSuffix)"
                             style="flex:3" :text="phone.suffix" type="number" v-on:changed="x => phone.suffix = x" />
                    </section>


                    <!----------------------->
                    <!------- ADDRESS ------->
                    <!----------------------->
                    <section class="split dynamic">
                        <cin :label="locale(langKeys.IDENTITY.LOCATION.AddressLabel)"
                             :placeholder="locale(langKeys.IDENTITY.LOCATION.AddressPlaceholder)"
                             style="flex:4;" :text="location.address" v-on:changed="x => location.address = x" />

                        <cin :label="locale(langKeys.IDENTITY.LOCATION.CityLabel)"
                             :placeholder="locale(langKeys.IDENTITY.LOCATION.CityPlaceholder)"
                             style="flex:2" :text="location.city" v-on:changed="x => location.city = x" />

                        <cin :label="locale(langKeys.IDENTITY.LOCATION.StateLabel)"
                             :placeholder="locale(langKeys.IDENTITY.LOCATION.StatePlaceholder)"
                             v-if="location.country && location.country.code === 'US'"
                             style="flex:1" :text="location.state" :maxlength="2" v-on:changed="x => location.state = x" />
                    </section>
                </section>

                <br>
                <br>
                <br>



            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import GetRIDL from '../components/reusable/GetRIDL'
    import IdGenerator from '../util/IdGenerator'
    import PopupService from '../services/PopupService';
    import {Popup} from '../models/popups/Popup';
    import Identity, {LocationInformation} from '../models/Identity';
    import {Countries} from '../data/Countries'
    import KeyPairService from "../services/KeyPairService";
    import RIDLService from "../services/RIDLService";
    import {Blockchains} from "../models/Blockchains";
    import PluginRepository from '../plugins/PluginRepository'
    import BalanceService from "../services/BalanceService";
    import Account from "../models/Account";
    let saveTimeout;

    const TEMP_KEY = '................................................................';

    const STATES = {
        DETAILS:'details',
        RIDL:'ridl',
    };

    export default {
    	components:{
		    GetRIDL
	    },
        data () {return {
	        STATES,
            state:STATES.DETAILS,

            countries:Countries,
            location:null,
            phone:{
                area:'',
                prefix:'',
                suffix:'',
            },
            fullname:'',
            identity:null,
	        privateKey:TEMP_KEY,
	        revealed:false,
	        availableIdentity:false,
	        working:false,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
                'contacts',
                'identities',
	            'networks',
            ]),
            isValidName(){
                return this.identity && Identity.nameIsValid(this.identity.name);
            },
            isValidLocationName(){
            	return this.location && this.location.name.length;
            },
	        changingPrivateKey(){
            	if(!this.privateKey || !this.privateKey.length) return false;
            	if(this.privateKey === TEMP_KEY) return false;
            	return PluginRepository.plugin(Blockchains.EOSIO).validPrivateKey(this.privateKey);
            },
	        ridlAccount(){
                return this.accounts.find(x => x.networkUnique === RIDLService.networkUnique());
	        },
	        identityIsAvailable(){
            	return !this.availableIdentity;
	        },
	        identityIsClaimable(){
		        if(!this.availableIdentity) return false;
		        return this.availableIdentity.key === this.identity.publicKey && this.availableIdentity.account === 'ridlridlridl';
	        },
	        identityIsUsable(){
            	return this.availableIdentity
		            && this.ridlAccount
		            && this.availableIdentity.key === this.identity.publicKey
		            && this.availableIdentity.account === this.ridlAccount.name;
	        },
	        isUsingIdentity(){
            	if(!this.availableIdentity) return false;
		        return this.availableIdentity.id === this.identity.ridl
	        },

        },
        mounted(){
    		if(this.$route.query.ridl){
    			this.state = STATES.RIDL;
		    }

            this.identity = this.identities[0].clone();
            this.fullname = [this.identity.personal.firstname, this.identity.personal.lastname].filter(x => x && x.length).join(' ');
            this.location = this.identity.locations[0];

        },
        methods:{
	        reveal(){
        		if(this.revealed) return this.revealed = false;
        	    PopupService.push(Popup.verifyPassword(proved => {
        	    	if(!proved) return;
        	    	this.revealed = true;
	            }))
	        },
	        async saveIdentityPrivateKey(){
                if(!this.changingPrivateKey) return false;
                if(this.privateKey === await KeyPairService.publicToPrivate(this.identity.publicKey)){
	                this.revealed = false;
	                return this.privateKey = TEMP_KEY;
                }

                const plugin = PluginRepository.plugin(Blockchains.EOSIO);
                const publicKey = plugin.privateToPublic(this.privateKey);
                const encrypted = await KeyPairService.encryptPrivateKey(this.privateKey);

                if(this.availableIdentity.id === this.identity.ridl){
					if(!await RIDLService.changeKey(this.identity.name, publicKey)) return;
                } else this.identity.ridl = -1;

		        this.identity.privateKey = encrypted;
		        this.identity.publicKey = publicKey;
		        this.privateKey = TEMP_KEY;
		        this.revealed = false;
            },
	        async registerForRIDL(){
	        	if(this.working) return;

	            const name = this.identity.name;
		        const identity = await RIDLService.identityNameIsAvailable(name);

		        let account;
		        account = await RIDLService.getAccount();
				if(!account){
					account = await RIDLService.createAccount();
					if(!account) return console.error("Could not create account.");
				}

				this.working = true;

		        if(identity){
		            const claimed = await RIDLService.claim(this.identity.name, this.identity.publicKey).catch(() => null);
			        this.working = false;
			        // TODO: ERROR HANDLING
			        if(!claimed) {
				        return console.error("Could not claim identity.");
			        }

			        this.identity.ridl = this.availableIdentity.id;
		        }

		        else {
					const identified = await RIDLService.identify(name, this.identity.publicKey).catch(() => null);
			        this.working = false;
					// TODO: ERROR HANDLING
					if(!identified) {
						return console.error("Could not identify identity.");
					}

					this.identity.ridl = identified.id;
					this.availableIdentity = identified;
		        }
	        },
	        async useRidlIdentity(){
		        if(this.working) return;
	        	this.identity.ridl = this.availableIdentity.id;
	        },





            setPhone(){
                let area, prefix, suffix, presuffix;
                if(this.location.phone.length){
                    [area, presuffix] = this.location.phone.split(' ');
                    if(area) area = area.replace('(', '').replace(')', '');
                    if(presuffix) [prefix, suffix] = presuffix.split('-');
                }

                this.phone = {
                    area,
                    prefix,
                    suffix
                }
            },
            save(){
                if(JSON.stringify(this.identities[0]) === JSON.stringify(this.identity)) return;
                if(!this.isValidName) return;
                if(!this.isValidLocationName) return;

                const scatter = this.scatter.clone();
                scatter.keychain.updateOrPushIdentity(this.identity);
                this[Actions.SET_SCATTER](scatter);
            },
            addLocation(){
                const location = LocationInformation.placeholder();
                location.name = IdGenerator.text(10);
                this.identity.locations.push(location);
                this.location = location;
            },
            removeLocation(){
                if(this.identity.locations.length <= 1) return;
                PopupService.push(Popup.removeLocation(this.identity, this.location, removed => {
                	if(!removed) return;
	                this.identity.locations = this.identity.locations.filter(x => x.id !== this.location.id);
	                this.location = this.identity.locations[0];
                }));
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            ['fullname'](){
                if(!this.fullname.trim().length){
                    this.identity.personal.firstname = '';
                    this.identity.personal.lastname = '';
                    return false;
                }

                const names = this.fullname.trim().split(' ');
                this.identity.personal.firstname = names.slice(0, names.length > 1 ? names.length-1 : 1).join(' ').trim();

                this.identity.personal.lastname = names.length > 1 ? names[names.length-1].trim() : '';

            },
            'identity':{
                handler(a,b){
                    if(!b) return;
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.save();
                    }, 500);
                },
                deep:true
            },
            'phone':{
                handler(a,b){
                    if(!this.phone || typeof this.phone !== 'object') return false;
                    const {area, prefix, suffix} = this.phone;
                    if(!area || !prefix || !suffix) return false;
                    if(!area.length && !prefix.length && !suffix.length) return this.location.phone = '';
                    if(!area.length || !prefix.length || !suffix.length) return;
                    this.location.phone = `(${area}) ${prefix}-${suffix}`
                },
                deep:true
            },
            ['location'](){
                this.setPhone();
            },
            async ['revealed'](){
            	if(!this.revealed) return this.privateKey = TEMP_KEY;

            	this.privateKey = await KeyPairService.publicToPrivate(this.identity.publicKey);
            },
            async ['privateKey'](){
            	if(!this.privateKey) return;
            	this.privateKey = this.privateKey.trim();
            },
            async ['identity.name'](){
	            this.availableIdentity = null;
            	if(!this.isValidName) return;
            	this.working = true;
            	this.availableIdentity = await RIDLService.identityNameIsAvailable(this.identity.name);
            	this.working = false;
            },
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";
    @import "../styles/transfer";

    .panel-switch {
	    background:rgba(0,0,0,0.02);
    }

    .line {
        width:100%;
        margin:30px 0;
        background:rgba(0,0,0,0.1);
        height:1px;
    }

    .selected-location {
        padding:20px;
        background:rgba(0,0,0,0.02);
        border:1px solid rgba(0,0,0,0.1);
        border-radius:4px;
        margin-top:10px;
    }

    .identity {

        .ridl-name-status {
            font-size: 11px;
            font-weight: bold;
            padding:5px 8px;
            border:1px solid rgba(0,0,0,0.2);
            background:rgba(0,0,0,0.04);
            display:table;
            border-radius:4px;
        }

        .split {
            display:flex;

            &.half {
                .input {
                    width:calc(50% - 5px);

                    &:nth-child(2){
                        margin-left:10px;
                    }
                }
            }

            &.dynamic {
                display: flex;
                align-items: flex-end;

                section {
                    &:not(:first-child){
                        margin-left:5px;
                    }
                }
            }

            &.select {
                display: flex;
                align-items: flex-end;

                section {

                    &:first-child {
                        width:calc(70% - 10px);
                        margin-right:10px;
                    }

                    &:last-child {
                        width:30%;
                        display:flex;

                        button {
                            display:inline-block;

                            &:nth-child(1) {
                                font-size: 12px;
                            }

                            &:nth-child(2) {
                                margin-left:10px;
                            }
                        }
                    }
                }
            }

        }
    }



</style>
