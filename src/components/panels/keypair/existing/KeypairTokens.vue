<template>
	<section class="panel-container limited">
		<h1>{{account.sendable()}}</h1>
		<section class="account-info">
			<p>{{blockchainName(account.blockchain())}} - <b>{{account.network().name}}</b></p>
			<br>
			<br>
			<router-link tag="p" :to="{name:RouteNames.SETTINGS, params:{panel:{name:'Tokens'}}}" v-if="hiddenTokenCount">
				<u style="cursor:pointer;">{{locale(langKeys.KEYPAIR.TOKENS.HiddenTokensCount, hiddenTokenCount)}}</u>
			</router-link>
		</section>

		<SearchBar class="search" :placeholder="locale(langKeys.KEYPAIR.ACCOUNTS.SearchPlaceholder)"
		           v-on:terms="x => searchTerms = x" />

		<section class="tokens-list">


			<!-- NETWORK SYSTEM TOKEN -->
			<section class="token" v-if="systemTokenBalance && matchesToken(searchTerms.trim().toLowerCase(), systemTokenBalance)">
				<figure class="symbol">
					<span>{{systemTokenBalance.symbol}}</span>
				</figure>
				<figure class="amount">
					{{systemTokenBalance.amount}}
					<span v-if="systemTokenBalance.fiatBalance()">{{systemTokenBalance.fiatBalance()}}</span>
				</figure>
				<section class="info">
					<figure class="system">SYSTEM TOKEN</figure>
					<figure>{{systemTokenBalance.contract}}</figure>
				</section>
			</section>

			<!-- ALL TOKENS BESIDES SYSTEM -->
			<section class="token" v-for="token in filteredTokens">
				<figure class="symbol">
					<span>{{token.symbol}}</span>
				</figure>
				<figure class="amount">
					{{token.amount}}
					<span v-if="token.fiatBalance()">{{token.fiatBalance()}}</span>
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

	export default {
		props:['account'],
		components:{
			SearchBar,
			FullWidthRow
		},
		data () {return {
			searchTerms:'',
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
					.filter(x => x.unique() !== this.systemToken.unique())
					.sort((a,b) => parseFloat(b.amount) - parseFloat(a.amount))
			},
			filteredTokens(){
				const terms = this.searchTerms.trim().toLowerCase();
				if(!terms.length) return this.tokens;
				return this.tokens.filter(x => this.matchesToken(terms, x));
			}
		},
		created(){

		},
		methods:{
			matchesToken(terms, token){
				if(token.name.toLowerCase().match(terms)) return true;
				if(token.symbol.toLowerCase().match(terms)) return true;
				if(token.contract.toLowerCase().match(terms)) return true;
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
				color:$dark-blue;
			}
		}
	}

	.tokens-list {
		margin-left: -70px;
		margin-right: -70px;
		padding: 0 70px;
		flex: 1;
		overflow: auto;
		border-top:1px solid #f4f4f4;


		.token {
			display:flex;
			align-items: center;
			padding:20px 0;

			&:not(:last-child){
				border-bottom:1px solid #f4f4f4;
			}

			.symbol {
				flex:0.5;

				span {
					font-size: 14px;
					font-weight: bold;
					background:$dark-blue;
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
