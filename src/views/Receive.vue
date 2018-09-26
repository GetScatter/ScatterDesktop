<template>
    <section class="receive">

        <section class="qr">
            <figure class="bg"></figure>
            <section class="head">
                <figure class="title">Scan QR Code</figure>
                <figure class="description">
                    Scan this QR code create a transfer from your device with the details on the right.
                </figure>
            </section>

            <section class="code">
                <img :src="qr" />
            </section>
        </section>

        <section class="details">
            <section class="actions">
                <figure class="action" @click="showingReceipt = !showingReceipt">
                    {{showingReceipt ? 'Customize' : 'Show as Receipt'}}
                </figure>
            </section>

            <section class="data">

                <transition name="slide-left" mode="out-in">
                    <section key="receipt" v-if="showingReceipt" class="receipt">
                        <label>To</label>
                        <figure class="value">{{transaction.details.recipient}}</figure>

                        <label>Amount</label>
                        <figure class="value large">{{transaction.details.amount}} {{transaction.token.symbol}}</figure>

                        <section v-if="transaction.details.memo.length">
                            <label>Memo</label>
                            <figure class="value">{{transaction.details.memo}}</figure>
                        </section>
                    </section>


                    <section key="notreceipt" v-else>
                        <section class="inline-inputs">
                            <section class="inputs half">
                                <label>To Account</label>
                                <sel style="width:calc(100% - 60px)" :selected="account"
                                     :options="accounts"
                                     :parser="accountFormatter"
                                     :grouper="grouper"
                                     v-on:changed="selectAccount"></sel>

                                <figure class="action large" @click="copyAccount" v-tooltip="'Copy Account'">
                                    <i class="fa fa-copy"></i>
                                </figure>
                            </section>

                            <section class="inputs third">
                                <label>Token Type</label>
                                <sel :selected="token"
                                     :options="filteredTokens"
                                     :parser="t => t.name"
                                     :img-parser="t => t.logo"
                                     v-on:changed="selectToken"></sel>
                            </section>
                        </section>

                        <figure class="breaker"></figure>

                        <section class="inputs">
                            <label>Quantity</label>
                            <input class="amount" placeholder="0" v-model="transaction.details.amount" />
                        </section>

                        <transition name="slide-left" mode="out-in">
                            <section class="inputs" v-if="transaction.token.blockchain === Blockchains.EOSIO">
                                <label>Memo ( Optional )</label>
                                <input v-model="transaction.details.memo" />
                            </section>
                        </transition>
                    </section>
                </transition>


            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import {Blockchains} from '../models/Blockchains';
    import QRService from '../services/QRService';
    import PopupService from '../services/PopupService';
    import {Popup} from '../models/popups/Popup'
    import ElectronHelpers from '../util/ElectronHelpers';

    class TransactionData {
        constructor(){
            this.network = {
                blockchain:Blockchains.EOSIO,
                host:'https://nodes.get-scatter.com',
                port:443,
                chainId:'',
                protocol:'https',
            };

            this.details = {
                recipient:'none',
                amount:'0.0000',
                memo:''
            };

            this.token = {
                account:'eosio.token',
                symbol:'EOS',
                name:'EOS',
                blockchain:Blockchains.EOSIO
            };
        }
    }

    export default {
        data () {return {
            showingReceipt:false,
            account:null,
            Blockchains:Blockchains,
            transaction:new TransactionData(),
            qr:'',

            tokens:[
                {name:'EOS', logo:'', blockchain:'eos', symbol:'EOS'},
                {name:'ETH', logo:'', blockchain:'eth', symbol:'ETH'}
            ],
            token:null,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
                'contacts',
            ]),
            filteredTokens(){
                if(!this.account) return this.tokens;
                return this.tokens.filter(x => x.blockchain === this.account.blockchain())
            },
        },
        mounted(){
            this.selectAccount(this.accounts[0]);
            this.setQR();
        },
        methods:{
            copyAccount(){
                ElectronHelpers.copy(this.account.sendable());
                PopupService.push(Popup.snackbar('Copied Account to Clipboard.'))
            },
            async setQR(){
                this.qr = await QRService.createUnEncryptedQR(this.transaction);
            },
            accountFormatter(account){
                if(account) return account.formattedWithNetwork();
                else return 'Any account with sufficient balance'
            },
            grouper(account){
                if(account) return account.keypair().name;
                return 'General'
            },
            async selectAccount(account){
                this.account = account;
                await this.selectToken(this.filteredTokens[0]);
                this.transaction.details.recipient = account.sendable();
                await this.setQR();
            },
            async selectToken(token){
                this.token = token;
                this.transaction.token = token;
                await this.setQR();
            },
        },
        watch:{
            ['transaction.details.amount'](){
                this.setQR();
            },
            ['transaction.details.memo'](){
                this.setQR();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .receive {
        display:flex;
        flex-direction: row;
        flex:1;

        .qr {
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
                padding:40px;
                background:#fff;
                border-top-right-radius:8px;
                box-shadow:10px -10px 20px rgba(0,0,0,0.01);
                border-bottom:1px solid rgba(0,0,0,0.1);

                .title {
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom:5px;
                    color:$black;
                }

                .description {
                    font-size: 16px;
                    color:$dark-grey;
                }
            }

            .code {
                flex:1;
                padding:40px;
                display:flex;
                justify-content:center;
                align-items: center;

                img {
                    margin:-15px;
                }
            }
        }

        .details {
            flex:1.5;
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

                    &:hover {
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

                .receipt {

                    label {
                        font-size: 18px;
                        line-height:18px;
                        color:$medium-grey;
                        margin-bottom:10px;
                        display: block;
                    }

                    .value {
                        line-height:30px;
                        font-size: 30px;
                        margin-bottom:40px;

                        &.large {
                            font-size:60px;
                        }
                    }

                }


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

                        &.large {
                            width:50px;
                            height:50px;
                            line-height: 48px;
                            top:29px;
                            font-size: 18px;
                        }

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

                        &.amount {
                            font-size:40px;
                        }
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
