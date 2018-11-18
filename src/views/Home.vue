<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section>
                    <router-link :to="{name:RouteNames.SETTINGS, params:{panel:SETTINGS_OPTIONS.TOKENS}}" class="total-balance">
                        <figure class="symbol">{{balance.symbol}}</figure>
                        <figure class="amount">{{formatNumber(balance.amount, true)}}</figure>
                        <figure class="chevron icon-right-open-big"></figure>
                    </router-link>
                    <!--<i class="icon-network"></i>-->
                    <!--<btn text="Exchange"></btn>-->
                </section>
                <section>
                    <btn v-on:clicked="$router.push({name:RouteNames.TRANSFER})" :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn :text="locale(langKeys.DASHBOARD.TOOLBARS.ReceiveButton)"></btn>
                </section>
            </section>

            <section class="split-panel">
                <Wallets class="panel" />
                <Apps class="panel" />
            </section>
        </section>

        <section class="full-panel center-fold" v-if="!keypairs.length">
            <section>
                <PiggyWaiting :faster="hoveringAddKeys" />
                <p>{{locale(langKeys.DASHBOARD.KEYS.NoKeys)}}</p>
            </section>
            <section class="action-bar short bottom centered">
                <btn @mouseover.native="hoveringAddKeys = true"
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
    import AccountService from "../services/AccountService";
    import BalanceService from "../services/BalanceService";
    import PriceService from "../services/PriceService";
    import PluginRepository from "../plugins/PluginRepository";
    import Token from "../models/Token";


    export default {
    	components:{
    		PiggyWaiting,
		    Wallets,
            Apps,
	    },
        data () {return {
	        hoveringAddKeys:false,
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
            		Object.keys(this.prices).map(blockchain => {
            			const token = PluginRepository.plugin(blockchain.toLowerCase()).defaultToken();
            			const balance = totals[token.unique()];

            			if(balance){
				            const price = this.prices[blockchain].price;
				            total += parseFloat(parseFloat(balance.amount) * parseFloat(price));
                        }

                    })

		            return Token.fromJson({
			            symbol:'USD',
			            amount:total.toFixed(2),
		            })
                }
            }
        },

        created(){
	        PriceService.watchPrices();
	        BalanceService.loadAllBalances();
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

    .total-balance {
        cursor: pointer;
        height:44px;
        padding:0 10px;
        outline:0;
        border:1px solid #dfe0e1;
        border-radius:4px;
        background:#fff;
        max-width:360px;
        display:flex;
        align-items: center;
        width:320px;

        &:hover {
            border:1px solid rgba(0,0,0,0.22);
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

            font-size: 14px;
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
