<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section class="token-buttons">
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
    import {Popup} from "../models/popups/Popup";
    import PopupService from "../services/PopupService";
    import RecurringService from "../services/RecurringService";
    import {store} from "../store/store";
    import HardwareService from "../services/HardwareService";
    import Keypair from "../models/Keypair";
    import ExternalWallet, {EXT_WALLET_TYPES} from "../models/hardware/ExternalWallet";
    import KeyPairService from "../services/KeyPairService";


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

        mounted(){
	        setTimeout(async() => {
	        	HardwareService.openConnections(true);
		        await PriceService.watchPrices();
		        await BalanceService.loadAllBalances();
		        await RecurringService.checkProxies();
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
            margin-left:5px;
        }
    }

    .total-balance {
        cursor: pointer;
        height:42px;
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
