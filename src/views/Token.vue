<template>
	<section class="token-panel">
		<back-bar :subtext="token.symbol" style="border-bottom:0;" v-on:back="back" />

		<section class="panel-container">
			<figure class="bg"></figure>

			<section class="panel-top">
				<section class="values">
					<figure class="value">{{token.amount}} {{token.symbol}}</figure>
					<p>{{totalFiatBalance}}</p>
				</section>
			</section>

			<section class="token-filters">
				<SearchBar tokens="1" style="min-width:300px;" :placeholder="locale(langKeys.GENERIC.Search)" v-on:terms="x => searchTerms = x" />

			</section>

			<section class="tokens">

				<section class="token" v-for="balance in accountBalances">
					<figure class="icon" @click="goToAccount(balance.account)">{{balance.account.sendable()[0].toUpperCase()}}</figure>
					<section>
						<section class="title" :class="{'small':balance.account.sendable().length > 12}"><b>{{balance.account.sendable()}}</b></section>
						<section class="sub">{{formatNumber(balance.token.amount, true)}} {{balance.token.symbol}}</section>
					</section>
					<section>
						<section class="title"><b>{{formatNumber(balance.token.fiatBalance(), true) || '...'}}</b></section>
						<section class="sub">{{balance.token.network().name}}</section>
					</section>
					<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto;">
						<!--<btn colorless="1" style="width:auto;" text="Stabilize" />-->
						<!--<btn style="width:auto;" text="Exchange" />-->
						<figure @click="goToAccount(balance.account)" class="chevron icon-right-open-big"></figure>
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
	import Chartist from 'chartist';
	require("../styles/charts.scss");
	require("../styles/tokens.scss");

	export default {
		components:{
			SearchBar
		},
		data () {return {
			token:null,
			networkFilter:null,
			searchTerms:'',
		}},
		created(){
			this.token = this.fullTotalBalances.totals[this.$route.params.id];
		},
		computed:{
			...mapState([
				'scatter',
				'balances'
			]),
			...mapGetters([
				'accounts',
				'fullTotalBalances',
				'networks',
				'displayCurrency',
			]),
			accountBalances(){
				const terms = this.searchTerms.trim().toLowerCase();
				return Object.keys(this.balances).map(accUnique => {
					const exists = this.accounts.find(x => x.identifiable() === accUnique);
					const account = exists ? exists.clone() : null;
					if(!account || (terms.length && account.sendable().indexOf(terms) === -1)) return;

					const balances = this.balances[accUnique];
					const balance = balances.find(x => x.uniqueWithChain() === this.token.uniqueWithChain());
					if(!balance || balance.amount <= 0) return;

					const token = this.token.clone();
					token.amount = balance.amount;

					return {
						account,
						token,
					}
				}).filter(x => x)
					.sort((a,b) => (b.token.fiatBalance(false) || 0) - (a.token.fiatBalance(false) || 0));
			},
			totalFiatBalance(){
				return this.accountBalances.reduce((acc,x) => {
					acc += parseFloat(x.token.fiatBalance(false) || 0);
					return acc;
				}, 0).toFixed(4) + ' ' + this.displayCurrency;
			}
		},
		mounted(){

		},
		methods:{
			back(){
				this.$router.back();
			},
			goToAccount(account){
				this.$router.push({name:this.RouteNames.TOKENS, params:{account:account.unique()}})
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";



</style>