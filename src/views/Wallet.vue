<template>
    <section class="wallet">
        <PanelTabs :tabs="tabs" :state="state" v-on:selected="x => state = x" />

        <SearchAndFilter v-on:terms="x => terms = x" :filters="filters" />

        <!----------------------------->
        <!--------- ACCOUNTS ---------->
        <!----------------------------->
        <section class="accounts-list-container" v-if="state === STATES.ACCOUNTS">
            <AccountList :accounts="filteredAccounts" v-on:account="goToAccount" />
        </section>


        <!----------------------------->
        <!----------- KEYS ------------>
        <!----------------------------->
        <section class="keys-list" v-if="state === STATES.KEYS">
            <section class="keypair" v-for="keypair in filteredKeypairs">
                <section class="details">
                    <section class="row">
                        <input placeholder="Give this keypair a memorable name" v-model="keypair.name" />
                    </section>
                    <section class="row">
                        <section class="blockchain-key" v-for="key in keypair.enabledKeys()">
                            <figure class="symbol token-eos-eos"></figure>
                            <figure class="key">{{key.key}}</figure>
                            <Button text="Copy" @click.native="copyPublicKey(key.key)" />
                        </section>
                    </section>
                </section>

                <section class="actions">
                    <section class="row">
                        <figure class="linked-accounts">
                            <Select v-if="keypair.accounts().length" :selected="`${keypair.accounts().length} linked accounts`" :options="keypair.accounts().map(x => x.formatted())" />
                            <figure class="no-accounts" v-if="!keypair.accounts().length">No linked accounts</figure>
                            <figure class="refresh-accounts" @click="refreshAccountsFor(keypair)" :class="{'disabled':!!refreshingAccounts}">
                                <i class="icon icon-arrows-ccw" :class="{'animate-spin':keypair.id === refreshingAccounts}"></i>
                                Refresh linked accounts
                            </figure>
                        </figure>
                    </section>
                    <section class="row">
                        <Button text="Private Key" />
                        <Button text="Remove" @click.native="removeKeypair(keypair)" />
                    </section>
                </section>
            </section>
        </section>








        <section class="wallet-actions">
            <section class="left">
                <section class="info">
                    <figure class="keys">{{keypairs.length}} keys</figure>
                    <figure class="accounts">{{accounts.length}} accounts</figure>
                </section>
            </section>
            <section class="right">
                <Button blue="1" @click.native="$router.push({name:RouteNames.IMPORT_KEY})" text="Import key" />
                <Button blue="1" text="Generate new key" />
            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import PanelTabs from '../components/reusable/PanelTabs';
    import {Blockchains, blockchainName, BlockchainsArray} from "../models/Blockchains";
    import PopupService from "../services/utility/PopupService";
    import {Popup} from "../models/popups/Popup";
    import ElectronHelpers from "../util/ElectronHelpers";
    import AccountService from "../services/blockchain/AccountService";
    import AccountList from "../components/misc/AccountList";

    const STATES = {
    	ACCOUNTS:'accounts',
        KEYS:'keys',
    }

    export default {
    	components:{
		    AccountList,
    	    PanelTabs
        },
        data () {return {
        	state:STATES.ACCOUNTS,
	        STATES,

            tab:null,
            blockchainFilter:null,
            terms:'',

            clonedKeypairs:[],
            refreshingAccounts:null,
        }},
        computed:{
            ...mapState([
            	'scatter',
            ]),
            ...mapGetters([
            	'keypairs',
            	'accounts',
            ]),
            tabs(){
            	return [
                    {name:'Accounts', state:STATES.ACCOUNTS},
                    {name:'Keys', state:STATES.KEYS},
                ]
            },
            filteredAccounts(){
                return this.accounts.reduce((acc,x) => {
                	if(!acc.find(a => a.sendable() === x.sendable())) acc.push(x);
                	return acc;
                }, []).filter(x => {
                	return !this.blockchainFilter || this.blockchainFilter === x.blockchain()
                }).filter(x => {
                	return x.sendable().toLowerCase().indexOf(this.terms) > -1
                        || x.authorities().find(a => a.authority.toLowerCase().indexOf(this.terms) > -1)
                }).sort((a,b) => {
                	return b.totalFiatBalance() - a.totalFiatBalance();
                })
            },
            filteredKeypairs(){
                return this.clonedKeypairs.filter(x => {
	                return !this.blockchainFilter || x.enabledKeys().map(({blockchain}) => blockchain).includes(this.blockchainFilter)
                }).filter(x => {
	                return x.name.toLowerCase().indexOf(this.terms) > -1
                        || x.enabledKeys().find(({key}) => key.toLowerCase().indexOf(this.terms) > -1)
                }).sort((a,b) => {
	                return b.accounts().length - a.accounts().length;
                })
            },
            filters(){
            	return [
                    {
                    	selected:this.blockchainFilter,
                        options:[null].concat(BlockchainsArray.map(x => x.value)),
                        parser:x => x === null ? 'All Blockchains' : blockchainName(x),
                        onSelect:x => this.blockchainFilter = x,
                    }
                ]
            }
        },
	    mounted(){
    		this.cloneKeypairs();
	    },
        methods:{
    		cloneKeypairs(){
			    this.clonedKeypairs = this.keypairs.map(x => x.clone());
            },
    		removeKeypair(keypair){
			    PopupService.push(Popup.removeKeypair(keypair, removed => {
				    if(removed) this.cloneKeypairs();
			    }));
            },
	        copyPublicKey(publicKey){
		        ElectronHelpers.copy(publicKey);
            },
            goToAccount(account){
    			this.setQuickActionsBack(true);
    			this.$router.push({name:this.RouteNames.ACCOUNT, params:{unique:account.unique()}});
            },
            async refreshAccountsFor(keypair){
    			if(this.refreshingAccounts) return;
    			this.refreshingAccounts = keypair.unique();
    			await AccountService.importAllAccounts(keypair);
    			this.refreshingAccounts = false;
            }
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .wallet {
        position: relative;
        height:calc(100vh - 180px);
        padding-bottom:50px;

        .accounts-list-container {
            overflow-y: auto;
            height:calc(100% - 130px);
        }

        .keys-list {
            padding:40px;
            display:flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-content: flex-start;
            overflow-y: auto;
            height:calc(100% - 110px);

            .keypair {
                width:100%;
                display:flex;
                padding-bottom:40px;
                margin-bottom:40px;

                &:not(:last-child){
                    border-bottom:1px solid $lightgrey;
                }

                .row {
                    height:40px;
                    display:flex;
                    align-items: center;

                    button {
                        margin-left:5px;
                    }

                    &:not(:last-child){
                        margin-bottom:20px;
                    }
                }

                .details {
                    flex:2;

                    input {
                        box-shadow:0 1px 6px $blue-shadow;
                        border:0;
                    }

                    .blockchain-key {
                        display:flex;
                        align-items: center;
                        width:100%;

                        .symbol {
                            flex:0 0 auto;
                            font-size: 24px;
                            padding-right:5px;
                        }

                        .key {
                            flex:1;
                            font-size: $small;
                            font-weight: bold;
                        }

                        button {
                            flex:0 0 auto;
                        }
                    }
                }

                .actions {
                    flex:1;
                    padding-left:20px;
                    display:flex;
                    flex-direction: column;
                    align-items: flex-end;

                    .linked-accounts {
                        font-size: $medium;
                        color:$silver;
                        font-weight: bold;
                        text-align:right;

                        .refresh-accounts {
                            font-size: $small;
                            margin-top:5px;
                            padding:3px 5px;
                            border-radius:$radius;
                            border:1px solid $lightgrey;
                            display:inline-block;
                            cursor: pointer;

                            &.disabled {
                                opacity:0.3;
                                cursor: not-allowed;
                            }
                        }
                    }
                }

            }
        }






        .wallet-actions {
            position:absolute;
            bottom:0;
            left:0;
            right:0;
            border-top:1px solid $lightgrey;
            height:70px;
            background:$white;

            display:flex;
            align-items: center;
            padding:0 20px;

            .left { flex:1; }
            .right { flex:0 0 auto; }

            .info {
                .keys {
                    font-size: $medium;
                    font-weight: bold;
                }

                .accounts {
                    font-size: $small;
                }
            }
        }
    }




</style>
