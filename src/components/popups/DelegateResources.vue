<template>
    <section>

        <section class="ram" v-if="nextPopIn">

            <section class="pop-in-head">
                <section>
                    <figure class="bubble-icon">
                        <i class="fa fa-globe"></i>
                    </figure>
                </section>
                <section>
                    <figure class="title">CPU & NET</figure>
                </section>
                <section>
                    <btn text="Cancel" red="true" v-on:clicked="returnResult(false)"></btn>
                    <btn :text="delegating ? 'Stake' : 'Unstake'" v-on:clicked="stakeOrUnstake"></btn>
                </section>
            </section>

            <section class="buy-sell">
                <swch first="Stake" second="Unstake" :selected="delegating ? 'Unstake' : 'Stake'" v-on:switched="delegating = !delegating"></swch>

                <!--<figure class="title">Buy RAM</figure>-->
                <figure v-if="delegating" class="description">Self staking CPU & NET for {{account.formatted()}} will let that account do more on the network.</figure>
                <figure v-else class="description">Unstaking CPU & NET takes 3 days. Every time you Unstake the timer is reset.</figure>

                <figure v-if="delegating" class="description"><b>You have {{balance}} available.</b></figure>

                <cin :forced="parseFloat(cpu) > 0" placeholder="EOS to stake in CPU" :text="cpu" type="number" v-on:changed="changed => bind(changed, 'cpu')"></cin>
                <cin :forced="parseFloat(net) > 0" placeholder="EOS to stake in NET" :text="net" type="number" v-on:changed="changed => bind(changed, 'net')"></cin>
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

    export default {
        data(){ return {
            eos:null,
            balance:'0.0000 EOS',
            accountData:null,
            delegating:true,
            cpu:0,
            net:0,
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
        },
        methods:{
            returnResult(bool){
                this.nextPopIn.data.callback(bool);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            async init(){

                PluginRepository.plugin(Blockchains.EOS).accountData(this.account, this.account.network()).then(data => {
                    if(!data || !data.hasOwnProperty('core_liquid_balance')) {
                        this.balance = null;
                        return null;
                    }

                    this.balance = data.core_liquid_balance;
                });

            },
            stakeOrUnstake(){
                if(this.cpu < 0 || this.net < 0) return null;
                if(this.cpu <= 0 && this.net <= 0) return null;

                const symbol = this.balance ? this.balance.split(' ')[1] : 'EOS';

                const cpu = `${parseFloat(this.cpu).toFixed(4)} ${symbol}`;
                const net = `${parseFloat(this.net).toFixed(4)} ${symbol}`;

                PluginRepository.plugin(Blockchains.EOS).stakeOrUnstake(this.account, cpu, net, this.account.network(), this.delegating).then(res => {
                    if(!res || !res.hasOwnProperty('transaction_id')) return false;
                    PopupService.push(Popup.snackbar(`${this.delegating ? 'Staked' : 'Unstaked'} CPU & NET`));
                    this.returnResult(res);
                }).catch(err => console.log(err))

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