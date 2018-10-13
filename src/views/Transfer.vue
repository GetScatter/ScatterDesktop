<template>
    <section class="transfer">

        <!-- ADDRESS BOOK -->
        <section class="address-book">
            <figure class="bg"></figure>

            <section class="head">Contacts</section>

            <section class="search">
                <!-- INPUT -->
                <section class="input">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search..." />
                </section>

            </section>

            <section class="addresses">
                <section class="address" v-for="contact in contacts" @click="recipient = contact.recipient">
                    <figure class="name">{{contact.name}}</figure>
                    <figure class="remove" @click="removeContact(contact)">
                        <i class="fa fa-ban"></i>
                    </figure>
                </section>

            </section>
        </section>



        <!-- TRANSFER DETAILS -->
        <section class="details" v-if="token">
            <section class="actions">
                <figure class="action" @click="switchSimple">
                    {{isSimple ? 'Customize' : 'Simple'}}
                </figure>
                <figure class="action" @click="sending ? null : send()">
                    <span v-if="!sending">Send</span>
                    <span v-else>
                        <i class="fa fa-circle-o-notch fa-spin"></i>
                    </span>
                </figure>
            </section>

            <section class="data">

                <section class="inline-inputs">
                    <section class="inputs half">
                        <label>Recipient</label>
                        <input :class="{'with-action':!isAlreadyContact, 'with-icon':recipient.length}" v-model="recipient" placeholder="Enter an Address or Account Name" />
                        <transition name="slide-down">
                            <figure class="prefix icon" v-if="recipient.length" @click="recipient = ''">
                                <i class="fa fa-times"></i>
                            </figure>
                        </transition>
                        <transition name="slide-down">
                            <figure v-if="!isAlreadyContact" class="action" v-tooltip="'Add Contact'" @click="addContact">
                                <i class="fa fa-address-card"></i>
                            </figure>
                        </transition>
                    </section>

                    <section class="inputs third">
                        <label>{{isSimple ? `Value ( ${token.symbol} )` : `Amount of ${token.name}`}}</label>
                        <input v-model="amount" :class="{'with-prefix':isSimple}" placeholder="0" type="number" />
                        <transition name="slide-down">
                            <figure class="prefix" v-if="isSimple">$</figure>
                        </transition>
                    </section>
                </section>

                <div style="height:30px; clear:both;"></div>

                <transition name="slide-left" mode="out-in">
                    <section key="complex" v-if="!isSimple">
                        <div class="breaker"></div>
                        <section class="inline-inputs">
                            <section class="inputs half">
                                <label>From Account</label>
                                <sel :selected="account"
                                     :options="[null].concat(filteredAccounts)"
                                     :parser="accountFormatter"
                                     :grouper="grouper"
                                     v-on:changed="selectAccount"></sel>
                            </section>

                            <section class="inputs third">
                                <label>Token Type</label>
                                <sel :selected="token" style="width:calc(100% - 55px);"
                                     :options="filteredTokens"
                                     :parser="t => showingAll ? t.name : `${t.name} (${availableBalance(t)})`"
                                     :img-parser="t => t.logo"
                                     v-on:changed="selectToken"></sel>

                                <section class="action" style="top:30px; height:49px; width:49px; line-height:48px; font-size: 24px;"
                                         v-tooltip="showingAll ? 'Show Mainnet' : 'Show All'" @click="showingAll = !showingAll">
                                    <i v-if="!showingAll" class="fa fa-eye"></i>
                                    <i v-else class="fa fa-eye-slash"></i>
                                </section>
                            </section>

                        </section>


                        <transition name="slide-left">
                            <section v-if="!isSimple && token.blockchain === Blockchains.EOSIO">
                                <div class="breaker"></div>
                                <section class="inputs">
                                    <input placeholder="Memo" v-model="memo" />
                                </section>
                            </section>
                        </transition>
                    </section>

                    <section key="simple" v-else>
                        <b>Value Transfers</b>
                        <p style="margin-top:5px;">
                            Value transfers automatically convert the value you specify into tokens that the account you are sending to accepts.
                            The tokens that are sent will always be value-paired tokens like EOS, ETH, TRX, and other tokens we provide fiat pairs to.
                        </p>
                    </section>
                </transition>



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

    export default {
        data () {return {
            Blockchains:Blockchains,
            isSimple:true,
            sending:false,
            token:null,
            showingAll:false,

            account:null,
            recipient:'',
            amount:0,
            memo:'',
        }},
        computed:{
            ...mapState([
                'scatter',
                'balances',
                'tokens',
            ]),
            ...mapGetters([
                'accounts',
                'contacts',
            ]),
            filteredTokens(){
                if(this.showingAll) return this.tokens;
                if(!this.account) return this.tokens
                    .filter(x => PriceService.tokensFor(x).length);
                return this.tokens
                    .filter(x => PriceService.tokensFor(x).some(y => y.account.unique() === this.account.unique()))
                    .filter(x => x.blockchain === this.account.blockchain())
            },
            filteredAccounts(){
                if(this.showingAll) return this.accounts;
                return this.accounts
                    .filter(x => this.balances.hasOwnProperty(x.unique()) && this.balances[x.unique()].length)
                    .reduce((acc,x) => {
                        if(!acc.map(y => y.sendable()).includes(x.sendable())) acc.push(x);
                        return acc;
                    }, [])
            },
            isAlreadyContact(){
                return this.contacts.find(x => x.recipient.toLowerCase() === this.recipient.toLowerCase())
            },
        },
        mounted(){
            this.token = this.tokens[0];
        },
        methods:{
            accountFormatter(account){
                if(account) return `${account.network().name} - ${account.sendable()}`;
                else return 'Any account with sufficient balance'
            },
            grouper(account){
                if(account) return account.keypair().name;
                return 'General'
            },
            selectAccount(account){
                this.account = account;
                this.token = this.filteredTokens[0];
            },
            selectToken(token){
                this.token = token;
            },
            async addContact(){
                if(!this.recipient.length) return;
                await ContactService.add(this.recipient, name);
            },
            async removeContact(contact){
                await ContactService.remove(contact);
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
                    if (!blockchain) return PopupService.push(Popup.prompt("Invalid Recipient", "You must enter a valid recipient", "ban", "Okay"));
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
                if(parseFloat(this.amount) <= 0) return PopupService.push(Popup.prompt("Invalid Amount", "You must send an amount greater than 0", "ban", "Okay"));
                if(!this.recipient.trim().length) return PopupService.push(Popup.prompt("Invalid Recipient", "You must enter a valid recipient", "ban", "Okay"));

                const tokensToSend = this.isSimple ? await PriceService.valueToTokens(this.token, this.amount) : this.amount;
                if(parseFloat(tokensToSend) <= 0) return PopupService.push(Popup.prompt("Could not calculate tokens from value.",
                    "Scatter most likely couldn't fetch the token price from the server due to rate limiting or congestion. Please try again later.", "ban", "Okay"));

                const account = this.sendingAccount(tokensToSend);
                if(!account) return PopupService.push(Popup.prompt("Overspending balance.", "You don't have any account that has enough balance to make this transfer in it's base token.", "ban", "Okay"));

                if(!await PasswordService.verifyPIN()) return;

                if(KeyPairService.isHardware(account.publicKey)){
                    const canConnect = await account.keypair().external.interface.canConnect();
                    if(canConnect !== true){
                        PopupService.push(Popup.prompt('Hardware Error', canConnect, 'exclamation-triangle', 'Cancel'))
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

                if(sent) await PriceService.getBalances();
            },

        },
        watch:{
            ['recipient'](){
                BlockchainsArray.map(({value}) => {
                    const plugin = PluginRepository.plugin(value);
                    if(plugin.isValidRecipient(this.recipient)){
                        const token = this.filteredTokens.find(x => x.blockchain === value);
                        if(token) this.selectToken(token);
                    }
                });
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .transfer {
        flex:1;
        display:flex;
        flex-direction: row;
        background:rgba(255,255,255,0.5);

        .address-book {
            flex:1;
            display:flex;
            flex-direction: column;
            background:$light-blue;
            position: relative;
            z-index:2;

            .bg {
                position:absolute;
                top:10px; bottom:0; left:0; right:0;
                background:#fff;
                z-index:-1;
            }

            .head {
                padding:20px 30px;
                background:#fff;
                font-size: 16px;
                font-weight: 600;
                color:$medium-grey;
                border-top-right-radius:8px;
                box-shadow:10px -10px 20px rgba(0,0,0,0.01);
            }

            .search {
                flex:0 0 auto;
                padding:0 30px;
                overflow: hidden;
                height:40px;
                background:#f3f3f3;
                border-top:1px solid #e1e1e1;
                border-bottom:1px solid #e1e1e1;

                .input {

                    .icon {
                        float:left;
                        font-size: 13px;
                        line-height:40px;
                        color: #aeaeae;
                    }

                    input {
                        margin-left:10px;
                        font-size: 11px;
                        float:left;
                        outline:0;
                        border:0;
                        height:40px;
                        background:transparent;

                    }
                }

            }

            .addresses {
                display:flex;
                flex-direction: column;
                overflow-y:auto;
                overflow-x:hidden;
                background:rgba(0,0,0,0.02);

                .address {
                    height:40px;
                    line-height:40px;
                    padding:0 10px 0 30px;
                    border-bottom:1px solid rgba(0,0,0,0.05);
                    background:rgba(0,0,0,0);
                    transition: all 0.2s ease;
                    transition-property: background, padding;
                    cursor: pointer;
                    font-size: 13px;
                    overflow: hidden;

                    &:hover {
                        background:#fff;
                        padding-left:35px;
                    }

                    .name {
                        width:calc(100% - 25px);
                        float:left;
                    }

                    .remove {
                        width:25px;
                        height:25px;
                        line-height:24px;
                        margin-top:6px;
                        float:left;
                        text-align:center;
                        border:1px solid rgba(0,0,0,0.1);
                        border-radius: 2px;
                        color:rgba(0,0,0,0.2);
                        transition: all 0.2s ease;
                        transition-property: background, border, color;

                        &:hover {
                            border:1px solid $red;
                            background:$red;
                            color:#fff;
                        }
                    }
                }
            }
        }

        .details {
            float:left;
            flex:2.5;
            display:flex;
            flex-direction: column;
            box-shadow: inset 1px 0 3px rgba(0,0,0,0.1);

            .actions {
                flex:0 0 auto;
                height:80px;
                display: flex;
                justify-content: space-between;
                background:$light-blue;
                padding:0 50px 0 30px;
                float:left;
                width:100%;

                .action {
                    margin-left:10px;
                    cursor: pointer;
                    border-radius: 2px;
                    border:1px solid #fff;
                    height:50px;
                    line-height:48px;
                    padding:0 20px;
                    text-align:center;
                    font-size: 24px;
                    color:#fff;

                    transition:all 0.2s ease;
                    transition-property: background, border, color;

                    &:hover, &.active {
                        background:#fff;
                        border:1px solid #fff;
                        color:$light-blue;
                    }
                }
            }

            .data {
                flex:1;
                padding:40px;
                overflow-y:auto;
                overflow-x:hidden;

                .breaker {
                    width:100%;
                    clear:both;
                }

                .inline-inputs {
                    display:flex;

                }

                .inputs {
                    margin-bottom:20px;
                    position: relative;

                    label {
                        font-size: 11px;
                    }

                    .action {
                        cursor: pointer;
                        position:absolute;
                        top:15px;
                        right:0;
                        width:35px;
                        height:35px;
                        line-height:33px;
                        font-size: 16px;
                        text-align:center;
                        border:1px solid rgba(0,0,0,0.2);
                        color:rgba(0,0,0,0.3);
                        border-radius:2px;

                        transition: all 0.2s ease;
                        transition-property: color, background, border;

                        &:hover {
                            background:$light-blue;
                            border:1px solid $light-blue;
                            color:#fff;
                        }
                    }

                    .prefix {
                        position:absolute;
                        bottom:3px;
                        left:0;
                        font-size: 22px;
                        color:$medium-grey;
                        font-weight: bold;


                        &.icon {
                            cursor: pointer;

                            &:hover {
                                color:$red;
                            }
                        }
                    }

                    input {
                        width:100%;
                        border:0;
                        outline:0;
                        background:transparent;
                        border-bottom:1px dashed rgba(0,0,0,0.2);
                        font-size: 24px;
                        margin-top:10px;

                        transition:all 0.4s ease;
                        transition-property: padding;

                        &.with-action {
                            padding-right:40px;
                        }

                        &.with-prefix {
                            padding-left:17px;
                        }

                        &.with-icon {
                            padding-left:25px;
                        }

                        $placeholdercolor:rgba(0,0,0,0.3);
                        &::-webkit-input-placeholder { color: $placeholdercolor; }
                        &::-moz-placeholder { color: $placeholdercolor; }
                        &:-ms-input-placeholder { color: $placeholdercolor; }
                        &:-moz-placeholder { color: $placeholdercolor; }
                    }

                    &.half {
                        flex:2;

                        &:nth-child(2){
                            margin-left:20px;
                        }
                    }

                    &.third {
                        flex:1;

                        &:nth-child(2){
                            margin-left:20px;
                        }
                    }
                }
            }
        }

    }



</style>
