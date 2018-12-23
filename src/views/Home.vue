<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section class="token-buttons">
                    <btn style="padding:0 8px;" :disabled="loadingBalances" :loading="loadingBalances" v-on:clicked="refreshTokens" icon="icon-arrows-ccw" />
                    <router-link :to="{name:RouteNames.SETTINGS, params:{panel:SETTINGS_OPTIONS.TOKENS}}" class="total-balance">
                        <figure class="symbol">{{balance.symbol}}</figure>
                        <figure class="amount">{{formatNumber(balance.amount, true)}}</figure>
                        <figure class="chevron icon-right-open-big"></figure>
                    </router-link>
                    <!--<btn text="Buy"></btn>-->
                    <!--<btn text="Exchange"></btn>-->
                </section>
                <section>
                    <btn v-on:clicked="$router.push({name:RouteNames.TRANSFER})" :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn v-on:clicked="$router.push({name:RouteNames.RECEIVE})" :text="locale(langKeys.DASHBOARD.TOOLBARS.ReceiveButton)"></btn>
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
				            total += parseFloat(parseFloat(balance.amount) * parseFloat(price));
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
    }

    .total-balance {
        cursor: pointer;
        height:36px;
        padding:0 12px;
        outline:0;
        border:1px solid #dfe0e1;
        border-radius:3px;
        background:#fff;
        max-width:360px;
        display:flex;
        align-items: center;
        width:280px;
        margin-left:5px;

        &:hover {
            border:1px solid rgba(0,0,0,0.22);

            .chevron {

                animation: hover-bounce 0.7s ease infinite;
            }

            @keyframes hover-bounce {
                0%, 100% { transform:translateX(-2px) }
                50% { transform:translateX(2px) }
            }
        }

        &:active {
            border:1px solid $dark-blue;
            background:rgba(0,0,0,0.04);
        }

        .symbol {
            background:$light-blue;
            color:#fff;
            border-radius:50px;
            display: flex;
            justify-content: center;
            align-self: center;
            text-align:center;
            padding:5px 8px;
            margin-right:10px;

            font-size: 11px;
        }

        .amount {
            font-size: 20px;
            flex:1;
            padding-right:10px;
        }

        .chevron {
            color:$dark-blue;
        }
    }


</style>
