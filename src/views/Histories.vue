<template>
	<section class="histories">
		<SearchAndFilter v-on:terms="x => terms = x" />

		<section class="events">
			
			<section v-for="item in allHistories">

				<!-- TRANSFER OR EXCHANGE -->
				<section class="event" v-if="item.type === 'transfer' || item.type === 'exchange'">

					<section class="details">
						<figure class="title" v-if="item.type === 'transfer'">
							Sent {{formatNumber(parseFloat(item.amount).toFixed(decimalsOrDefault(item.token)), true)}} {{item.token.symbol}}
						</figure>
						<figure class="title" v-if="item.type === 'exchange'">
							<figure class="exchange-from">Exchanged {{formatNumber(parseFloat(item.amount).toFixed(decimalsOrDefault(item.token)), true)}} {{item.token.symbol}}</figure>
							Received {{formatNumber(parseFloat(item.toAmount).toFixed(decimalsOrDefault(item.toToken)), true)}} {{item.toToken.symbol}}
						</figure>
						<section class="row">
							<figure class="status" @click="refreshStatus(item.id)" v-if="item.type === 'exchange'">
								<span v-if="!loadingStatus"><i class="icon-check"></i> {{item.status}}</span>
								<i class="icon-arrows-ccw animate-spin" v-else></i>
							</figure>
							<figure class="date">{{new Date(item.timestamp).toLocaleString()}}</figure>
						</section>
						<section class="row" v-if="item.memo && item.memo.length">
							<figure class="memo">{{item.memo}}</figure>
						</section>
					</section>

					<section class="participants">
						<section class="accounts">
							<figure class="account blue">{{item.from.sendable()}}</figure>
							<figure class="account" v-if="item.from.sendable() !== item.to">{{item.to}}</figure>
						</section>
						<figure class="network" v-if="item.from.network()">{{item.from.network().name}}</figure>
						<figure class="network" v-else>Network disabled ({{item.from.networkUnique}})</figure>
					</section>

					<section class="actions">
						<Button text="View" @click.native="view(item)" />
						<Button text="Redo" blue="1" @click.native="redo(item)" />
					</section>
				</section>



				<section class="event" v-if="item.type === 'action'">

					<section class="details">
						<figure class="title">{{item.action}}</figure>
						<section class="row">
							<figure class="date">{{new Date(item.timestamp).toLocaleString()}}</figure>
						</section>
					</section>

					<section class="participants">
						<section class="accounts">
							<figure class="account blue">{{item.account.sendable()}}</figure>
						</section>
						<figure class="network">{{item.account.network().name}}</figure>
					</section>

					<section class="actions">
						<Button text="View" @click.native="view(item)" />
					</section>
				</section>
				
				
			</section>
			

		</section>
	</section>
</template>

<script>
	import {mapState, mapActions, mapGetters} from 'vuex';
	import SearchAndFilter from "../components/reusable/SearchAndFilter";
	import Exchange from '../components/svgs/quick-actions/Exchange'
	import Transfer from '../components/svgs/quick-actions/Send'
	import {HISTORY_TYPES} from "@walletpack/core/models/histories/History";
	import * as Actions from "@walletpack/core/store/constants";
	import ExchangeService from "@walletpack/core/services/apis/ExchangeService";
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";

	export default {
		components: {
			SearchAndFilter,
			Exchange,
			Transfer
		},
		data(){return {
			networkFilter:null,
			typeFilter:null,
			terms:'',
			loadingStatus:false,
		}},
		computed:{
			...mapState([
				'history',
			]),
			...mapGetters([
				'accounts',
				'explorers',
			]),
			filteredTokenHistories(){
				return this.history
					.filter(x => [HISTORY_TYPES.Transfer, HISTORY_TYPES.Exchange].includes(x.type))
					.map(item => {
						const token = item.type === HISTORY_TYPES.Transfer ? item.token : item.fromToken;
						const toToken = item.type === HISTORY_TYPES.Transfer ? null : item.toToken;
						const amount = item.type === HISTORY_TYPES.Transfer ? item.amount : item.fromToken.amount;
						const toAmount = item.type === HISTORY_TYPES.Transfer ? null : item.orderDetails.expected;

						return {
							id:item.id,
							type:item.type,
							from:item.from,
							to:item.to,
							token,
							memo:item.memo,
							amount,
							toAmount,
							timestamp:item.timestamp,
							txid:item.txid,
							toToken,
							order:item.orderDetails,
							status:item.status,
						}
					})
					.filter(x => !this.networkFilter ? true : x.from.network().unique() === this.networkFilter.unique())
					.filter(x => !this.terms.length ? true : (() => {
						return x.from.sendable().toLowerCase().indexOf(this.terms) > -1 ||
							x.to.toLowerCase().indexOf(this.terms) > -1 ||
							x.token.symbol.toLowerCase().indexOf(this.terms) > -1 ||
							(x.memo && x.memo.toLowerCase().indexOf(this.terms) > -1)
					})())
			},
			filteredActionHistories(){
				return this.history
					.filter(x => [HISTORY_TYPES.Action].includes(x.type))
					.map(item => {
						const clone = item.clone();
						clone.account = this.accounts.find(x => x.unique() === item.account);
						if(!clone.account) return null;
						clone.token = clone.account.network().systemToken().clone();
						return clone;
					})
					.filter(x => x)
					.filter(x => !this.networkFilter ? true : x.account.network().unique() === this.networkFilter.unique())
					.filter(x => !this.terms.length ? true : (() => {
						return x.account.sendable().toLowerCase().indexOf(this.terms) > -1 ||
							x.action.toLowerCase().indexOf(this.terms) > -1
					})())
			},
			allHistories(){
				return this.filteredTokenHistories.concat(this.filteredActionHistories)
					.filter(x => !this.typeFilter ? true : x.type === this.typeFilter)
					.sort((a,b) => b.timestamp - a.timestamp)
			}
		},
		methods:{
			decimalsOrDefault(token){
				if(token.decimals) return token.decimals;
				return PluginRepository.plugin(token.blockchain).defaultDecimals();
			},
			async refreshStatus(id){
				this.loadingStatus = true;
				const history = this.history.find(x => x.id === id);
				if(!history) return this.loadingStatus = false;
				const orderStatus = await ExchangeService.orderStatus(history.orderDetails.id);
				if(history.status !== orderStatus){
					history.status = orderStatus;
					await this[Actions.UPDATE_HISTORY](history);
				}
				this.loadingStatus = false;
			},
			view(item){
				const explorer = this.explorers[item.token.blockchain].parsed();
				this.openInBrowser(explorer.transaction(item.txid));
			},
			redo(item){
				if(item.type === HISTORY_TYPES.Exchange){
					this.$router.push({name:this.RouteNames.EXCHANGE, query:{history:item.id}});
				}
				else {
					this.$router.push({name:this.RouteNames.TRANSFER, query:{history:item.id}});
				}
			},
			...mapActions([
				Actions.DELTA_HISTORY,
				Actions.UPDATE_HISTORY,
			])
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.histories {
		height:$fullheight;

		.events {
			height:calc(#{$fullheight} - 70px);
			overflow-y:scroll;
			padding:10px 40px;

			.event {
				display:flex;
				align-items: center;
				justify-content: space-between;
				border-bottom:1px solid $lightgrey;
				padding:20px 0;

				.icon {
					flex:0 0 auto;
					margin-right:20px;
				}

				.details {
					flex:1;
					padding-right:20px;

					.title {
						font-size: $medium;
						font-weight: bold;
					}

					.exchange-from {
						font-size: $small;
						color:$silver;
					}

					.row {
						margin-top:3px;
						font-size: $small;
						display:flex;

						.status {
							margin-right:12px;
						}

						.date {
						}

						.memo {
							margin-top:10px;
							font-size: $tiny;
							padding:5px;
							border:1px solid $lightgrey;
							border-radius:$radius;
						}
					}
				}

				.participants {
					flex:1;
					font-size: $small;

					.account {
						font-weight: bold;

						&.blue {
							color:$blue;
						}
					}

					.network {
						font-size: $tiny;
						color:$silver;
						margin-top:10px;
					}
				}

				.actions {
					padding-left:20px;
					flex:0.5;
					text-align:right;
				}


			}
		}
	}

</style>