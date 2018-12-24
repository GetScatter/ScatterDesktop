<template>
	<section>
		<back-bar v-on:back="back" />

		<section class="panel-container limited">
			<h1>Display Token & Fiat Symbol</h1>

			<br>
			<label>Fiat Currencies</label>
			<section class="tokens">
				<section class="token" :class="{'active':displayCurrency === currency.ticker}" v-for="currency in currencyList" @click="setDisplayCurrency(currency.ticker)">
					<figure class="icon">{{currency.symbol}}</figure>
					<section class="data">
						<section>
							<div>{{currency.ticker}}</div>
							<b>{{formatNumber(parseFloat(currency.price.amount).toFixed(2), parseInt(currency.price.amount) < 1000000)}}</b>
						</section>
					</section>
				</section>
			</section>

			<br>
			<label>System Tokens</label>
			<section class="tokens">
				<section class="token" :class="{'active':displayToken && displayToken === token.id}" v-for="token in networkTokensList" @click="setDisplayToken(token.token)">
					<figure class="icon">{{token.symbol}}</figure>
					<section class="data">
						<section>
							<div>{{token.token.network().name}}</div>
							<b v-if="token.amount">{{formatNumber(parseFloat(token.amount.amount).toFixed(2), parseInt(token.amount.amount) < 1000000)}}</b>
							<b v-else>--</b>
						</section>
					</section>
				</section>
			</section>
		</section>




	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import SearchBar from '../components/reusable/SearchBar';
	import PriceService from '../services/PriceService';
	import TokenService from "../services/TokenService";

	export default {
		components:{
			SearchBar
		},
		data () {return {
			currencies:{},
		}},
		computed:{
			...mapState([
				'scatter',
				'prices',
			]),
			...mapGetters([
				'accounts',
				'fullTotalBalances',
				'totalBalances',
				'networks',
				'networkTokens',
				'displayCurrency',
				'displayToken',
			]),
			currencyList(){
				return Object.keys(this.currencies).map(ticker => {
					const symbol = PriceService.fiatSymbol(ticker);
					return {
						id:`fiat_${ticker}`,
						ticker,
						symbol,
						price:PriceService.getTotal(this.totalBalances.totals, ticker, true)
					}
				});
			},
			networkTokensList(){
				return this.networkTokens.reduce((acc, t) => {
					if(!acc.find(x => x.unique() === t.unique())) acc.push(t);
					return acc;
				}, []).map(token => {
					return {
						id:token.uniqueWithChain(),
						ticker:token.name,
						symbol:token.symbol,
						amount:this.totalBalances.totals[token.uniqueWithChain()],
						token
					}
				});
			},
		},
		mounted(){
			PriceService.getCurrencyPrices().then(x => this.currencies = x);
		},
		methods:{
			back(){
				this.$router.back();
			},
			setDisplayToken(token){
				const t = this.displayToken === token.uniqueWithChain() ? null : token;
				TokenService.setDisplayToken(t);
			},
			setDisplayCurrency(ticker){
				TokenService.setDisplayCurrency(ticker);
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../_variables";

	.tokens {
		display:flex;
		flex-wrap: wrap;

		.token {
			cursor: pointer;
			border-radius:10px;
			border:1px solid $border-standard;
			width:calc(33.3333% - 10px);
			margin-bottom:10px;
			margin-right:10px;
			display:flex;
			align-items: center;

			&:nth-child(3n+3){
				margin-right:0;
			}

			.icon {
				width:60px;
				height:60px;
				display:flex;
				justify-content: center;
				align-items: center;
				border-right:1px solid $border-standard;
				border-top-left-radius:6px;
				border-bottom-left-radius:6px;
			}

			.data {
				padding:0 20px;
				display:flex;
				flex-direction: column;
				align-items: center;

				div {
					font-size: 11px;
					margin-bottom:3px;
				}
			}

			&:hover {
				border:1px solid $primary;

				.icon {
					background:$primary;
					color:#fff;
				}
			}

			&.active {
				border:1px solid $primary;
				background:$primary;
				color:#fff;

				.icon {
					background: #484b62;
				}
			}

		}
	}

</style>