<template>
    <section>
        <back-bar v-on:back="back" :text="account ? account.sendable() : null" :subtext="account ? account.network().name : null" />
        <section class="full-panel inner limited" v-if="token">
            <section class="split-panel" :class="{'recipient':!!account}">


                <!----------------------->
                <!--------- FROM -------->
                <!----------------------->
                <section class="panel">
                    <h4 class="padded" style="padding-bottom:0;">From</h4>
                    <FlatSelect label="Sending Account" style="padding-top:0;"
                                :items="senderAccounts"
                                :selected="account ? account.unique() : null"
                                v-on:selected="selectAccount" />
                </section>



                <!----------------------->
                <!------- TOKENS -------->
                <!----------------------->
                <section class="panel padded" style="flex:1; display:flex; flex-direction: column; overflow:auto;">
                    <h4>Amount</h4>
                    <cin :placeholder="parseFloat(1).toFixed(token.decimals)" label="Quantity"
                         big="1" type="number" />

                    <sel label="Token"
                         :selected="token"
                         :options="[{id:'custom', name:'Custom Token'}].concat(filteredTokens)"
                         :parser="t => `${t.name}${t.blockchain ? ` - ${blockchainName(t.blockchain)}` : ''}`"
                         v-on:changed="selectToken" />
                    <br>

                    <section class="custom-token" v-if="token.id === 'custom'">
                        <section class="split-inputs">
                            <sel style="flex:1; margin-left:0;" label="Blockchain"
                                 :selected="{value:token.blockchain}"
                                 :options="customTokenBlockchains"
                                 :parser="blockchain => blockchainName(blockchain.value)"
                                 v-on:changed="selectBlockchain"></sel>
                            <cin style="flex:1; margin-bottom:0;" :placeholder="contractPlaceholder" label="Contract" />
                        </section>
                        <br>
                        <section class="split-inputs">
                            <cin placeholder="XXX" label="Symbol" :text="token.symbol" v-on:changed="x => token.symbol = x" />
                            <cin placeholder="4" type="number" label="Decimals" :text="token.decimals" v-on:changed="x => token.decimals = x" />
                            <btn text="Save Token" v-on:clicked="addToken" />
                        </section>
                    </section>

                    <cin v-if="token.blockchain === Blockchains.EOSIO" label="Memo" textarea="1" />
                </section>



                <!----------------------->
                <!--------- TO ---------->
                <!----------------------->
                <section class="panel">
                    <h4 class="padded" style="padding-bottom:0;">Recipient</h4>
                    <section class="panel-switch" v-if="contacts.length">
                        <figure class="button" :class="{'active':recipientState === RECIPIENT_STATES.CONTACT}" @click="recipientState = RECIPIENT_STATES.CONTACT">Send to Contact</figure>
                        <figure class="button" :class="{'active':recipientState === RECIPIENT_STATES.DIRECT}" @click="recipientState = RECIPIENT_STATES.DIRECT">Send Directly</figure>
                    </section>


                    <!--------- CONTACTS ---------->
                    <FlatSelect v-if="recipientState === RECIPIENT_STATES.CONTACT"
                                label="Contacts"
                                :items="formattedContacts"
                                :selected="recipient"
                                selected-icon="icon-check"
                                icon="icon-cancel"
                                v-on:action="removeContact"
                                v-on:selected="selectRecipient" />


                    <!--------- DIRECT TO ADDRESS/ACCOUNT ---------->
                    <section v-if="recipientState === RECIPIENT_STATES.DIRECT" class="padded">
                        <cin placeholder="Make sure to check this twice."
                             :error="recipient.length > 0 ? recipientError : null"
                             :label="recipientLabel"
                             :text="recipient"
                             v-on:changed="x => recipient = x" />

                        <transition name="slide-right" mode="out-in">
                            <section class="split-inputs" v-if="recipient.length > 0 && !isAlreadyContact">
                                <cin style="flex:1;" placeholder="Contact Name"
                                     :label="`Do you want to add this ${recipientLabel} as a contact?`"
                                     :text="newContactName"
                                     v-on:changed="x => newContactName = x" />
                                <btn style="width:50px;" icon="icon-user-add" v-on:clicked="addContact" />
                            </section>
                        </transition>
                    </section>
                </section>
            </section>


            <section class="action-bar short bottom centered">
                <btn blue="1" text="Send"></btn>
            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import ResourceService from '../services/ResourceService'
    import PriceService from '../services/PriceService'
    import PluginRepository from '../plugins/PluginRepository'
    import TransferService from '../services/TransferService'
    import ContactService from '../services/ContactService'
    import {Blockchains, BlockchainsArray} from '../models/Blockchains'
    import PopupService from '../services/PopupService'
    import PasswordService from '../services/PasswordService'
    import KeyPairService from '../services/KeyPairService'
    import {Popup} from '../models/popups/Popup';
    import FlatSelect from "../components/reusable/FlatSelect";
    import Token from "../models/Token";
    import TokenService from "../services/TokenService";
    import IdGenerator from "../util/IdGenerator";
    import BalanceService from "../services/BalanceService";

    const uniqueToken = x => `${x.account}${x.blockchain}${x.name}${x.symbol}`;

    const RECIPIENT_STATES = {
    	CONTACT:'contact',
        DIRECT:'directly',
    }

    export default {
	    components: {
		    FlatSelect
        },
	    data () {return {
	    	recipientState:RECIPIENT_STATES.DIRECT,
		    RECIPIENT_STATES,
            
		    Blockchains,
		    BlockchainsArray,
            isSimple:false,
            sending:false,
            token:null,
            showingAll:false,

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
                // 'tokens',
            ]),
            ...mapGetters([
                'accounts',
                'contacts',
                'networks',
                'tokens',
                'networkTokens'
            ]),

            customTokenBlockchains(){
            	if(!this.account) return BlockchainsArray;
                return BlockchainsArray.filter(x => {
                	return x.value === this.account.blockchain()
                })
            },

	        senderAccounts(){
		        const reducer = accs => accs.reduce((acc,x) => {
			        if(!acc.find(y => `${y.networkUnique}${y.sendable()}` === `${x.networkUnique}${x.sendable()}`)) acc.push(x);
			        return acc;
		        }, []);

		        return reducer(this.accounts)
                    .map(account => ({
                        id:account.unique(),
                        title:account.sendable(),
                        description:`${account.network().name} - ${account.keypair().name}`,
                    }))
            },
	        filteredTokens(){
            	const allTokens = this.networkTokens.concat(this.tokens);
		        if(this.account) return allTokens.filter(x => x.blockchain === this.account.blockchain());
		        return allTokens;
	        },
            contractPlaceholder(){
            	return PluginRepository.plugin(this.token.blockchain).contractPlaceholder();
            },
            recipientLabel(){
	            return PluginRepository.plugin(this.token.blockchain).recipientLabel();
            },
            isValidRecipient(){
            	return !!TransferService.blockchainFromRecipient(this.recipient);
            },
            recipientError(){
                if(!PluginRepository.plugin(this.token.blockchain).isValidRecipient(this.recipient)) return 'Invalid Recipient';
                return null;
            },
            formattedContacts(){
                return this.contacts.map(x => ({
                    id:x.recipient,
                    title:x.name,
	                description:x.recipient,
                }));
            },
	        isAlreadyContact(){
		        return this.contacts.find(x => x.recipient.toLowerCase() === this.recipient.toLowerCase())
	        },




            filteredAccounts(){
            	const reducer = accs => accs.reduce((acc,x) => {
		            if(!acc.find(y => `${y.networkUnique}${y.sendable()}` === `${x.networkUnique}${x.sendable()}`)) acc.push(x);
		            return acc;
	            }, []);
                if(this.showingAll) return reducer(this.accounts);
                return reducer(this.accounts
                    .filter(x => this.balances.hasOwnProperty(x.unique()) && this.balances[x.unique()].length));
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
            accountFormatter(account){
                if(account) return `${account.network().name} - ${account.sendable()}`;
                else return 'Any account with sufficient balance'
            },
            grouper(account){
                if(account) return account.keypair().name;
                return 'General'
            },
            selectBlockchain(blockchain){
	            this.token.blockchain = blockchain.value;
	            this.token.decimals = PluginRepository.plugin(this.token.blockchain).defaultDecimals();
            },
	        selectRecipient(item){
	    		this.recipient = item.id;
            },
            selectAccount(item){
	    		if(this.account && item.id === this.account.unique()) this.account = null;
	    		else {
				    if(item.id === 'any'){

				    }
				    this.account = this.accounts.find(x => x.unique() === item.id);
				    //
				    // if(this.token && this.token.blockchain === account.blockchain()) {
				    //     const hasToken = !!this.filteredTokens.find(x => uniqueToken(x) === uniqueToken(this.token));
				    //     if(hasToken) return;
				    // }
                }
                this.token = this.filteredTokens[0];
            },
            selectToken(token){
	    		this.token = token.id === 'custom' ? Token.fromJson({id:token.id, name:token.name, blockchain:this.account ? this.account.blockchain() : Blockchains.EOSIO}) : token;
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
            availableBalance(token){
                if(!this.account) return PriceService.tokensFor(token).reduce((acc, x) => acc += parseFloat(x.balance), 0);
                const bal = this.balances[this.account.unique()].find(x => x.symbol === token.symbol);
                return bal ? bal.balance : 0;
            },

            /***
             * Returns an account if pre-selected,
             * If not then gets any account based on tokens needed or null if none found with
             * sufficient value/token balance.
             * @param tokensToSend
             * @returns {*}
             */
            sendingAccount(tokensToSend){
                if(this.account) return this.account;

                let blockchain;
                if(this.isSimple) {
                    blockchain = TransferService.blockchainFromRecipient(this.recipient);
                    if (!blockchain) return PopupService.push(Popup.prompt("Invalid Recipient", "You must enter a valid recipient", "attention-circled", "Okay"));
                } else {
                    blockchain = this.token.blockchain;
                }

                const plugin = PluginRepository.plugin(blockchain);
                if(this.isSimple) this.token = plugin.defaultToken();

                let account;
                this.accounts.filter(x => x.blockchain() === blockchain).map(acc => {
                    if(account) return;
                    const balance = this.balances.hasOwnProperty(acc.unique()) ? this.balances[acc.unique()].find(x => x.symbol === this.token.symbol) : null;
                    if(balance && parseFloat(balance.balance) > tokensToSend) account = acc;
                })

                return account;
            },


            async switchSimple(){
                if(this.amount > 0) {
                    this.amount = this.isSimple ? await PriceService.valueToTokens(this.token, this.amount) : await PriceService.tokensToValue(this.token, this.amount);
                }
                this.isSimple = !this.isSimple;
            },

            async send(){
                if(this.sending) return false;
                if(parseFloat(this.amount) <= 0) return PopupService.push(Popup.prompt("Invalid Amount", "You must send an amount greater than 0", "attention-circled", "Okay"));
                if(!this.recipient.trim().length) return PopupService.push(Popup.prompt("Invalid Recipient", "You must enter a valid recipient", "attention-circled", "Okay"));

                const tokensToSend = this.isSimple ? await PriceService.valueToTokens(this.token, this.amount) : this.amount;
                if(parseFloat(tokensToSend) <= 0) return PopupService.push(Popup.prompt("Could not calculate tokens from value.",
                    "Scatter most likely couldn't fetch the token price from the server due to rate limiting or congestion. Please try again later.", "attention-circled", "Okay"));

                const account = this.sendingAccount(tokensToSend);
                if(!account) return PopupService.push(Popup.prompt("Overspending balance.", "You don't have any account that has enough balance to make this transfer in it's base token.", "attention-circled", "Okay"));

                if(!await PasswordService.verifyPIN()) return;

                if(KeyPairService.isHardware(account.publicKey)){
                    const canConnect = await account.keypair().external.interface.canConnect();
                    if(canConnect !== true){
                        PopupService.push(Popup.prompt('Hardware Error', canConnect, 'attention', 'Cancel'))
                        account.keypair().resetExternal();
                        return;
                    }
                }

                this.sending = true;
                const sent = await TransferService[account.blockchain()]({
                    account,
                    recipient:this.recipient,
                    amount:tokensToSend,
                    memo:this.memo,
                    token:this.token,
                }).catch(() => false);
                this.sending = false;

                if(sent) await BalanceService.loadBalancesFor(account);

            },

        },
        watch:{
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
        transition:margin-left, 0.24s ease-in;
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
