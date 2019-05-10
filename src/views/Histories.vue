<template>
	<section class="histories">
		<SearchAndFilter v-on:terms="x => terms = x" />

		<section class="events">
			
			<section v-for="item in allHistories">

				<!-- TRANSFER OR EXCHANGE -->
				<section class="event" v-if="item.type === 'transfer' || item.type === 'exchange'">
					<figure class="icon">
						<Transfer v-if="item.type === 'transfer'" />
						<Exchange v-if="item.type === 'exchange'" />
					</figure>

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
					</section>

					<section class="participants">
						<section class="accounts">
							<figure class="account">{{item.from.sendable()}}</figure>
							<figure class="arrow icon-right-small"></figure>
							<figure class="account">{{item.to}}</figure>
						</section>
						<figure class="network">{{item.from.network().name}}</figure>
					</section>

					<section class="actions">
						<Button text="Redo" @click.native="redo(item)" />
					</section>
				</section>



				<section class="event" v-if="item.type === 'action'">
					<figure class="icon">
						<Transfer />
					</figure>

					<section class="details">
						<figure class="title">Sent 0.2 EOS</figure>
						<section class="row">
							<figure class="status">
								<i class="icon-check"></i> Completed
							</figure>
							<figure class="date">{{new Date().toLocaleString()}}</figure>
						</section>
					</section>

					<section class="participants">
						<section class="accounts">
							<figure class="account">accountfrom</figure>
							<figure class="arrow icon-right-small"></figure>
							<figure class="account">accountto</figure>
						</section>
						<figure class="network">EOS Mainnet</figure>
					</section>

					<section class="actions">
						<Button text="Redo" @click.native="redo(item)" />
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
	import {HISTORY_TYPES} from "../models/histories/History";
	import * as Actions from "../store/constants";
	import ExchangeService from "../services/apis/ExchangeService";
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";
	import ElectronHelpers from "../util/ElectronHelpers";

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
			redo(item){
				if(item.type === HISTORY_TYPES.Exchange){
					// TODO: REDO EXCHANGE
					// PopupService.push(Popup.exchange({history:item.id}));
				}
				else {
					this.$router.push({name:this.RouteNames.TRANSFER, query:{history:item.id}});
				}
			},
			clearHistory(){
				PopupService.push(Popup.prompt(
					this.locale(this.langKeys.HISTORY.ClearingHistory),
					this.locale(this.langKeys.HISTORY.ClearingHistoryText),
					accepted => {
						if(accepted) this[Actions.DELTA_HISTORY](null)
					}
				))
			},
			openInExplorer(item){
				const explorer = this.explorers[item.token.blockchain].parsed();
				ElectronHelpers.openLinkInBrowser(explorer.transaction(item.txid));
			},
			openKeypair(id){
				this.$router.push({name:this.RouteNames.KEYPAIR, params:{id}});
				this.back();
			},
			...mapActions([
				Actions.DELTA_HISTORY,
				Actions.UPDATE_HISTORY,
				Actions.RELEASE_POPUP,
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
					}

					.memo {
						font-size: $tiny;
						border-radius:$radius;
						display:inline-block;
						margin-top:5px;

					}
				}

				.participants {
					flex:1;
					font-size: $small;

					.accounts {
						display:flex;
					}

					.account {
						color:$blue;
					}
					.arrow {
						padding:0 2px;
						color:$blue;
					}

					.network {
						color:$silver;
						margin-top:3px;
					}
				}

				.actions {

				}


			}
		}
	}

</style>