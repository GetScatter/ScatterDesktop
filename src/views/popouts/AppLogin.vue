<template>
    <section>
        <PopOutHead v-on:closed="returnResult" />
        <section class="flex-row">
            <section class="login-selector">
                <PopOutAction :origin="payload.origin" action="log in" />


                <section class="required-networks" v-if="accountNetworks.length > 1">
                    <figure class="requirements">It requires access to these networks</figure>
                    <section class="list">
                        <figure class="split-inputs" v-for="item in accountNetworks">
                            <!--<i class="icon-check" v-if="item.count - selectedOfNetwork(item.network).length === 0"></i>-->
                            <figure style="flex:3;">{{item.network.name}}</figure>
                            <figure class="bubble" v-if="item.count - selectedOfNetwork(item.network).length !== 0">{{item.count - selectedOfNetwork(item.network).length}}</figure>
                            <figure class="bubble blue" v-else><i class="icon-check"></i></figure>
                        </figure>
                    </section>
                </section>

                <section class="split-inputs" style="flex:0 0 auto;">
                    <SearchBar style="flex:1;" short="1" placeholder="Search Accounts" v-on:terms="x => searchTerms = x" />
                    <figure class="advanced-button" @click="showingAll = !showingAll">
                        {{showingAll ? 'Filter' : 'Show All'}}
                    </figure>
                </section>

                <section class="popout-list">
                    <FullWidthRow :items="validAccounts" popout="1" />
                </section>
            </section>


             <!--SIDE PANEL-->
            <figure class="side-bar" v-if="personalFields.length || locationFields.length"
                    :class="expanded ? 'icon-right-open-big' : 'icon-left-open-big'"
                    @click="expandOrContract"></figure>

            <section class="side-panel" v-if="expanded">

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
            showingAll:false,
        }},
	    created(){
	    	this.selectedIdentity = this.identity.clone();
	    	this.selectedLocation = this.selectedIdentity.locations[0];
	    	this.clonedLocation = this.selectedIdentity.locations[0].clone();

	    	if(this.locationFields.length || this.personalFields.length){
			    this.expanded = true;
			    const {width, height} = this.popup.dimensions();
			    WindowService.changeWindowSize(height, width+(this.expanded ? 300 : 0));
            }
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
		        let neededNetworks = this.accountRequirements.map(x => Network.fromJson(x).unique());

		        this.selectedAccounts.map(acc => {
			        neededNetworks.splice(neededNetworks.indexOf(acc.network().unique()), 1);
                });

		        return this.accounts
			        .filter(x => {
			        	return alreadySelectedUniques.includes(x.unique())
                            || neededNetworks.includes(x.networkUnique)
			        })
			        .filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
			        .reduce((acc, account) => {
			        	if(this.showingAll) acc.push(account);
			        	else {
					        if(!acc.find(x => account.network().unique() === x.network().unique()
						        && account.sendable() === x.sendable())) acc.push(account);
                        }

				        return acc;
			        }, [])
                    .sort((a,b) => b.logins - a.logins)
                    .map(account => {
	                    let description = `${account.network().name}`;
	                    let actions = [];
	                    const actionName = alreadySelectedUniques.includes(account.unique()) ? 'Remove'
                            : neededNetworks.length === 1 ? 'Login'
                            : neededNetworks.length === alreadySelectedUniques.length ? 'Login'
                            : 'Select';
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
	        	if(this.selectedAccounts.find(x => x.unique() === account.unique())){
	        	    return this.unselectAccount(account);
                }

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
            font-size: 13px;
            font-weight: bold;
        }

        .list {
            margin-top:10px;
            width:100%;
            height:45px;
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

                    &.blue {
                        background:$light-blue;
                        border:1px solid $dark-blue;
                        color:#fff;
                    }
                }
            }
        }
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        flex:1;

        background:#fafafa;
    }

    .login-selector {
        display: flex;
        flex-direction: column;
        flex:1;
        width:calc(100% - 320px);
    }

    .side-panel {
        width:300px;
        padding:10px 30px 40px;
        display:flex;
        flex-direction: column;
        overflow:auto;
        flex:0 0 auto;
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

    .advanced-button {
        font-size: 11px;
        text-decoration: underline;
        padding-right:30px;
        cursor: pointer;

        &:hover {
            color:$dark-blue;
        }
    }

    .popout-list {
        padding-top:0;


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
