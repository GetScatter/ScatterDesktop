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
                    <btn :disabled="submitting" text="Cancel" red="true" v-on:clicked="returnResult(false)"></btn>
                    <btn :disabled="submitting" :text="buying ? 'Buy RAM' : 'Sell RAM'" v-on:clicked="buyOrSell"></btn>
                </section>
            </section>

            <section class="buy-sell" :class="{'disabled':!fetchedBalance}">
                <swch first="Buy" second="Sell" :selected="buying ? 'Sell' : 'Buy'" v-on:switched="toggleBuySell"></swch>

                <figure v-if="buying" class="description">Buying RAM for {{account.formatted()}} will let that account hold more data.</figure>
                <figure v-else class="description">Selling RAM for {{account.formatted()}} return EOS to that account at the current price of RAM.</figure>



                <section class="inputs">



                    <section class="slider-container">
                        <figure class="toggle-inputs" @click="inputsOnly = !inputsOnly"><i class="fa " v-tooltip="inputsOnly ? 'Sliders' : 'Inputs'" :class="inputsOnly ? 'fa-sliders' : 'fa-keyboard-o'"></i></figure>
                        <figure style="float:left; margin-top:3px;" class="separator"></figure>
                        <label style="float:left;">{{ram.quantity}} {{ram.denom}}</label>
                        <label v-if="buying" style="float:right;">{{parseFloat(balance.split(' ')[0] - (ram.quantity * price)).toFixed(4)}} {{balance.split(' ')[1]}}</label>
                        <slider v-if="!inputsOnly && buying" :min="0" :max="parseFloat(balance.split(' ')[0]).toFixed(4) / price" step="1" :value="ram.quantity" v-on:changed="x => ram.quantity = x"></slider>
                        <slider v-if="!inputsOnly && !buying && accountData" :min="0" :max="availableRam" step="1" :value="ram.quantity" v-on:changed="x => ram.quantity = x"></slider>
                        <cin v-if="inputsOnly" :forced="parseFloat(ram.quantity) > 0" :placeholder="`${ram.denom} to ${buying ? 'Buy' : 'Sell'}`" :text="ram.quantity === 0 ? '' : ram.quantity" type="number" v-on:changed="x => ram.quantity = x"></cin>
                    </section>


                    <sel :selected="ram.denom"
                         :options="Object.keys(denom).map(x => denom[x])"
                         v-on:changed="changeRamDenom"></sel>
                </section>
            </section>

        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../vue/Routing'
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
            inputsOnly:false,
            eos:null,
            pricePerByte:0,
            balance:'0.0000 EOS',
            fetchedBalance:false,
            accountData:null,
            buying:true,
            denom:denom,
            ram:{
                denom:denom.BYTES,
                quantity:0,
            },
            submitting:false,
        }},
        mounted(){
            this.eos = Eos({httpEndpoint:this.account.network().fullhost(), chainId:this.account.network().chainId});
            this.init();
        },
        computed:{
            ...mapState([
                'popups',
                'balances',
            ]),
            ...mapGetters([

            ]),
            account(){
                if(!this.nextPopIn) return null;
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
            },
            availableRam(){
                const ram = this.accountData.ram_quota - this.accountData.ram_usage;
                switch(this.ram.denom){
                    case denom.BYTES: return ram;
                    case denom.KB: return ram / 1024;
                    case denom.MB: return (ram / 1024) / 1024;
                }
            }
        },
        methods:{
            returnResult(bool){
                this.nextPopIn.data.callback(bool);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            async init(){
                const plugin = PluginRepository.plugin(Blockchains.EOSIO);
                this.balance = `${(await plugin.balanceFor(this.account, 'eosio.token', 'EOS')).toString()} EOS`;

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

                plugin.accountData(this.account, this.account.network()).then(data => {
                    this.fetchedBalance = true;
                    if(!data) return null;

                    this.accountData = data;
                });

            },
            toggleBuySell(){
                this.buying = !this.buying;
                this.ram.denom = denom.BYTES;
                this.ram.quantity = 0;
            },
            changeRamDenom(_denom){
                this.ram.denom = _denom;
                this.ram.quantity = 0;
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

                this.submitting = true;

                PluginRepository.plugin(Blockchains.EOSIO).buyOrSellRAM(this.account, bytes, this.account.network(), this.buying).then(res => {
                    if(!res || !res.hasOwnProperty('transaction_id')) {
                        this.submitting = false;
                        return false;
                    }
                    PopupService.push(Popup.snackbar(`${this.buying ? 'Bought' : 'Sold'} RAM`));
                    this.returnResult(res);
                }).catch(err => {
                    this.submitting = false;
                    alert(err)
                })
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['nextPopIn'],
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
            opacity: 1;
            transition: opacity 0.3s ease;

            &.disabled {
                opacity:0.2;
            }

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
                    width:100%;
                    margin-right: 18px;
                    display: inline-block;
                    vertical-align: bottom;
                    margin-top:10px;
                }

                .slider-container {
                    width: calc(70% - 25px);
                    margin-right: 18px;
                    display: inline-block;

                    margin-top: -47px;
                    vertical-align: middle;

                    label {
                        font-size: 13px;
                        font-family: 'Roboto', sans-serif;
                        font-weight: bold;
                        color:$dark-grey;
                        margin-bottom:10px;
                    }

                    .slider {
                        margin-top:5px;
                        float:left;
                    }

                    .toggle-inputs {
                        float:left;
                        font-size: 18px;
                        margin-top:-3px;
                        cursor: pointer;
                    }
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