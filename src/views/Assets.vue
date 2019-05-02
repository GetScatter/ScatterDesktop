<template>
	<section class="assets">
		<TokenList hoverable="1" :balances="allBalances" v-on:balances="x => filteredBalances = x" v-on:token="selectToken" :selected="selectedToken" />

		<section class="graph-and-accounts">
			<TokenGraph :balances="selectedToken ? [selectedToken] : filteredBalances.length ? filteredBalances : allBalances" />

			<section class="accounts" v-if="selectedToken">
				<section class="account" v-if="account.balanceFor(selectedToken)" v-for="account in selectedToken.accounts()">
					<section class="details">
						<figure class="name">{{account.sendable()}}</figure>
						<figure class="network">{{account.network().name}}</figure>
						<figure class="balance">{{account.balanceFor(selectedToken).amount}} {{selectedToken.symbol}}</figure>
						<figure class="fiat">{{account.balanceFor(selectedToken).fiatBalance()}}</figure>
					</section>

					<section class="actions">
						<Button text="Send" />
						<!--<Button text="Exchange" />-->
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
	import TokenList from "../components/tokens/TokenList";
	import TokenGraph from "../components/tokens/TokenGraph";

	export default {
		components: {TokenGraph, TokenList},
		data(){return {
			filteredBalances:[],
			selectedToken:null,
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
			}
		},
		mounted(){

		},
		methods:{
			selectToken(token){
				this.selectedToken = this.selectedToken && this.selectedToken.unique() === token.unique() ? null : token;
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
	@import "../styles/variables";

	.assets {
		display:flex;
		height:calc(100vh - 220px);

		.token-list {
			flex:1;
			border-right:1px solid $border;

			.tokens {
				height:calc(100vh - 220px);
			}
		}

		.graph-and-accounts {
			flex:1;

			.no-accounts {
				height:calc(100vh - 400px);
				display:flex;
				justify-content: center;
				align-items: center;

				font-size: 24px;
				font-weight: bold;
				color:$border;
			}

			.accounts {
				padding:30px;
				height:calc(100vh - 400px);
				overflow:auto;

				.account {
					display:flex;
					justify-content: space-between;
					align-items: center;
					padding-bottom:20px;
					margin-bottom:20px;

					&:not(:last-child){
						border-bottom:1px solid $border;
					}

					.details {

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

						.balance {
							font-size: $medium;
							margin-bottom:2px;
						}

						.fiat {
							font-size: $small;
							margin-bottom:5px;
						}
					}

					.actions {

					}
				}
			}
		}
	}

</style>