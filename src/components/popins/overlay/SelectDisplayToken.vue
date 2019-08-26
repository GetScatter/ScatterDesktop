<template>
	<section class="pop-over">
		<PopInHead title="Select Display Token" v-on:close="returnResult" />
		<section class="display-token">
			<label>Select a fiat currency</label>
			<section class="button-list">
				<Button :key="currency" v-for="(price, currency) in currencies" :text="currency" :blue="currency === displayCurrency" @click.native="setCurrency(currency)" />
			</section>
		</section>
		<section class="display-token">
			<label>Select a blockchain token</label>
			<section class="button-list">
				<Button :key="token.uniqueWithChain()" v-for="token in networkTokensList" :text="token.symbol" :blue="token.uniqueWithChain() === displayToken" @click.native="setToken(token)" />
			</section>
		</section>
	</section>
</template>

<script>
	import {mapState,mapGetters, mapActions} from 'vuex';
	import PriceService from "@walletpack/core/services/apis/PriceService";
	import TokenService from "@walletpack/core/services/utility/TokenService";
	import * as UIActions from "../../../store/ui_actions";

	export default {
		props:['popin'],
		data(){return {
			currencies:{},
		}},
		mounted(){
			PriceService.getCurrencyPrices().then(x => this.currencies = x);
		},
		computed:{
			...mapState([
				'scatter',
				'prices',
			]),
			...mapGetters([
				'displayToken',
				'displayCurrency',
			]),
			networkTokensList(){
				return this.scatter.networkTokens().filter(token => {
					return this.prices.hasOwnProperty(token.uniqueWithChain())
				}).reduce((acc, t) => {
					if(!acc.find(x => x.unique() === t.unique())) acc.push(t);
					return acc;
				}, [])
			},
		},
		methods:{
			returnResult(blockchain){
				this.popin.data.callback(blockchain);
				this[UIActions.RELEASE_POPUP](this.popin);
			},
			setCurrency:TokenService.setDisplayCurrency,
			setToken:TokenService.setDisplayToken,

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		}
	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.display-token {
		padding:40px;
		min-width:500px;

		.button-list {
			button {
				margin-right:5px;
				&:last-child {
					margin-right:0;
				}
			}
		}

		.currencies {

		}
	}

</style>