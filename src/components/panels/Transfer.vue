<template>
    <section>

        <section>
            <section class="head">

            </section>

            <section class="selected-item scrollable" v-if="account && token">

                <figure class="name">Transfer Tokens</figure>
                <figure class="description">
                    You can transfer funds between blockchain accounts using Scatter.
                </figure>



                <section class="split-panels left">
                    <section class="info-box">
                        <figure class="header">Token Details</figure>

                        <sel :selected="token"
                             :options="tokens"
                             :parser="t => t.symbol"
                             v-on:changed="selectToken"></sel>

                        <cin disabled="true" placeholder="Token Balance" :text="`${tokenBalance} ${token.symbol}`"></cin>

                        <section v-if="tokenBalance > 0">
                            <br>
                            <section style="overflow:hidden;">
                                <cin class="half-input" placeholder="Recipient Account" :text="to" v-on:changed="changed => bind(changed, 'to')"></cin>
                                <cin class="half-input" placeholder="Quantity" type="number" :text="amount" v-on:changed="changed => bind(changed, 'amount')"></cin>
                            </section>
                            <cin placeholder="Memo" :text="memo" v-on:changed="changed => bind(changed, 'memo')"></cin>
                            <br>
                            <btn style="float:right;" text="Send Tokens" :red="true" large="true" v-on:clicked="send"></btn>
                        </section>

                    </section>
                </section>


            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import Network from '../../models/Network'

    import {Popup} from '../../models/popups/Popup'
    import PopupService from '../../services/PopupService';

    import PluginRepository from '../../plugins/PluginRepository';
    import {Blockchains} from '../../models/Blockchains';

    let saveTimeout = null;

    export default {
        data () {return {
            to:'',
            amount:0,
            memo:'',

            token:null,
            tokens:[{
                account:'eosio.token',
                symbol:'EOS'
            }],
            tokenBalance:0,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ]),
            network(){
                return this.networks.find(x => x.unique() === this.account.networkUnique);
            }
        },
        mounted(){
            this.selectToken(this.tokens[0]);
            this.fetchTokens();
        },
        methods: {
            async fetchTokens(){
                const eosTokens = await fetch("https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json").then(res => res.json()).catch(() => []);
                eosTokens.map(token => {
                    if(!this.tokens.find(x => `${x.symbol}:${x.account}` === `${token.symbol}:${token.account}`)) this.tokens.push(token);
                });
            },

            selectToken(token){
                this.token = token;
                this.setTokenBalance();
            },

            async setTokenBalance(){
                this.tokenBalance = await PluginRepository.plugin(this.account.blockchain()).balanceFor(this.account, this.network, this.token.account, this.token.symbol);
            },

            async send(){
                if(parseFloat(this.amount) <= 0) return PopupService.push(Popup.prompt("Invalid Amount", "You must send an amount greater than 0", "ban", "Okay"));
                if(!this.to.trim().length) return PopupService.push(Popup.prompt("Invalid Recipient", "You must enter a valid recipient", "ban", "Okay"));

                if(this.account.blockchain() === Blockchains.EOS) this.sendEosTokens();
            },

            async sendEosTokens(){
                const decimals = this.tokenBalance.toString().split('.')[1].length || 4;
                const amount = parseFloat(this.amount).toFixed(decimals);
                this.amount = amount;



                PopupService.promptGuard(Popup.prompt(
                    "Sending Tokens",
                    `You are about to send ${this.amount} ${this.token.symbol} tokens to ${this.to}. Are you sure you want to continue?`,
                    "exclamation-triangle",
                    "Yes", () => {}, "No"
                ), async accepted => {
                    if(!accepted) return;

                    const transfer = await PluginRepository.plugin(this.account.blockchain())
                        .transfer(this.account, this.to, `${amount} ${this.token.symbol}`, this.network, this.token.account, this.token.symbol, this.memo);
                    if(transfer.hasOwnProperty('error')) PopupService.push(Popup.prompt("Transfer Error", transfer.error, "ban", "Okay"));
                    else PopupService.push(Popup.prompt("Success!", `Transaction ID: ${transfer.transaction_id}`, "check", "Okay"))
                })

            },

            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['account'],
        watch:{

        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .half-input {
        width:calc(50% - 10px);
        float:left;

        &:nth-child(2){
            width:50%;
            margin-left:10px;
            border-left:1px solid rgba(0,0,0,0.08);
            padding-left:10px;
        }
    }

</style>