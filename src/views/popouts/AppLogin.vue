<template>
    <section>
        <PopOutHead v-on:closed="returnResult" />
        <section class="flex-row">
            <section class="flex-col">
                <PopOutAction :origin="payload.origin" action="log in" />

                <section class="missing-fields" v-if="accountFields.length === selectedAccounts.length">
                    <section class="details">
                        <figure class="title">You're missing some fields!</figure>
                        <p>
                            This application is requiring additional information which you do not have on your Identity.
                            <b>Fill out the red fields on the right before you continue.</b>
                        </p>
                        <br><br>
                    </section>

                    <cin placeholder="field" />
                    <cin placeholder="field" />
                    <br>
                    <br>
                    <btn blue="1" :disabled="!isValidIdentity" text="Continue" />
                </section>
                <section class="popout-list" v-else>
                    <SearchBar placeholder="Search Accounts" v-on:terms="x => searchTerms = x" />
                    <FullWidthRow :items="validAccounts" popout="1" />
                </section>
            </section>


            <!-- SIDE PANEL -->
            <figure class="side-bar" :class="expanded ? 'icon-right-open-big' : 'icon-left-open-big'" @click="expandOrContract"></figure>
            <section class="side-panel" v-if="expanded">

                <!-- ACCOUNT NETWORKS -->
                <section class="key-val" v-if="accountNetworks.length">
                    <figure>Requires Accounts For</figure>
                    <figure v-for="item in accountNetworks" style="margin-bottom:10px;">
                        <i class="icon-check" v-if="item.count - selectedOfNetwork(item.network).length === 0"></i>
                        {{item.network.name}}
                        <span style="font-size: 11px;" v-if="item.count - selectedOfNetwork(item.network).length !== 0">({{item.count - selectedOfNetwork(item.network).length}})</span>
                    </figure>

                    <section v-if="selectedAccounts.length">
                        <label>Selected Accounts</label>
                        <figure class="clickable" v-for="account in selectedAccounts" @click="unselectAccount(account)">
                            {{account.formatted()}}
                        </figure>
                        <br>
                    </section>
                </section>

                <section class="key-val" v-if="personalFields.length">
                    <figure>Personal Info</figure>
                    <figure v-for="field in personalFields" class="key-val nested split-inputs">
                        <figure>{{field}}</figure>
                        <figure v-if="fieldValueFor(field, true).length">{{fieldValueFor(field)}}</figure>
                        <cin red="1" v-else small="1"
                             :text="selectedIdentity.personal[field]"
                             v-on:changed="x => selectedIdentity.personal[field] = x"
                             :placeholder="field" />
                    </figure>
                </section>

                <section class="key-val" v-if="locationFields.length">
                    <sel :selected="selectedLocation" label="Select a Location"
                         :options="selectedIdentity.locations"
                         :parser="location => location.name"
                         v-on:changed="selectLocation"></sel>
                    <br>
                    <label>Location Info</label>
                    <figure v-for="field in locationFields" class="key-val nested split-inputs">
                        <figure>{{field}}</figure>
                        <figure v-if="fieldValueFor(field, true).length">{{fieldValueFor(field)}}</figure>
                        <cin red="1" v-else small="1"
                             :text="clonedLocation[field]"
                             v-on:changed="x => clonedLocation[field] = x"
                             :placeholder="field" />
                    </figure>
                    <br>
                    <br>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import PopOutHead from '../../components/popouts/PopOutHead';
    import PopOutAction from '../../components/popouts/PopOutAction';
    import SearchBar from '../../components/reusable/SearchBar';
    import FullWidthRow from '../../components/reusable/FullWidthRow';
    import {IdentityRequiredFields} from "../../models/Identity";
    import Network from "../../models/Network";
    import WindowService from "../../services/WindowService";

    export default {
	    props:['popup', 'payload', 'pluginOrigin'],
	    components:{
		    PopOutHead,
		    PopOutAction,
		    FullWidthRow,
            SearchBar,
	    },
        data () {return {
	        selectedAccounts:[],
	        searchTerms:'',
            expanded:false,
	        selectedLocation:null,
            clonedLocation:null,
            selectedIdentity:null,
        }},
	    created(){
	    	this.selectedIdentity = this.identity.clone();
	    	this.selectedLocation = this.selectedIdentity.locations[0];
	    	this.clonedLocation = this.selectedIdentity.locations[0].clone();
		    this.expanded = true;
		    const {width, height} = this.popup.dimensions();
		    WindowService.changeWindowSize(height, width+(this.expanded ? 300 : 0));
	    },
        computed: {
	        ...mapState([
		        'scatter'
	        ]),
	        ...mapGetters([
		        'identity',
		        'identities',
		        'accounts',
		        'networks',
	        ]),
	        validAccounts() {
		        const alreadySelectedUniques = this.selectedAccounts.map(x => x.unique());

		        let neededBlockchains = this.accountRequirements.map(x => x.blockchain.toLowerCase());
		        let neededNetworks = this.accountRequirements.map(x => Network.fromJson(x).unique());

		        this.selectedAccounts.map(acc => {
		        	neededBlockchains.splice(neededBlockchains.indexOf(acc.blockchain), 1);
			        neededNetworks.splice(neededNetworks.indexOf(acc.network().unique()), 1);
                });

		        return this.accounts
			        .filter(x => neededNetworks.includes(x.networkUnique))
			        .filter(x => neededBlockchains.includes(x.blockchain().toLowerCase()))
			        .filter(x => !alreadySelectedUniques.includes(x.unique()))
			        .filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
			        .reduce((acc, account) => {
				        if(!acc.find(x => account.network().unique() === x.network().unique()
					        && account.sendable() === x.sendable())) acc.push(account);
				        return acc;
			        }, [])
                    .sort((a,b) => b.logins - a.logins)
                    .map(account => {
                    	let description = `${account.network().name}`;

                    	let actions = [];
                    	const authorities = account.authorities();

                    	// No authorities
                    	if(authorities.length < 2){
                    		actions.push({
			                    name:'Login',
			                    handler:() => this.selectAccount(account),
		                    });
                        }

                        // Multiple authorities
                        else {
                            account.authorities().map(acc => {
                            	const authAccount = this.accounts.find(x => x.unique() === acc.unique());
                            	if(alreadySelectedUniques.includes(authAccount.unique())) return false;
                            	actions.push({
		                            name:`Login with ${acc.authority}`,
		                            handler:() => this.selectAccount(authAccount),
		                            small:true,
                                    red:authAccount.authority === 'owner',
                                    blue:authAccount.authority !== 'owner',
	                            })
                            });
                        }

	                    actions = actions.filter(x => !!x);

                    	return {
		                    icon:'',
		                    title:account.sendable(),
		                    description,
		                    actions
	                    }
                    })
	        },
	        isValidIdentity() {
		        return this.selectedIdentity.hasRequiredFields(this.fields, this.clonedLocation);
	        },
	        fields() {
		        return IdentityRequiredFields.fromJson(this.payload.fields);
	        },

            accountFields(){
	            return this.fields.accounts.map(rawNetwork => Network.fromJson(rawNetwork));
            },
            personalFields(){
	            return this.fields.personal;
            },
	        locationFields(){
	            return this.fields.location;
            },


	        accountNetworks(){
                return this.accountFields.reduce((acc, accountNetwork) => {
                	const accNet = acc.find(x => x.network.unique() === accountNetwork.unique());
                	if(!accNet){
		                acc.push({
                            count:1,
                            network:this.networks.find(x => x.unique() === accountNetwork.unique())
                        })
                    } else {
		                accNet.count++;
                    }
                	return acc;
                }, [])
	        },


	        identityRequirements() {
		        return this.fields.personal.concat(this.fields.location).join(', ');
	        },
	        accountRequirements() {
		        return this.fields.accounts || [];
	        },
	        printableAccountRequirements() {
		        return this.accountRequirements.map(x => this.networks.find(y => y.chainId === x.chainId).name).join(' / ')
	        },
        },
        methods: {
	        returnResult(result){
		        this.$emit('returned', result);
	        },
            selectLocation(location){
	            this.selectedLocation = location;
	            this.clonedLocation = location.clone();
            },
            returnedIdentity(){



            },
	        selectAccount(account){
		        this.selectedAccounts.push(account);
		        if(this.accountRequirements.length > this.selectedAccounts.length)
			        return;

		        if(this.isValidIdentity) {

		        	this.returnResult({identity:this.selectedIdentity, accounts:this.selectedAccounts});
		        }
	        },
	        unselectAccount(account){
	        	this.selectedAccounts = this.selectedAccounts.filter(x => x.unique() !== account.unique());
            },
            selectedOfNetwork(network){
	        	return this.selectedAccounts.filter(x => x.network().unique() === network.unique())
            },


            fieldValueFor(field, useUnclonedIdentity = false){
	        	if(useUnclonedIdentity){
	        		return this.identity.getPropertyValueByName(field, this.selectedLocation);
                } else {
			        return this.selectedIdentity.getPropertyValueByName(field, this.clonedLocation);
                }

            },

	        expandOrContract(){
	        	this.expanded = !this.expanded;
	        	const {width, height} = this.popup.dimensions();
	            WindowService.changeWindowSize(height, width+(this.expanded ? 300 : 0));
            },

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../variables";

    .side-panel {
        width:300px;
        padding:10px 30px 40px;
        display:flex;
        flex-direction: column;
        overflow:auto;

        .line {
            width:100%;
            height:1px;
            background:rgba(0,0,0,0.1);
            margin:10px 0;
        }

    }

    .flex-row {
        display: flex;
        flex-direction: row;
        flex:1;
    }

    .flex-col {
        display: flex;
        flex-direction: column;
        flex:1;
    }

    .side-bar {
        cursor: pointer;
        height:calc(100vh - 70px);
        width:20px;
        background:$light-blue;
        border-left:1px solid $dark-blue;
        display:flex;
        justify-content: center;
        align-items: center;
        color:#fff;
        font-size: 11px;
        padding-right:3px;
    }

    .popout-list {
        .search-bar {
            margin-left:-30px;
        }
    }

    .missing-fields {
        padding:40px;
        text-align:center;
        flex:1;
        overflow:auto;
    }

</style>
