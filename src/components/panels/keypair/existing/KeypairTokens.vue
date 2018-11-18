<template>
	<section class="panel-container limited">
		<h1>{{account.sendable()}}</h1>
		<section class="account-info">
			<p>{{blockchainName(account.blockchain())}} - <b>{{account.network().name}}</b></p>
			<br>
			<br>
		</section>

		<SearchBar class="search" :placeholder="locale(langKeys.KEYPAIR.ACCOUNTS.SearchPlaceholder)"
		           v-on:terms="x => searchTerms = x" />

		<section class="tokens-list">


			<!-- NETWORK SYSTEM TOKEN -->
			<section class="token" v-if="systemTokenBalance && matchesToken(searchTerms.trim().toLowerCase(), systemTokenBalance)">
				<figure class="symbol">
					<span>{{systemTokenBalance.symbol}}</span>
				</figure>
				<figure class="amount">{{systemTokenBalance.amount}}</figure>
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
				<figure class="amount">{{token.amount}}</figure>
				<section class="info">
					<figure>{{token.contract}}</figure>
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
			]),
			systemToken(){
				return this.account.network().systemToken();
			},
			accountBalances(){
				if(!this.balances.hasOwnProperty(this.account.identifiable())) return [];
				return this.balances[this.account.identifiable()];
			},
			systemTokenBalance(){
				return this.accountBalances.find(x => x.unique() === this.systemToken.unique());
			},
			tokens(){
				return this.accountBalances.filter(x => x.unique() !== this.systemToken.unique()).sort((a,b) => {
					return parseFloat(b.amount) - parseFloat(a.amount);
				})
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
				width:110px;

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

			}

			.amount {
				flex:1;
				font-size: 24px;
				color:$dark-grey;

			}
		}
	}



</style>
