<template>
    <section>
        <back-bar v-on:back="back"
                  :text="account ? account.sendable() : null"
                  :subtext="account ? account.network().name : null" />

        <section class="full-panel inner limited" v-if="token">
            <section class="split-panel" :class="{'recipient':!!account}">


                <!----------------------->
                <!--------- FROM -------->
                <!----------------------->
                <section class="panel">
                    <h4 class="padded" style="padding-bottom:0;">{{locale(langKeys.TRANSFER.FROM.FromLabel)}}</h4>

                    <section class="split-inputs">
                        <SearchBar style="flex:1;" short="1" placeholder="Search Accounts" v-on:terms="x => searchTerms = x" />
                        <section class="padded" style="padding:0 30px; flex:1;">
                            <sel :options="[null].concat(networks)" style="margin-bottom:0;"
                                 :selected="networkFilter"
                                 v-on:changed="x => networkFilter = x"
                                 :parser="x => x ? x.name : 'None'" />
                        </section>

                    </section>
                    <br>

                    <FlatList :label="locale(langKeys.TRANSFER.FROM.SendingAccountsLabel)"
                              style="padding-top:0;"
                                :items="senderAccounts"
                                :selected="account ? account.unique() : null"
                                v-on:selected="selectAccount" />
                </section>



                <!----------------------->
                <!------- TOKENS -------->
                <!----------------------->
                <section class="panel padded" style="flex:1; display:flex; flex-direction: column; overflow:auto;">
                    <h4>Amount</h4>

                    <!-- AMOUNT TO SEND -->
                    <cin :placeholder="parseFloat(1).toFixed(token.decimals)"
                         :text="amount"
                         :error="amountError"
                         v-on:changed="x => amount = x"
                         :label="locale(langKeys.TRANSFER.TOKENS.AmountLabel)"
                         big="1" type="number"
                         :right-text="tokenBalance"
                         v-on:right="sendAllBalance"
                         v-on:blur="amount = amount.toString().length ? parseFloat(amount).toFixed(token.decimals) : ''" />


                    <sel :disabled="!account" :selected="token"
                         :parser="x => x.name"
                         :items="[]" as-button="1"
                         v-on:clicked="openTokenSelector" />
                    <br>

                    <section class="custom-token" v-if="token.id === 'custom'">
                        <section class="split-inputs">
                            <cin style="flex:1; margin-bottom:0;"
                                 :placeholder="contractPlaceholder"
                                 v-if="token.needsContract()"
                                 :label="locale(langKeys.GENERIC.Blockchain)"
                                 :text="token.contract"
                                 v-on:changed="x => token.contract = x" />
                        </section>
                        <br>
                        <section class="split-inputs">
                            <cin placeholder="XXX"
                                 :label="locale(langKeys.GENERIC.Symbol)"
                                 :text="token.symbol"
                                 v-on:changed="x => token.symbol = x" />

                            <cin placeholder="4" type="number"
                                 :label="locale(langKeys.GENERIC.Decimals)"
                                 :text="token.decimals"
                                 v-on:changed="x => token.decimals = x" />

                            <btn :text="locale(langKeys.TRANSFER.TOKENS.SaveTokenButton)" v-on:clicked="addToken" />
                        </section>
                    </section>

                    <cin v-if="token.blockchain === Blockchains.EOSIO"
                         :label="locale(langKeys.GENERIC.Memo)" textarea="1"
                         :text="memo"
                         v-on:changed="x => memo = x" />
                </section>



                <!----------------------->
                <!--------- TO ---------->
                <!----------------------->
                <section class="panel">
                    <h4 class="padded" style="padding-bottom:0;">{{locale(langKeys.TRANSFER.RECIPIENT.RecipientLabel)}}</h4>
                    <section class="panel-switch" v-if="formattedContacts.length || formattedSelfContacts.length">
                        <figure class="button" v-if="formattedContacts.length"
                                :class="{'active':recipientState === RECIPIENT_STATES.CONTACT}"
                                @click="recipientState = RECIPIENT_STATES.CONTACT">
                            {{locale(langKeys.TRANSFER.RECIPIENT.SendToContact)}}
                        </figure>
                        <figure class="button"
                                :class="{'active':recipientState === RECIPIENT_STATES.DIRECT}"
                                @click="recipientState = RECIPIENT_STATES.DIRECT">
                            {{locale(langKeys.TRANSFER.RECIPIENT.SendDirectly)}}
                        </figure>
                        <figure class="button" v-if="formattedSelfContacts.length"
                                :class="{'active':recipientState === RECIPIENT_STATES.SELF}"
                                @click="recipientState = RECIPIENT_STATES.SELF">
                            {{locale(langKeys.TRANSFER.RECIPIENT.SendSelf)}}
                        </figure>
                    </section>


                    <!--------- CONTACTS ---------->

                    <SearchBar v-if="recipientState === RECIPIENT_STATES.CONTACT"
                               :placeholder="locale(langKeys.TRANSFER.RECIPIENT.SearchContactsPlaceholder)"
                               v-on:terms="x => searchTermsContacts = x" />

                    <FlatList style="padding-top:0;" v-if="recipientState === RECIPIENT_STATES.CONTACT"
                                :label="locale(langKeys.TRANSFER.RECIPIENT.ContactsLabel)"
                                :items="filteredContacts"
                                :selected="recipient"
                                selected-icon="icon-check"
                                icon="icon-cancel"
                                v-on:action="removeContact"
                                v-on:selected="selectRecipient" />

                    <!--------- SELF CONTACTS ---------->

                    <SearchBar v-if="recipientState === RECIPIENT_STATES.SELF"
                               :placeholder="locale(langKeys.TRANSFER.RECIPIENT.SearchSelfPlaceholder)"
                               v-on:terms="x => searchTermsContacts = x" />

                    <FlatList style="padding-top:0;" v-if="recipientState === RECIPIENT_STATES.SELF"
                                :label="recipientLabel"
                                :items="formattedSelfContacts"
                                :selected="recipient"
                                selected-icon="icon-check"
                                v-on:selected="selectRecipient" />


                    <!--------- DIRECT TO ADDRESS/ACCOUNT ---------->
                    <section v-if="recipientState === RECIPIENT_STATES.DIRECT" class="padded">
                        <cin :placeholder="locale(langKeys.TRANSFER.RECIPIENT.VerifyRecipient)"
                             :error="recipient.length > 0 ? recipientError : null"
                             :label="recipientLabel"
                             :text="recipient"
                             v-on:changed="x => recipient = x" />

                        <transition name="slide-right" mode="out-in">
                            recipientError:{{recipientError}}
                            <section class="split-inputs" v-if="recipient.length > 0 && !isAlreadyContact && !recipientError">
                                <cin style="flex:1;" :placeholder="locale(langKeys.TRANSFER.RECIPIENT.ContactNamePlaceholder)"
                                     :label="locale(langKeys.TRANSFER.RECIPIENT.ContactNameLabel, recipientLabel)"
                                     :text="newContactName"
                                     v-on:changed="x => newContactName = x" />
                                <btn style="width:50px;" icon="icon-user-add" v-on:clicked="addContact" />
                            </section>
                        </transition>
                    </section>
                </section>
            </section>


            <section class="action-bar short bottom centered">
                <btn :loading="sending"
                     :disabled="!canSend"
                     blue="1"
                     :text="locale(langKeys.TRANSFER.SendButton)"
                     v-on:clicked="send" />
            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PluginRepository from '../plugins/PluginRepository'
    import TransferService from '../services/TransferService'
    import ContactService from '../services/ContactService'
    import {Blockchains, BlockchainsArray} from '../models/Blockchains'
    import PopupService from '../services/PopupService'
    import PasswordService from '../services/PasswordService'
    import KeyPairService from '../services/KeyPairService'
    import {Popup} from '../models/popups/Popup';
    import Token from "../models/Token";
    import TokenService from "../services/TokenService";
    import BalanceService from "../services/BalanceService";

    import FlatList from "../components/reusable/FlatList";
    import SearchBar from "../components/reusable/SearchBar";
    import HardwareService from "../services/HardwareService";

    const RECIPIENT_STATES = {
    	CONTACT:'contact',
        DIRECT:'directly',
        SELF:'self',
    }

    export default {
	    components: {
		    FlatList,
            SearchBar
        },
	    data () {return {
	    	recipientState:RECIPIENT_STATES.DIRECT,
		    RECIPIENT_STATES,

		    searchTerms:'',
		    searchTermsContacts:'',
            networkFilter:null,

		    Blockchains,
		    BlockchainsArray,
            sending:false,
            token:null,

            account:null,
            recipient:'',
            amount:0,
            memo:'',

            newContactName:'',
        }},
        computed:{
            ...mapState([
                'scatter',
                'balances',
            ]),
            ...mapGetters([
                'accounts',
                'contacts',
                'networks',
                'tokens',
                'networkTokens',
                'totalBalances'
            ]),

            /**************************/
            /**   LISTS AND FILTERS  **/
	        /**************************/

	        senderAccounts(){
		        const reducer = accs => accs.reduce((acc,x) => {
			        if(!acc.find(y => `${y.networkUnique}${y.sendable()}` === `${x.networkUnique}${x.sendable()}`)) acc.push(x);
			        return acc;
		        }, []);

		        const terms = this.searchTerms.trim().toLowerCase();

		        return reducer(this.accounts)
                    .filter(x => {
                    	return x.blockchain().toLowerCase().match(terms)
                            || x.sendable().toLowerCase().match(terms)
                            || x.keypair().name.toLowerCase().match(terms)
                    })
                    .filter(x => !this.networkFilter ? true : x.networkUnique === this.networkFilter.unique())
                    .filter(x => x.authority !== 'watch')
                    .sort((a,b) => b.logins - a.logins)
                    .map(account => ({
                        id:account.unique(),
                        title:account.sendable(),
                        description:`${account.network().name} - ${account.keypair().name}`,
                    }))
            },
	        filteredTokens(){
		        const standardTokens = this.networkTokens.filter(x => !this.account ? true : x.network().unique() === this.account.network().unique())
                    .concat(this.tokens);

		        const tokensFromBalances = (() => {
		        	if(!this.account) return [];
			        const accountBalances = this.balances[this.account.identifiable()].filter(x => x.chainId === this.account.network().chainId);
			        return accountBalances || [];
                })().sort((a,b) => b.amount - a.amount);
            	const allTokens = standardTokens.concat(tokensFromBalances);

            	const uniqueTokens = allTokens.reduce((acc,token) => {
            		if(!acc.find(x => x.unique() === token.unique())) acc.push(token);
            		return acc;
                }, [])

		        if(this.account) return uniqueTokens.filter(x => x.blockchain === this.account.blockchain());
		        return uniqueTokens;
	        },
	        formattedContacts(){
		        const contacts = this.contacts.filter(x => {
			        if(!this.account) return false;
			        return PluginRepository.plugin(this.account.blockchain()).isValidRecipient(x.recipient);
		        });

		        return contacts.map(x => ({
			        id:x.recipient,
			        title:x.name,
			        description:x.recipient,
		        }));
	        },
            formattedSelfContacts(){
	            const otherAccounts = !this.account ? [] : this.accounts
		            .filter(x => x.sendable() !== this.account.sendable())
		            .filter(x => x.networkUnique === this.account.networkUnique)
		            .reduce((acc,account) => {
			            if(!acc.find(x => x.sendable() === account.sendable())) acc.push(account);
			            return acc;
		            }, []);

	            return otherAccounts.map(x => ({
		            id:x.sendable(),
		            title:x.sendable(),
		            description:x.keypair().name
	            })).filter(x => JSON.stringify(x).match(this.searchTermsContacts));
            },
	        filteredContacts(){
		        const terms = this.searchTermsContacts.trim().toLowerCase();
		        return this.formattedContacts.filter(x => {
			        return x.id.toLowerCase().match(terms)
				        || x.title.toLowerCase().match(terms)
		        })
	        },



	        /**************************/
	        /**         MISC         **/
	        /**************************/

            contractPlaceholder(){
            	return PluginRepository.plugin(this.token.blockchain).contractPlaceholder();
            },
            recipientLabel(){
	            return PluginRepository.plugin(this.token.blockchain).recipientLabel();
            },
            isValidRecipient(){
            	return PluginRepository.plugin(this.token.blockchain).isValidRecipient(this.recipient);
            },
	        isAlreadyContact(){
		        return this.contacts.find(x => x.recipient.toLowerCase() === this.recipient.toLowerCase())
	        },
	        tokenBalance(){
            	if(!this.account) return;

            	const balanceToken = this.totalBalanceFor(this.token);
            	if(!balanceToken) return;
            	return balanceToken.formatted();
	        },
            canSend(){
            	return parseFloat(this.amount) > 0
                    && this.isValidRecipient
                    && this.account
                    && this.token
                    && !this.sending
            },


	        /**************************/
	        /**        ERRORS        **/
	        /**************************/
	        recipientError(){
		        if(!this.isValidRecipient) return this.locale(this.langKeys.TRANSFER.ERRORS.InvalidRecipient);
		        return null;
	        },
	        amountError(){
		        if(parseFloat(this.amount) <= 0) return this.locale(this.langKeys.TRANSFER.ERRORS.InvalidAmount);
		        return null;
	        },



        },
        mounted(){
            this.token = this.filteredTokens[0];
        },
        methods:{
	    	back(){
	    		if(this.account) return this.account = null;
	    	    this.$router.push({name:this.RouteNames.HOME})
            },
            openTokenSelector(){
	    		if(!this.account) return;

	    		let items = [{id:'custom', name:this.locale(this.langKeys.TRANSFER.TOKENS.CustomTokenLabel)}].concat(this.filteredTokens)
                    .map(token => {
	                    const balance = this.totalBalanceFor(token.id) ? this.totalBalanceFor(token.id).formatted() ? this.totalBalanceFor(token.id).formatted() :'' :'';
	                    const description = token.id === 'custom' ? null : balance
                    	return {
		                    id: token.id,
		                    title: token.name,
                            description
	                    }
                    })

	    	    PopupService.push(Popup.selector('Select a Token', items, token => {
	    	    	if(!token) return;
	    	    	this.selectToken(token);
                }))
            },
            tokenFromId(id){
	    	    return this.filteredTokens.find(x => x.id === id);
            },
	        totalBalanceFor(token){
		        if(typeof token === 'string'){
			        token = this.tokenFromId(token);
		        }

		        if(!this.account) return null;
		        if(!token) return null;
		        const accountBalances = this.balances[this.account.identifiable()];
		        if(!accountBalances) return null;
		        return this.balances[this.account.identifiable()].find(x => x.unique() === token.unique());
	        },
	        async addToken(){
	    		const token = new Token(
				    this.token.blockchain,
				    this.token.contract,
				    this.token.symbol,
				    this.token.symbol,
				    this.token.decimals
			    );
		        if(await TokenService.addToken(token)) this.token = token;
	        },
	        selectRecipient(item){
	    		this.recipient = item.id;
            },
            selectAccount(item){
	            this.account = this.account && item.id === this.account.unique()
                    ? null
                    : this.accounts.find(x => x.unique() === item.id);

	            if(!this.account || this.token.blockchain !== this.account.blockchain()){
		            this.token = this.filteredTokens[0];
                }

	            if(this.account && this.formattedContacts.length){
		            this.recipientState = RECIPIENT_STATES.CONTACT;
	            } else {
		            this.recipientState = RECIPIENT_STATES.DIRECT;
                }
            },
            selectToken(token){
	            this.token = token.id === 'custom'
		            ? Token.fromJson({id:token.id, name:token.title, blockchain:this.account ? this.account.blockchain() : Blockchains.EOSIO})
		            : this.filteredTokens.find(x => x.id === token.id);
	    		if(this.token.id === 'custom'){
	    			console.log('custom')
				    this.token.blockchain = this.account.blockchain();
				    this.token.decimals = PluginRepository.plugin(this.token.blockchain).defaultDecimals();
                }
            },
            async addContact(){
                if(!this.recipient.length) return;
                if(!this.newContactName.length) return;
                if(await ContactService.add(this.recipient, this.newContactName)){
                	this.recipientState = RECIPIENT_STATES.CONTACT;
                }
            },
            async removeContact(item){
	    		const contact = this.contacts.find(x => x.name === item.title);
                await ContactService.remove(contact);
                if(!this.contacts.length) this.recipientState = RECIPIENT_STATES.DIRECT;
            },

	        sendAllBalance(){
	    		this.amount = parseFloat(this.tokenBalance.split(' ')[0]).toFixed(this.token.decimals);
            },



            async send(){
	            const reset = () => this.sending = false;

	    		if(!this.canSend) return;
	    		this.sending = true;

	            if(!await PasswordService.verifyPIN()) return reset();

                const sent = await TransferService[this.account.blockchain()]({
                    account:this.account,
                    recipient:this.recipient,
                    amount:this.amount,
                    memo:this.memo,
                    token:this.token,
                }).catch(() => false);

                reset();
                if(sent) {
                	await BalanceService.loadBalancesFor(this.account);
                	this.account = null;
                }

            },

        },
        watch:{
	    	['account'](){
	    	    if(this.account){
			        if(this.token.blockchain === this.account.blockchain() && this.filteredTokens.find(x => x.unique() === this.token.unique())) return;
			        const token = this.filteredTokens.find(x => x.blockchain === this.account.blockchain());
			        if(token) this.selectToken(token);
                }
            },
            ['recipient'](){
                BlockchainsArray.map(({value}) => {
                    const plugin = PluginRepository.plugin(value);
                    if(plugin.isValidRecipient(this.recipient)){
                        if(this.token.blockchain === value) return;
                        const token = this.filteredTokens.find(x => x.blockchain === value);
                        if(token) this.selectToken(token);
                    }
                });
            },
            ['token.decimals'](){
            	if(this.token.decimals > 20) this.token.decimals = 20;
            },
            ['token'](){
            	this.amount = '';
            },
            ['networkFilter'](){
	            const token = this.filteredTokens[0];
	            if(token) this.selectToken(token);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .full-panel {
        min-height:calc(100vh - 250px);
        display:flex;
        flex-direction: column;

        &.limited {
            overflow-x:hidden;
        }
    }

    .split-panel {
        overflow-x:hidden;
        transition:margin-left, 0.24s;
        width:150%;
        margin-left:0;

        &.recipient {
            margin-left:calc(-50% - 2px);
        }
    }

    .panel {
        flex:1;
        position: relative;
        display:flex;
        flex-direction: column;
        width:33.333%;
        max-width:33.333%;
        min-width:33.333%;
    }

    .padded {
        padding:30px;
    }

    .custom-token {
        margin-top:-25px;
        padding:20px 10px 0 10px;
        background:rgba(0,0,0,0.02);
        border:1px solid rgba(0,0,0,0.1);
        border-top:0;
        border-bottom-left-radius:4px;
        border-bottom-right-radius:4px;
        margin-bottom:20px;
    }



</style>
