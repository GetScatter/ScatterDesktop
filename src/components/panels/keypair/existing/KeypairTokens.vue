<template>
	<section class="panel-container limited" style="padding-bottom:0;">
		<section>
			<h1>{{account.sendable()}}</h1>
			<section class="account-info">
				<p>{{blockchainName(account.blockchain())}} - <b>{{account.network().name}}</b></p>
				<p>{{totalFiatBalance}} <b>{{displayCurrency}}</b></p>
				<br>
				<br>
				<router-link tag="p" :to="{name:RouteNames.SETTINGS, params:{panel:{name:'Tokens'}}}" v-if="hiddenTokenCount">
					<u style="cursor:pointer;">{{locale(langKeys.KEYPAIR.TOKENS.HiddenTokensCount, hiddenTokenCount)}}</u>
				</router-link>
			</section>

			<SearchBar class="search" :placeholder="locale(langKeys.KEYPAIR.TOKENS.SearchPlaceholder)"
			           v-on:terms="x => searchTerms = x" />
		</section>

		<section class="tokens-list">


			<!-- NETWORK SYSTEM TOKEN -->
			<section class="token" v-if="systemTokenBalance && matchesToken(searchTerms.trim().toLowerCase(), systemTokenBalance)">
				<figure class="symbol">
					<span>{{systemTokenBalance.symbol}}</span>
				</figure>
				<figure class="amount">
					{{formatNumber(systemTokenBalance.amount, true)}}
					<span v-if="systemTokenBalance.fiatBalance()">{{formatNumber(systemTokenBalance.fiatBalance(), true)}}</span>
				</figure>
				<section class="info">
					<figure class="system">SYSTEM TOKEN</figure>
					<figure>{{systemTokenBalance.contract}}</figure>
				</section>
			</section>

			<!-- UNTOUCHABLE TOKENS -->
			<section class="token" v-if="untouchableTokens && matchesToken(searchTerms.trim().toLowerCase(), untouchableTokens)">
				<figure class="symbol">
					<span>{{untouchableTokens.symbol}}</span>
				</figure>
				<figure class="amount">
					{{formatNumber(untouchableTokens.amount, true)}}
					<span v-if="untouchableTokens.fiatBalance()">{{formatNumber(untouchableTokens.fiatBalance(), true)}}</span>
				</figure>
				<section class="info">
					<figure class="system">{{formatNumber(untouchableTokens.unusable, true)}}</figure>
					<figure>{{untouchableTokens.contract}}</figure>
				</section>
			</section>

			<!-- ALL TOKENS BESIDES SYSTEM -->
			<section class="token" v-for="token in filteredTokens">
				<figure class="symbol">
					<span>{{token.symbol}}</span>
				</figure>
				<figure class="amount">
					{{formatNumber(token.amount, true)}}
					<span v-if="token.fiatBalance()">{{formatNumber(token.fiatBalance(), true)}}</span>
				</figure>
				<section class="info">
					<figure :class="{'small':token.contract.length > 20}">{{token.contract}}</figure>
				</section>
			</section>


		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchBar from '../../../reusable/SearchBar'
	import FullWidthRow from '../../../reusable/FullWidthRow'
	import PluginRepository from "../../../../plugins/PluginRepository";

	export default {
		props:['account'],
		components:{
			SearchBar,
			FullWidthRow
		},
		data () {return {
			searchTerms:'',
			untouchableTokens:null,
		}},
		computed:{
			...mapState([
				'scatter',
				'balances',
				'prices',
			]),
			...mapGetters([
				'accounts',
				'balanceFilters',
				'displayCurrency',
			]),
			systemToken(){
				return this.account.network().systemToken();
			},
			accountBalances(){
				if(!this.balances.hasOwnProperty(this.account.identifiable())) return [];
				return this.balances[this.account.identifiable()];
			},
			systemTokenBalance(){
				if(!this.accountBalances) return null;
				return this.accountBalances.find(x => x.unique() === this.systemToken.unique());
			},
			hiddenTokenCount(){
				const balanceFilter = this.balanceFilters[this.account.blockchain()];
				if(!balanceFilter) return 0;
				if(!this.accountBalances) return 0;
				return this.accountBalances
					.filter(x => {
						return balanceFilter > parseFloat(x.amount);
					}).length
			},
			tokens(){
				const balanceFilter = this.balanceFilters[this.account.blockchain()];
				if(!this.accountBalances) return null;
				return this.accountBalances
					.filter(x => {
						if(!balanceFilter) return true;
						return balanceFilter <= parseFloat(x.amount);
					})
					.filter(x => x.unique() !== this.systemToken.unique() && x.identifiable() !== this.systemToken.identifiable())
					.sort((a,b) => parseFloat(b.amount) - parseFloat(a.amount))
			},
			filteredTokens(){
				const terms = this.searchTerms.trim().toLowerCase();
				if(!terms.length) return this.tokens;
				return this.tokens.filter(x => this.matchesToken(terms, x));
			},
			totalFiatBalance(){
				let total = 0;
				this.tokens.map(token => {
					if(token.fiatBalance()) total += parseFloat(token.fiatBalance().split(' ')[0]);
				});

				if(this.systemTokenBalance && this.systemTokenBalance.fiatBalance()) total += parseFloat(this.systemTokenBalance.fiatBalance().split(' ')[0]);
				if(this.untouchableTokens && this.untouchableTokens.fiatBalance()) total += parseFloat(this.untouchableTokens.fiatBalance().split(' ')[0]);

				return parseFloat(total).toFixed(2);
			}
		},
		created(){
			const plugin = PluginRepository.plugin(this.account.blockchain());
			if(plugin.hasUntouchableTokens()){
				plugin.untouchableBalance(this.account).then(token => {
					if(!token) return;
					this.untouchableTokens = token;
				})
			}
		},
		methods:{
			matchesToken(terms, token){
				if(token.name.toLowerCase().indexOf(terms) > -1) return true;
				if(token.symbol.toLowerCase().indexOf(terms) > -1) return true;
				if(token.contract.toLowerCase().indexOf(terms) > -1) return true;
				return false;
			}
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../../_variables";

	.panel-container {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 170px);
	}

	.search {
		margin-left:-30px;
	}

	.account-info {
		margin-top:-20px;

		p {
			font-size: 11px;

			b {
				color:$primary;
			}
		}
	}

	.tokens-list {
		margin-left: -70px;
		margin-right: -70px;
		padding: 0 70px;
		flex: 1;
		overflow: auto;
		border-top:1px solid $border-standard;


		.token {
			display:flex;
			align-items: center;
			padding:20px 0;

			&:not(:last-child){
				border-bottom:1px solid $border-standard;
			}

			.symbol {
				flex:0.5;

				span {
					font-size: 14px;
					font-weight: bold;
					background:$primary;
					padding:8px 15px;
					border-radius:50px;
					color:#fff;
				}
			}

			.info {
				flex:1;
				text-align:right;

				.system {
					font-size: 9px;
					font-weight: bold;
					color:$red;
					border-bottom:1px solid $red;
					display:inline-block;
					padding-bottom:5px;
					margin-bottom:5px;
				}

				.small {
					font-size: 11px;
				}

			}

			.amount {
				flex:1;
				font-size: 24px;
				color:$dark-grey;

				span {
					display:block;
					font-size: 11px;
				}

			}
		}
	}



</style>
