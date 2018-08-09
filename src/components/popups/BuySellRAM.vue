<template>
    <section>

        <section class="ram" v-if="nextPopIn">

            <section class="pop-in-head">
                <section>
                    <figure class="bubble-icon">
                        <i class="fa fa-microchip"></i>
                    </figure>
                </section>
                <section>
                    <figure class="title">RAM</figure>
                </section>
                <section>
                    <btn text="Cancel" red="true" v-on:clicked="returnResult(false)"></btn>
                    <btn :text="buying ? 'Buy RAM' : 'Sell RAM'" v-on:clicked="buyOrSell"></btn>
                </section>
            </section>

            <section class="buy-sell">
                <swch first="Buy" second="Sell" :selected="buying ? 'Sell' : 'Buy'" v-on:switched="buying = !buying"></swch>

                <!--<figure class="title">Buy RAM</figure>-->
                <figure v-if="buying" class="description">Buying RAM for {{account.formatted()}} will let that account hold more data.</figure>
                <figure v-else class="description">Selling RAM for {{account.formatted()}} return EOS to that account at the current price of RAM.</figure>

                <figure v-if="buying" class="description"><b>You have {{balance}} available.</b></figure>

                <section class="inputs">
                    <cin :forced="parseFloat(ram.quantity) > 0" :placeholder="ram.quantity !== 0 ? `${price * ram.quantity} EOS` : `RAM to ${buying ? 'buy' : 'sell'} in ${ram.denom}`" :text="ram.quantity" type="number" v-on:changed="changed => bind(changed, 'ram.quantity')"></cin>
                    <sel :selected="ram.denom"
                         :options="Object.keys(denom).map(x => denom[x])"
                         v-on:changed="changed => bind(changed, 'ram.denom')"></sel>
                </section>
            </section>

        </section>

    </section>
</template>

<script>
    import {RouteNames, RouteDepth} from '../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {PopupDisplayTypes} from '../../models/popups/Popup'
    import PluginRepository from '../../plugins/PluginRepository'
    import {Blockchains} from '../../models/Blockchains';

    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup';

    import Eos from 'eosjs';
    const {format} = Eos.modules;

    const denom = {
        BYTES:'Bytes',
        KB:'Kilo-Bytes',
        MB:'Mega-Bytes'
    }

    export default {
        data(){ return {
            eos:null,
            pricePerByte:0,
            balance:'0.0000 EOS',
            accountData:null,
            buying:true,
            denom:denom,
            ram:{
                denom:denom.BYTES,
                quantity:0,
            },
        }},
        mounted(){
            this.eos = Eos({httpEndpoint:this.account.network().fullhost(), chainId:this.account.network().chainId});
            this.init();
        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([
                'nextPopIn'
            ]),
            account(){
                return this.nextPopIn.data.props.account;
            },
            pricePerKB(){
                return (this.pricePerByte * 1024).toFixed(4);
            },
            pricePerMB(){
                return (this.pricePerKB * 1024).toFixed(4);
            },
            price(){
                switch(this.ram.denom){
                    case denom.BYTES: return this.pricePerByte;
                    case denom.KB: return this.pricePerKB;
                    case denom.MB: return this.pricePerMB;
                }
            }
        },
        methods:{
            returnResult(bool){
                this.nextPopIn.data.callback(bool);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            async init(){
                const parseAsset = asset => asset.split(' ')[0];
                const ramInfo = await this.eos.getTableRows({
                    json:true,
                    code:'eosio',
                    scope:'eosio',
                    table:'rammarket'
                }).then(res => {
                    const ramInfo = res.rows[0];
                    const systemSymbol = ramInfo.quote.balance.split(' ')[1];
                    return [parseAsset(ramInfo.quote.balance), parseAsset(ramInfo.base.balance), systemSymbol];
                });

                this.pricePerByte = (ramInfo[0] / ramInfo[1]).toFixed(8);

                PluginRepository.plugin(Blockchains.EOS).accountData(this.account, this.account.network()).then(data => {
                    if(!data) {
                        this.balance = 'Error getting balance';
                        return null;
                    }

                    this.balance = data.core_liquid_balance;
                });

            },
            buyOrSell(){
                let bytes = 0;
                switch(this.ram.denom){
                    case denom.BYTES: bytes = this.ram.quantity; break;
                    case denom.KB: bytes = this.ram.quantity * 1024; break;
                    case denom.MB: bytes = (this.ram.quantity * 1024) * 1024; break;
                }

                bytes = parseFloat(bytes);
                if(bytes <= 15) return alert("Bytes must be over 15");

                PluginRepository.plugin(Blockchains.EOS).buyOrSellRAM(this.account, bytes, this.account.network(), this.buying).then(res => {
                    if(!res || !res.hasOwnProperty('transaction_id')) return false;
                    PopupService.push(Popup.snackbar(`${this.buying ? 'Bought' : 'Sold'} RAM`));
                    this.returnResult(true);
                }).catch(err => alert(err))
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .ram {
        width:500px;

        .buy-sell {
            border-top:1px solid $light-grey;
            min-height:150px;
            padding:30px;

            .switcher {
                margin-top:-10px;
            }

            .description {
                font-size: 13px;
                margin-top:10px;
            }

            .inputs {
                border-top:1px solid $light-grey;
                margin-top:30px;
                padding-top:30px;

                .input {
                    width: calc(70% - 25px);
                    margin-right: 18px;
                    display: inline-block;
                    vertical-align: bottom;
                    margin-top:0;
                }

                .select {
                    width:30%;
                    display:inline-block;
                    margin-top:0;
                }
            }
        }
    }


</style>