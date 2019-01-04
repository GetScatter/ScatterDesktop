<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section class="token-buttons">
                    <section class="refresh" @click="refreshTokens" :class="{'loading':loadingBalances}">
                        <i v-if="!loadingBalances" class="icon-arrows-ccw"></i>
                        <i v-if="loadingBalances" class="icon-spin4 animate-spin"></i>
                    </section>

                    <router-link :to="{name:RouteNames.TOKENS}" class="total-balance">
                        <section class="total-details">
                            <figure class="amount">
                                {{totalBalance.symbol}}{{formatNumber(totalBalance.amount)}}
                                <div v-if="displayToken">{{formatNumber(totalTokenBalance.amount)}} {{totalTokenBalance.symbol}}</div>
                            </figure>
                            <figure class="dots">
                                <figure class="dot" v-for="i in [1,1,1]"></figure>
                            </figure>
                        </section>

                    </router-link>
                </section>
                <section class="actions" v-if="accounts.length">
                    <btn borderless="1" v-on:clicked="$router.push({name:RouteNames.TRANSFER})" :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn borderless="1" v-on:clicked="openExchange" :text="locale(langKeys.DASHBOARD.TOOLBARS.ExchangeButton)"></btn>
                    <btn v-if="history.length" borderless="1" v-on:clicked="openHistory" :text="locale(langKeys.DASHBOARD.TOOLBARS.HistoryButton)"></btn>
                </section>
            </section>

            <section class="split-panel">
                <Wallets style="flex:1;" class="panel" />
                <Apps style="flex:2;" class="panel" />
            </section>
        </section>

        <section class="full-panel center-fold" v-if="!keypairs.length">
            <section>
                <PiggyWaiting :faster="hoveringAddKeys" />
                <p>{{locale(langKeys.DASHBOARD.KEYS.NoKeys)}}</p>
            </section>
            <section class="action-bar short bottom centered">
                <btn id="tour1" @mouseover.native="hoveringAddKeys = true"
                     @mouseout.native="hoveringAddKeys = false"
                     v-on:clicked="newKeypair" blue="1"
                     style="width:300px;"
                     :text="locale(langKeys.DASHBOARD.KEYS.AddKeysButton)"></btn>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PiggyWaiting from '../components/svgs/PiggyWaiting'
    import Apps from '../components/panels/home/Apps';
    import Wallets from '../components/panels/home/Wallets';
    import BalanceService from "../services/BalanceService";
    import PriceService from "../services/PriceService";
    import Crypto from "../util/Crypto";
    import SingletonService from "../services/SingletonService";
    import PopupService from "../services/PopupService";
    import {Popup} from "../models/popups/Popup";


    export default {
    	components:{
    		PiggyWaiting,
		    Wallets,
            Apps,
	    },
        data () {return {
	        hoveringAddKeys:false,
	        loadingBalances:false,
        }},
        computed:{
            ...mapState([
            	'scatter',
	            'balances',
                'prices',
                'history',
            ]),
            ...mapGetters([
                'keypairs',
                'accounts',
                'totalBalances',
                'displayToken',
                'displayCurrency',
            ]),
            totalBalance(){
	            const totals = this.totalBalances.totals;
                return PriceService.getTotal(totals);
            },
            totalTokenBalance(){
	            const totals = this.totalBalances.totals;
                return PriceService.getTotal(totals, null, false, this.displayToken);
            }
        },

        methods:{
	        async refreshTokens(force = true){
	        	if(!force && Object.keys(this.balances).length) return;
	        	if(this.loadingBalances) return;
	        	this.loadingBalances = true;
		        await BalanceService.loadAllBalances(true);
		        await PriceService.getAll();
		        this.loadingBalances = false;
            },
	        openExchange(){
	            PopupService.push(Popup.exchange({}))
            },
	        openHistory(){
	            PopupService.push(Popup.history(null, () => {}))
            },
            ...mapActions([
            	Actions.LOAD_HISTORY,
                Actions.LOAD_LANGUAGE
            ])
        },

        created(){
            setTimeout(async() => {
	            // await Crypto.setRootMnemonic();
	            // const key = await Crypto.generatePrivateKey();
	            // console.log('key', key);
            }, 1000);
        },

        mounted(){
	        setTimeout(async() => {
	        	await SingletonService.init();
		        await this.refreshTokens(false);
            })
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .actions {
        button {
            font-weight: bold;
        }
    }

    .home {
        position:relative;
        display:flex;
        flex-direction: column;
    }

    .token-buttons {
        display:flex;
        button {

            &:not(:first-child){
                margin-left:5px;
            }
        }
        .refresh {
            cursor: pointer;
            margin-left:-30px;
            padding:0 15px;
            position:relative;
            margin-right:20px;
            display:flex;
            justify-content: center;
            align-items: center;
            font-size: 22px;
            &:after {
                content:'';
                display:block;
                position:absolute;
                top:0;
                bottom:0;
                right:0;
                border-right:2px solid $border-standard;
            }
        }
    }

    .total-balance {
        display:flex;
        align-items: center;
        .icon {
            font-size: 16px;
            padding-right:5px;
            margin-top:2px;

            &.big {
                font-size: 22px;
                padding-right:0;
                margin-top:0;
            }
        }

        .total-details {
            display:flex;
            align-items: center;
            padding-left:5px;

            .amount {
                font-size: 24px;
                font-weight: 300;

                div {
                    font-size: 11px;
                }
            }

            .dots {
                display:flex;
                align-items: center;
                margin-left:10px;

                $dot:4px;
                .dot {
                    width:$dot;
                    height:$dot;
                    background:$primary;
                    border-radius:50%;
                    margin-right:3px;
                }
            }

            &:hover {
                .dots {
                    animation: bounce-right 0.5s ease infinite;
                }
            }
        }
    }


</style>
