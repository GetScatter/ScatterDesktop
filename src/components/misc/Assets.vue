<template>
	<section class="assets">
		<TokenList hoverable="1" :balances="allBalances" v-on:balances="x => filteredBalances = x" v-on:token="selectToken" :selected="selectedToken" />

		<section class="graph-and-accounts">
			<TokenGraph :balances="selectedToken ? [selectedToken] : filteredBalances.length ? filteredBalances : allBalances" />

			<SearchAndFilter full-search="1" v-if="needsAccountSearchBar" v-on:terms="x => terms = x" />
			<section class="accounts" :class="{'with-search':needsAccountSearchBar}" v-if="selectedToken">
				<section class="account" v-if="account.balanceFor(selectedToken)" v-for="account in filteredAccounts">
					<figure class="name">{{account.sendable()}}</figure>
					<figure class="network">{{account.network().name}}</figure>
					<section class="details">
						<section>
							<figure class="balance">{{account.balanceFor(selectedToken).amount}} {{selectedToken.symbol}}</figure>
							<figure class="fiat">{{account.balanceFor(selectedToken).fiatBalance()}}</figure>
						</section>

						<section class="actions" v-if="!asSelector">
							<Button text="Send" />
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
				'totalBalances'
			]),
			allBalances(){
				return Object.keys(this.totalBalances.totals).map(key => this.totalBalances.totals[key])
					.filter(x => this.hideUnusable ? !x.unusable : true)
			},
			filteredAccounts(){
				return this.selectedToken.accounts()
					.filter(x => {
						if(!this.terms.length) return true;
						return x.sendable().toLowerCase().indexOf(this.terms) > -1
					})
					.sort((a,b) => {
						const bBal = b.balanceFor(this.selectedToken);
						const aBal = a.balanceFor(this.selectedToken);
						return bBal ? bBal.amount : 0 - aBal ? aBal.amount : 0;
					});
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
						font-size: $medium;
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