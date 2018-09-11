<template>
    <section>

        <section>

            <section class="selected-item scrollable" style="height:100vh">

                <figure class="name" style="padding-bottom:10px; border-bottom:1px solid rgba(0,0,0,0.1); margin-bottom:20px;">
                    Receive Tokens
                </figure>

                <section>
                    <sel :selected="account"
                         :options="eosAccounts"
                         :parser="x => `${x.network().name} - ${x.formatted()}`"
                         v-on:changed="selectAccount"></sel>
                </section>

                <section class="account-info">
                    <figure class="line"></figure>

                    <b>You can accept tokens at this address</b>
                    <figure style="margin-top:-10px">
                        <cin :text="account.sendable()" placeholder="" disabled="true" copy="true"></cin>
                    </figure>

                    <figure class="line"></figure>

                    <b>Or Create a Reusable QR</b>

                    <section v-if="account && token">

                        <section v-if="qr">
                            <btn text="Clear QR Code" large="true" v-on:clicked="clearQR"></btn>
                            <section style="width:200px; margin-left:-15px;">
                                <img :src="qr" />
                            </section>
                        </section>


                        <section class="info-box" v-if="!qr" style="margin-top:0;">

                            <swch first="Token Selector" second="Custom Token" :selected="customToken ? 'Token Selector' : 'Custom Token'" v-on:switched="toggleCustomToken"></swch>

                            <section v-if="!customToken">
                                <br>
                                <sel :selected="token"
                                     :options="tokens"
                                     :parser="t => t.name"
                                     :img-parser="t => t.logo"
                                     v-on:changed="selectToken"></sel>
                            </section>

                            <section v-else>
                                <cin placeholder="Custom Token Symbol" :text="token.symbol" v-on:changed="changed => bind(changed, 'token.symbol')"></cin>
                                <cin placeholder="Custom Token Account" :text="token.account" v-on:changed="changed => bind(changed, 'token.account')"></cin>
                            </section>

                            <section style="overflow:hidden;">
                                <cin class="half-input" placeholder="Quantity ( Optional )" type="number" :text="amount" v-on:changed="changed => bind(changed, 'amount')"></cin>
                                <cin class="half-input" placeholder="Memo ( Optional )" :text="memo" v-on:changed="changed => bind(changed, 'memo')"></cin>
                            </section>
                            <br>
                            <btn style="float:right;" text="Create QR Code" large="true" v-on:clicked="generateQR"></btn>

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
    import QRService from '../../services/QRService';

    import PluginRepository from '../../plugins/PluginRepository';
    import {Blockchains} from '../../models/Blockchains';

    let saveTimeout = null;

    export default {
        data () {return {
            account:null,

            amount:0,
            memo:'',

            sending:false,

            token:null,
            tokens:[],

            customToken:false,
            qr:null,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'accounts',
            ]),
            network(){
                return this.networks.find(x => x.unique() === this.account.networkUnique);
            },
            eosAccounts(){
                return this.accounts.filter(x => x.blockchain() === Blockchains.EOSIO);
            }
        },
        mounted(){
            this.account = this.eosAccounts[0];
            this.initTokens();
        },
        methods: {
            async initTokens(){
                this.token = null;
                await PluginRepository.plugin(this.account.blockchain()).fetchTokens(this.tokens);
                switch(this.account.blockchain()){
                    case Blockchains.EOSIO: this.token = this.tokens.find(x => x.symbol === 'EOS'); break;
                    case Blockchains.ETH: this.token = this.tokens.find(x => x.symbol === 'ETH'); break;
                }
                if(!this.token) this.token = this.tokens[0];
            },
            selectAccount(account){
                this.account = account;
                this.initTokens();
            },
            toggleCustomToken(){
                this.customToken = !this.customToken;
            },

            selectToken(token){
                this.token = token;
                this.setTokenBalance();
            },
            async generateQR(){
                this.qr = await QRService.createUnEncryptedQR({
                    blockchain:this.account.blockchain(),
                    chainId:this.account.network.chainId,
                    account:this.account.sendable(),
                    token:{
                        symbol:this.token.symbol,
                        account:this.token.account
                    },
                    amount:this.amount,
                    memo:this.memo
                });
            },
            clearQR(){
                this.qr = null;
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            token:{
                handler(){
                    if(!this.customToken) return;
                    this.setTokenBalance();
                }, deep:true
            }
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .line {
        height:1px; width:100%;
        background:rgba(0,0,0,0.1);
        margin:30px 0;
    }

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
