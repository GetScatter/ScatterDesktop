<template>
	<section>
		<back-bar v-on:back="back" />

		<TokenSelector title="Display Token & Fiat Symbol" :lists="tokenLists" />

	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import SearchBar from '../../../components/reusable/SearchBar';
	import TokenSelector from '../../../components/panels/TokenSelector';
	import PriceService from '../../../services/PriceService';
	import TokenService from "../../../services/TokenService";

	export default {
		props:['popin'],
		components:{
			SearchBar,
			TokenSelector
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
					const amount = PriceService.getTotal(this.totalBalances.totals, ticker, true);
					return {
						id:ticker,
						name:ticker,
						symbol,
						amount:amount ? this.formatNumber(parseFloat(amount.amount).toFixed(2), parseInt(amount.amount) < 1000000) : '--',
						token:ticker
					}
				});
			},
			networkTokensList(){
				return this.networkTokens.reduce((acc, t) => {
					if(!acc.find(x => x.unique() === t.unique())) acc.push(t);
					return acc;
				}, []).map(token => {
					const amount = this.totalBalances.totals[token.uniqueWithChain()];
					return {
						id:token.uniqueWithChain(),
						name:token.name,
						symbol:token.symbol,
						amount:amount ? this.formatNumber(parseFloat(amount.amount).toFixed(2), parseInt(amount.amount) < 1000000) : '--',
						token
					}
				});
			},
			tokenLists(){
				return [
					{title:'Fiat Currencies', active:this.displayCurrency, handler:this.setDisplayCurrency, tokens:this.currencyList},
					{title:'System Tokens', active:this.displayToken, handler:this.setDisplayToken, tokens:this.networkTokensList}
				];
			}
		},
		mounted(){
			PriceService.getCurrencyPrices().then(x => this.currencies = x);
		},
		methods:{
			back(){
				this.popin.data.callback(true);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			setDisplayToken(id){
				const t = this.displayToken === id ? null : id;
				TokenService.setDisplayToken(t);
			},
			setDisplayCurrency(ticker){
				TokenService.setDisplayCurrency(ticker);
			},

			...mapActions([
				Actions.RELEASE_POPUP,
			])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

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