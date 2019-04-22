<template>
    <section>
        <PopOutHead v-on:closed="returnResult" :reputation="reputation" :loading-rep="loadingReputation" />
        <section class="multi-pane">
            <section class="main-panel">
                <PopOutAction :origin="popup.origin()" action="login" />

                <section class="required-networks" v-if="!validAccounts.length || (accountNetworks.length > 1 || (accountNetworks.length === 1 && accountNetworks[0].count > 1))">
                    <figure class="requirements">{{locale(langKeys.POPOUTS.LOGIN.AccountRequirements)}}</figure>
                    <section class="list">
                        <figure class="split-inputs" v-for="item in accountNetworks">
                            <figure style="flex:3;">{{item.network.name}}</figure>
                            <figure class="bubble" :class="{'red':networkAccountsCount(item.network.unique()) === 0}"
                                    v-if="item.count - selectedOfNetwork(item.network).length !== 0">{{item.count - selectedOfNetwork(item.network).length}}</figure>
                            <figure class="bubble blue" v-else><i class="icon-check"></i></figure>
                        </figure>
                    </section>
                </section>

                <section v-if="validAccounts.length" style="display: flex; flex-direction: column;">
                    <br v-if="stillNeedsFields" />

                    <section style="padding:0 30px;" v-if="stillNeedsFields">
                        <btn :text="locale(langKeys.POPOUTS.LOGIN.LoginButton)" blue="1" v-on:clicked="selectAccount" :disabled="!isValidIdentity" />
                    </section>


                    <section class="split-inputs" style="flex:0 0 auto;" v-if="!stillNeedsFields">
                        <SearchBar style="flex:1;" short="1" placeholder="Search Accounts" v-on:terms="x => searchTerms = x" />
                        <figure class="advanced-button" @click="showingAll = !showingAll">
                            {{showingAll
								? locale(langKeys.POPOUTS.LOGIN.FilterAccounts)
								: locale(langKeys.POPOUTS.LOGIN.ShowAllAccounts)
							}}
                        </figure>
                    </section>

                    <br v-if="stillNeedsFields" />

                    <section class="popout-list" :class="{'done':stillNeedsFields}">
                        <FullWidthRow :items="validAccounts" popout="1" />
                    </section>
                </section>

                <section style="padding:0 30px;" v-if="!validAccounts.length">
                    <br>
                    <br>
                    <section class="disclaimer less-pad red">
                        {{locale(langKeys.POPOUTS.LOGIN.NoAccountsTitle)}}
                        <br>
                        <br>
                        <p>
                            {{locale(langKeys.POPOUTS.LOGIN.NoAccountsDesc)}}
                        </p>
                    </section>

                    <section class="fixed-actions">
                        <btn :text="locale(langKeys.GENERIC.Cancel)" red="1" v-on:clicked="returnResult(null)" />
                    </section>
                </section>
            </section>


             <!--SIDE PANEL-->
            <figure class="side-bar" v-if="personalFields.length || locationFields.length"
                    :class="expanded ? 'icon-right-open-big' : 'icon-left-open-big'"
                    @click="$emit('expanded')"></figure>

            <section class="side-panel" v-if="expanded">

                <section class="disclaimer less-pad" :class="{'red':stillNeedsFields}" style="margin-top:20px; margin-bottom:10px;" v-if="missingFields">
                    {{locale(langKeys.POPOUTS.LOGIN.MissingFieldsTitle)}}
                    <p>{{locale(langKeys.POPOUTS.LOGIN.MissingFieldsDesc)}}</p>
                </section>

                <RequiredFields :identity="identity" :fields="fields"
                                :selected-identity="selectedIdentity"
                                :cloned-location="clonedLocation"
                                :selected-location="selectedLocation"
                                v-on:selectLocation="x => {selectedLocation = x; clonedLocation = x.clone(); }"
                                v-on:locationField="(key, val) => clonedLocation[key] = val"
                                v-on:personalField="(key, val) => selectedIdentity.personal[key] = val" />

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
    import RequiredFields from "../../components/popouts/RequiredFields";
    import RIDLService from "../../services/RIDLService";

    export default {
	    props:['popup', 'expanded'],
	    components:{
		    RequiredFields,
		    PopOutHead,
		    PopOutAction,
		    FullWidthRow,
            SearchBar,
	    },
        data () {return {
	        selectedAccounts:[],
	        searchTerms:'',
	        selectedLocation:null,
            clonedLocation:null,
            selectedIdentity:null,
            showingAll:false,
	        reputation:null,
        }},
	    created(){
		    setTimeout(async() => {
			    this.loadingReputation = true;
			    this.reputation = await RIDLService.checkApp(this.popup.data.props.payload.origin);
			    if(!this.reputation) this.reputation = await RIDLService.checkApp(this.popup.origin());
			    this.loadingReputation = false;
		    })

	    	this.selectedIdentity = this.identity.clone();
	    	this.selectedLocation = this.selectedIdentity.locations[0];
	    	this.clonedLocation = this.selectedIdentity.locations[0].clone();

	    	if(this.locationFields.length || this.personalFields.length){
	    		this.$emit('expanded');
            }
	    },
        computed: {
	        ...mapState([
		        'scatter',
		        'balances'
	        ]),
	        ...mapGetters([
		        'identity',
		        'identities',
		        'accounts',
		        'networks'
	        ]),
            payload(){ return this.popup.payload(); },
	        validAccounts() {
		        const alreadySelectedUniques = this.selectedAccounts.map(x => x.unique());
		        let neededNetworks = this.accountRequirements.map(x => Network.fromJson(x).unique());

		        this.selectedAccounts.map(acc => {
			        neededNetworks.splice(neededNetworks.indexOf(acc.network().unique()), 1);
                });

		        return this.accounts
			        .filter(x => {
			        	return alreadySelectedUniques.includes(x.unique())
                            || neededNetworks.includes(x.networkUnique)
			        })
			        .filter(x => x.authority !== 'watch')
			        .filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
			        .sort((a,b) => b.authority === 'active' ? 1 : 0)
			        .reduce((acc, account) => {
			        	if(this.showingAll) acc.push(account);
			        	else {
					        if(!acc.find(x => account.network().unique() === x.network().unique()
						        && account.sendable() === x.sendable())) acc.push(account);
                        }

				        return acc;
			        }, [])
                    .sort((a,b) => {
                    	const selected = this.selectedAccounts.find(x => x.unique() === b.unique()) ? 1
                            : this.selectedAccounts.find(x => x.unique() === a.unique()) ? -1 : 0;
                    	return selected || b.logins - a.logins
                    })
                    .map(account => {
                    	const systemBalance = account.systemBalance(true);
	                    let description = `${account.network().name}${systemBalance ? ' - '+systemBalance : ''}`;
	                    let actions = [];
	                    const actionName = alreadySelectedUniques.includes(account.unique()) ? this.locale(this.langKeys.GENERIC.Remove)
                            : neededNetworks.length === 1 ? this.locale(this.langKeys.POPOUTS.LOGIN.LoginButton)
                            : neededNetworks.length === alreadySelectedUniques.length ? this.locale(this.langKeys.POPOUTS.LOGIN.LoginButton)
                            : this.locale(this.langKeys.GENERIC.Select);
	                    actions.push({
		                    name:actionName,
		                    handler:() => this.selectAccount(account),
                            blue:1,
                            small:1,
	                    });
                    	return {
                    		title:this.showingAll ? account.formatted() : account.sendable(),
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
            missingFields(){
	        	if(!this.personalFields.length && !this.locationFields.length) return false;
	            return !this.identity.hasRequiredFields(this.fields);
            },
            stillNeedsFields(){
	        	return this.accountRequirements.length === this.selectedAccounts.length && this.missingFields
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
        },
        methods: {
	        returnResult(result){
		        this.$emit('returned', result);
	        },
            selectLocation(location){
	            this.selectedLocation = location;
	            this.clonedLocation = location.clone();
            },
	        selectAccount(account){
	        	if(account){
			        if(this.selectedAccounts.find(x => x.unique() === account.unique())){
				        return this.selectedAccounts = this.selectedAccounts
					        .filter(x => x.unique() !== account.unique());
			        }

			        this.selectedAccounts.push(account);
                }

		        if(this.accountRequirements.length > this.selectedAccounts.length) return;

		        if(this.stillNeedsFields){
			        if(!this.expanded){
				        this.$emit('expanded', 300, true);
			        }
                }

		        if(this.isValidIdentity) {

		        	this.returnResult({
                        identity:this.selectedIdentity,
                        location:this.clonedLocation,
                        accounts:this.selectedAccounts,
                        missingFields:this.missingFields
		        	});
		        }
	        },
            selectedOfNetwork(network){
	        	return this.selectedAccounts.filter(x => x.network().unique() === network.unique())
            },
            networkAccountsCount(networkUnique){
	            return this.accounts.filter(x => x.networkUnique === networkUnique).length;
            },

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../styles/variables";


    .required-networks {
        display:flex;
        flex:0 0 auto;
        padding:0 30px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom:10px;
        margin-top:-10px;

        .requirements {
            font-size: 11px;
            font-weight: bold;
        }

        .list {
            margin-top:10px;
            width:100%;
            max-height:45px;
            overflow: auto;
            padding-right:10px;

            .split-inputs {
                width:100%;

                &:not(:last-child){
                    margin-bottom:5px;
                }

                figure {
                    font-size: 13px;
                    font-weight: bold;
                }

                .bubble {
                    font-size: 11px;
                    background:#fff;
                    border:1px solid rgba(0,0,0,0.2);
                    padding:3px 10px;
                    border-radius:20px;
                    font-weight: bold;

                    &.red {
                        background:$red;
                        background-image: $red-gradient;
                        border:1px solid #c93c3b;
                        color:#fff;
                    }

                    &.blue {
                        background:$secondary;
                        background-image: $blue-grad;
                        border:1px solid $primary;
                        color:#fff;
                    }
                }
            }
        }
    }





    .advanced-button {
        font-size: 11px;
        text-decoration: underline;
        padding-right:30px;
        cursor: pointer;

        &:hover {
            color:$primary;
        }
    }

    .popout-list {
        padding-top:0;

        &.done {
            opacity:0.3;

            &:hover {
                opacity:1;
            }
        }


        .search-bar {
            margin-left:-30px;
        }
    }

</style>
