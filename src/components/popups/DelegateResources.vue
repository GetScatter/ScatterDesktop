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
                    <btn :disabled="submitting" text="Cancel" red="true" v-on:clicked="returnResult(false)"></btn>
                    <btn :disabled="submitting" :text="delegating ? 'Stake' : 'Unstake'" v-on:clicked="stakeOrUnstake"></btn>
                </section>
            </section>

            <section class="buy-sell" :class="{'disabled':!fetchedBalance}">
                <swch first="Stake" second="Unstake" :selected="delegating ? 'Unstake' : 'Stake'" v-on:switched="toggleDelegating"></swch>

                <!--<figure class="title">Buy RAM</figure>-->
                <figure v-if="delegating" class="description">Self staking CPU & NET for {{account.formatted()}} will let that account do more on the network.</figure>
                <figure v-else class="description">Unstaking CPU & NET takes 3 days. Every time you Unstake the timer is reset.</figure>

                <br>
                <transition name="fade">
                    <label v-if="(lowCPU || lowNET) && !delegating">
                        <span class="red">
                            You are about to Unstake your resources dangerously. Always make sure you leave at least a few {{balance.split(' ')[1]}} on your account in both CPU and NET.
                        </span>
                        <br>
                        <br>
                    </label>
                </transition>

                <figure class="toggle-inputs" @click="inputsOnly = !inputsOnly"><i class="fa " v-tooltip="inputsOnly ? 'Sliders' : 'Inputs'" :class="inputsOnly ? 'fa-sliders' : 'fa-keyboard-o'"></i></figure>
                <figure style="float:left; margin-top:3px;" class="separator"></figure>

                <section v-if="delegating">
                    <section>
                        <label style="float:left;">{{parseFloat(cpu).toFixed(4)}} CPU <span class="separator"></span> {{parseFloat(net).toFixed(4)}} NET</label>
                        <label style="float:right;">{{parseFloat(balance.split(' ')[0] - net - cpu).toFixed(4)}} {{balance.split(' ')[1]}}</label>
                        <br>
                        <slider v-if="!inputsOnly && balance" :min="0" :max="balance.split(' ')[0] - this.net" step="0.0001" :value="cpu" v-on:changed="x => cpu = x"></slider>
                        <slider v-if="!inputsOnly && balance" :min="0" :max="balance.split(' ')[0] - this.cpu" step="0.0001" :value="net" v-on:changed="x => net = x"></slider>
                    </section>
                </section>

                <section v-if="!delegating">
                    <label style="float:left;">
                        <span :class="{'red':lowCPU}">{{parseFloat(parseFloat(totalCPU) - parseFloat(cpu)).toFixed(4)}} CPU</span>
                        <span class="separator"></span>
                        <span :class="{'red':lowNET}">{{parseFloat(parseFloat(totalNET) - parseFloat(net)).toFixed(4)}} NET</span>
                    </label>
                    <label style="float:right;">{{parseFloat(parseFloat(net) + parseFloat(cpu)).toFixed(4)}} {{balance.split(' ')[1]}}</label>
                    <br>
                    <slider v-if="!inputsOnly && balance" :red="lowCPU" :min="-availableCPU" :max="0" step="0.0001" :value="-cpu" v-on:changed="x => cpu = Math.abs(x)"></slider>
                    <slider v-if="!inputsOnly && balance" :red="lowNET" :min="-availableNET" :max="0" step="0.0001" :value="-net" v-on:changed="x => net = Math.abs(x)"></slider>
                </section>



                <section v-if="inputsOnly">
                    <br>
                    <cin :forced="parseFloat(cpu) > 0" :placeholder="`EOS to ${delegating ? 'stake' : 'unstake'} in CPU`" :text="cpu === 0 ? '' : cpu" type="number" v-on:changed="x => cpu = Math.abs(x)"></cin>
                    <cin :forced="parseFloat(net) > 0" :placeholder="`EOS to ${delegating ? 'stake' : 'unstake'} in NET`" :text="net === 0 ? '' : net" type="number" v-on:changed="x => net = Math.abs(x)"></cin>
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

    let keyTimer = null;

    export default {
        data(){ return {
            eos:null,
            fetchedBalance:false,
            balance:'0.0000',
            accountData:null,
            delegating:true,
            cpu:0,
            net:0,
            inputsOnly:false,
            submitting:false,
        }},
        mounted(){
            this.eos = Eos({httpEndpoint:this.account.network().fullhost(), chainId:this.account.network().chainId});
            this.init();
        },
        computed:{
            ...mapState([
                'popups',
                'balances'
            ]),
            ...mapGetters([

            ]),
            account(){
                if(!this.nextPopIn) return null;
                return this.nextPopIn.data.props.account;
            },
            availableCPU(){
                if(!this.accountData) return 0;
                if(!this.accountData.self_delegated_bandwidth) return 0;
                return this.accountData.self_delegated_bandwidth.cpu_weight.split(' ')[0];
            },
            availableNET(){
                if(!this.accountData) return 0;
                if(!this.accountData.self_delegated_bandwidth) return 0;
                return this.accountData.self_delegated_bandwidth.net_weight.split(' ')[0];
            },
            totalCPU(){
                if(!this.accountData) return 0;
                if(!this.accountData.total_resources) return 0;
                return this.accountData.total_resources.cpu_weight.split(' ')[0];
            },
            totalNET(){
                if(!this.accountData) return 0;
                if(!this.accountData.total_resources) return 0;
                return this.accountData.total_resources.net_weight.split(' ')[0];
            },
            lowCPU(){
                return parseFloat(this.totalCPU) - this.cpu <= 2
            },
            lowNET(){
                return parseFloat(this.totalNET) - this.net <= 2
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

                plugin.accountData(this.account, this.account.network()).then(data => {
                    this.fetchedBalance = true;

                    if(!data || !data.hasOwnProperty('core_liquid_balance')) return null;


                    this.accountData = data;
                    if(data.hasOwnProperty('refund_request')){
                        const refund = data.refund_request;
                        if(refund) {
                            const baseFunds = parseFloat(this.balance.split(' ')[0]);
                            const cpuRefund = parseFloat(refund.cpu_amount.split(' ')[0]);
                            const netRefund = parseFloat(refund.cpu_amount.split(' ')[0]);
                            this.balance = `${parseFloat(baseFunds + cpuRefund + netRefund).toFixed(4)} ${this.balance.split(' ')[1]}`
                        }
                    }
                });

            },
            toggleDelegating(){
                this.delegating = !this.delegating;
                this.cpu = 0;
                this.net = 0;
            },
            stakeOrUnstake(){
                if(this.cpu < 0 || this.net < 0) return null;
                if(this.cpu <= 0 && this.net <= 0) return null;

                this.submitting = true;

                const symbol = this.balance ? this.balance.split(' ')[1] : 'EOS';

                const cpu = `${parseFloat(this.cpu).toFixed(4)} ${symbol}`;
                const net = `${parseFloat(this.net).toFixed(4)} ${symbol}`;

                PluginRepository.plugin(Blockchains.EOSIO).stakeOrUnstake(this.account, cpu, net, this.account.network(), this.delegating).then(res => {
                    if(!res || !res.hasOwnProperty('transaction_id')) {
                        this.submitting = false;
                        return false;
                    }
                    PopupService.push(Popup.snackbar(`${this.delegating ? 'Staked' : 'Unstaked'} CPU & NET`));
                    this.returnResult(res);
                }).catch(err => {
                    this.submitting = false;
                    console.log(err)
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

            label {
                font-size: 13px;
                font-family: 'Roboto', sans-serif;
                font-weight: bold;
                color:$dark-grey;
                margin-bottom:10px;
            }

            .toggle-inputs {
                float:left;
                font-size: 18px;
                margin-top:-3px;
                cursor: pointer;
            }
        }
    }

    span {



        &.red {
            color:$red;
            animation: glow 1.5s infinite;
        }
    }


</style>