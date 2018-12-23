<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section class="token-buttons">
                    <section class="refresh" @click="refreshTokens" :class="{'loading':loadingBalances}">
                        <i v-if="!loadingBalances" class="icon-arrows-ccw"></i>
                        <i v-if="loadingBalances" class="icon-spin4 animate-spin"></i>
                        <!--<btn borderless="1" :disabled="loadingBalances" :loading="loadingBalances" v-on:clicked="refreshTokens" icon="icon-arrows-ccw" />-->
                    </section>

                    <router-link :to="{name:RouteNames.SETTINGS, params:{panel:SETTINGS_OPTIONS.TOKENS}}" class="total-balance">
                        <section class="icon" :class="{'big':balance.symbol.length === 1}">
                            <!--<i class="icon-arrows-ccw"></i>-->
                            {{balance.symbol}}
                        </section>

                        <section class="total-details">
                            <figure class="amount">{{formatNumber(balance.amount, true)}}</figure>
                            <figure class="dots">
                                <figure class="dot" v-for="i in [1,1,1]"></figure>
                            </figure>
                        </section>

                    </router-link>
                    <!--<btn text="Buy"></btn>-->
                    <!--<btn text="Exchange"></btn>-->
                </section>
                <section class="actions" style="margin-right:-10px;">
                    <btn borderless="1" v-on:clicked="$router.push({name:RouteNames.TRANSFER})" :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn borderless="1" v-on:clicked="$router.push({name:RouteNames.RECEIVE})" :text="locale(langKeys.DASHBOARD.TOOLBARS.ReceiveButton)"></btn>
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
    import Token from "../models/Token";
    import RecurringService from "../services/RecurringService";
    import HardwareService from "../services/HardwareService";
    import LanguageService from "../services/LanguageService";
    import AccountService from "../services/AccountService";


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
            ]),
            ...mapGetters([
                'keypairs',
                'accounts',
                'totalBalances',
                'displayToken',
                'displayCurrency',
            ]),
            balance(){
            	const totals = this.totalBalances.totals;


            	if(this.displayToken){
            		if(totals.hasOwnProperty(this.displayToken)) return totals[this.displayToken]
                    else {
                    	const token = Token.fromUnique(this.displayToken);
                    	token.amount = parseFloat(0).toFixed(token.decimals);
                    	return token;
                    }
                } else {
            		let total = 0;

            		Object.keys(this.prices).map(tokenUnique => {
			            const balance = totals[tokenUnique];
			            if(balance){
				            const price = this.prices[tokenUnique][this.displayCurrency];
				            const value = parseFloat(parseFloat(balance.amount) * parseFloat(price));
				            if(isNaN(value)) return;
				            total += value;
			            }
                    });

		            return Token.fromJson({
			            symbol:this.displayCurrency,
			            amount:total.toFixed(2),
		            })
                }
            }
        },

        methods:{
	        async refreshTokens(force = true){
	        	if(!force && Object.keys(this.balances).length) return;
	        	if(this.loadingBalances) return;
	        	this.loadingBalances = true;
		        await BalanceService.loadAllBalances(true);
		        this.loadingBalances = false;
            }
        },

        mounted(){
	        setTimeout(async() => {
	        	await AccountService.fixOrphanedAccounts();
		        await PriceService.watchPrices();
		        await this.refreshTokens(false);
		        await RecurringService.checkProxies();
		        await LanguageService.regenerateLanguage();
            })
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

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
                top:-25px;
                bottom:-25px;
                right:0;
                border-right:2px solid $border-standard;
            }
        }
    }

    .total-balance {
        display:flex;
        align-items: center;
        .icon {
            margin-top:3px;
            font-size: 16px;

            &.big {
                font-size: 22px;
            }
        }

        .total-details {
            display:flex;
            align-items: center;
            padding-left:15px;

            .amount {
                font-size: 24px;
                font-weight: 300;
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
        }
    }


</style>
