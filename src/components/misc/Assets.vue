<template>
	<section class="assets">
		<TokenList hoverable="1" :balances="allBalances" v-on:balances="x => filteredBalances = x" v-on:token="selectToken" :selected="selectedToken" />

		<section class="graph-and-accounts">
			<TokenGraph :balances="selectedToken ? [selectedToken] : filteredBalances.length ? filteredBalances : allBalances" />

			<SearchAndFilter full-search="1" v-if="needsAccountSearchBar" v-on:terms="x => terms = x" />
			<section class="accounts" :class="{'with-search':needsAccountSearchBar}" v-if="selectedToken">
				<section class="account" v-for="account in filteredAccounts">
					<figure class="name">{{account.sendable()}}</figure>
					<figure class="network">{{account.network().name}}</figure>
					<section class="details">
						<section v-if="account.balanceFor(selectedToken)">
							<figure class="balance">{{formatNumber(account.balanceFor(selectedToken).amount, true)}} {{selectedToken.symbol}}</figure>
							<figure class="fiat">{{formatNumber(account.balanceFor(selectedToken).fiatBalance(), true)}}</figure>
						</section>
						<section v-else>
							<figure class="balance">{{formatNumber(parseFloat(0).toFixed(selectedToken.decimals), true)}} {{selectedToken.symbol}}</figure>
							<figure class="fiat">0.0000 {{displayCurrency}}</figure>
						</section>

						<section class="actions" v-if="!asSelector && !selectedToken.unusable">
							<Button text="Send" @click.native="sendToken(selectedToken, account)" />
						</section>

						<section class="actions" v-if="asSelector">
							<Button text="Select" blue="1" @click.native="$emit('selected', {token:selectedToken, account})" />
						</section>
					</section>
				</section>
			</section>

			<section v-else class="no-accounts">
				<span v-if="!selectedToken">Select a token</span>
				<span v-if="selectedToken">No accounts</span>
			</section>
		</section>
	</section>
</template>

<script>
	import {mapState, mapGetters} from 'vuex';
	import TokenList from "../../components/tokens/TokenList";
	import TokenGraph from "../../components/tokens/TokenGraph";
	import SearchAndFilter from "../reusable/SearchAndFilter";

	export default {
		props:['asSelector', 'hideUnusable'],
		components: {SearchAndFilter, TokenGraph, TokenList},
		data(){return {
			filteredBalances:[],
			selectedToken:null,
			terms:'',
		}},
		computed:{
			...mapState([
				'balances',
			]),
			...mapGetters([
				'totalBalances',
				'balanceFilters',
				'displayCurrency'
			]),
			allBalances(){
				return Object.keys(this.totalBalances.totals).map(key => this.totalBalances.totals[key])
					.filter(x => this.hideUnusable ? !x.unusable : true)
					.filter(token => this.balanceFilters[token.blockchain] && parseFloat(this.balanceFilters[token.blockchain]) < parseFloat(token.amount))
			},
			filteredAccounts(){
				return this.selectedToken.accounts()
					.filter(x => {
						if(!this.terms.length) return true;
						return x.sendable().toLowerCase().indexOf(this.terms) > -1
					})
					.sort((a,b) => {
						const bBal = b.balanceFor(this.selectedToken) ? b.balanceFor(this.selectedToken).amount : 0;
						const aBal = a.balanceFor(this.selectedToken) ? a.balanceFor(this.selectedToken).amount : 0;
						return bBal - aBal;
					});
					// .sort((a,b) => {
					// 	return b.balanceFor(this.selectedToken) || 0 - a.balanceFor(this.selectedToken) || 0;
					// 	const bBal = b.balanceFor(this.selectedToken);
					// 	const aBal = a.balanceFor(this.selectedToken);
					// 	return bBal ? bBal.amount : 0 - aBal ? aBal.amount : 0;
					// });
			},
			needsAccountSearchBar(){
				return this.selectedToken && this.selectedToken.accounts().length >= 5
			}
		},
		mounted(){

		},
		methods:{
			selectToken(token){
				this.selectedToken = this.selectedToken && this.selectedToken.uniqueWithChain() === token.uniqueWithChain() ? null : token;
			},
			sendToken(token, account){
				this.$router.push({name:this.RouteNames.TRANSFER, query:{account:account.identifiable(), token:token.uniqueWithChain()}})
			}
		},
		watch:{
			['filteredBalances'](){
				if(this.filteredBalances.length === 1){
					this.selectedToken = this.filteredBalances[0];
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.assets {
		display:flex;

		.token-list {
			flex:1;
			border-right:1px solid $lightgrey;

			.tokens {
				height:calc(100vh - 220px);
			}
		}

		.graph-and-accounts {
			flex:1;

			.no-accounts {
				height:calc(100% - 180px);
				display:flex;
				justify-content: center;
				align-items: center;

				font-size: 24px;
				font-weight: bold;
				color: $lightgrey;
			}

			.accounts {
				padding:30px;
				overflow:auto;

				height:calc(100% - 180px);

				&.with-search {
					height:calc(100% - 180px - 70px);
				}

				.account {
					display:flex;
					flex-direction: column;
					padding-bottom:20px;
					margin-bottom:20px;

					&:not(:last-child){
						border-bottom:1px solid $lightgrey;
					}

					.name {
						font-size: $large;
						font-weight: bold;
						color:$blue;
						margin-bottom:2px;
					}

					.network {
						font-size: $tiny;
						color:$grey;
						margin-bottom:6px;
					}

					.details {
						display:flex;
						width:100%;
						justify-content: space-between;
						align-items: flex-end;
						margin-top:5px;

						.balance {
							font-size: $medium;
							font-weight: bold;
							margin-bottom:2px;
						}

						.fiat {
							font-size: $small;
						}
					}

					.actions {
						flex:0 0 auto;
						padding-left:20px;

					}
				}
			}
		}
	}

</style>