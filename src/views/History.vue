<template>
	<section class="token-panel">
		<back-bar style="border-bottom:0;" v-on:back="back" :buttons="buttons" />

		<section class="panel-container">
			<figure class="bg"></figure>
			<br>
			<h1 style="color:#fff;">History</h1>

			<section class="token-filters">
				<SearchBar tokens="1"
				           style="flex:2; margin-left:-30px;"
				           :placeholder="locale(langKeys.GENERIC.Search)"
				           v-on:terms="x => searchTerms = x" />

				<sel :options="[null].concat(fullNetworks)" style="margin-bottom:0; flex:1;"
				     :selected="networkFilter"
				     v-on:changed="x => networkFilter = x"
				     :parser="x => x ? x.name : 'All Networks'" />
			</section>

			<section class="tokens">

				<section class="token" v-for="item in filteredHistories">
					<figure class="icon" :class="{'small':item.token && item.token.symbol.length >= 4, 'token-icon':item.token.symbolClass(), 'unusable':item.type === 'exchange'}">
						<span v-if="!item.token.symbolClass()">{{item.token.truncatedSymbol()}}</span>
						<span v-else :class="item.token.symbolClass()"></span>
					</figure>
					<section style="flex:1.7;">
						<section class="title" style="text-transform: capitalize">
							<b>{{item.type}}</b>
						</section>
						<section class="sub"><b>{{item.from.sendable()}}</b> <i class="icon-right-outline"></i> <b>{{item.to}}</b></section>
						<section class="sub"><i>{{item.from.network().name}}</i> <i class="icon-right-outline"></i> <i>{{new Date(item.timestamp).toLocaleString()}}</i></section>
						<section class="sub txid" style="font-size: 9px; cursor:pointer;" @click="openInExplorer(item)" v-if="item.txid">{{item.txid}}</section>
					</section>
					<section>
						<section class="title" v-if="item.toAmount"><b>+{{formatNumber(parseFloat(item.toAmount).toFixed(item.toToken.decimals), true)}} {{item.toToken.symbol}}</b></section>
						<section :class="item.toAmount ? 'sub' : 'title'"><b><i v-if="item.toAmount">-</i>{{formatNumber(parseFloat(item.token.amount).toFixed(item.token.decimals), true)}} {{item.token.symbol}}</b></section>
						<section class="sub" v-if="item.memo && item.memo.length">{{item.memo}}</section>
					</section>
					<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto;">
						<btn style="width:auto;" colorless="1" @click.native="redo(item)" text="Redo" />
					</section>
				</section>

			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import FullWidthRow from '../components/reusable/FullWidthRow';
	import SearchBar from '../components/reusable/SearchBar';
	import HistoricTransfer from "../models/histories/HistoricTransfer";
	import PopupService from "../services/PopupService";
	import {Popup} from "../models/popups/Popup";
	import ElectronHelpers from "../util/ElectronHelpers";
	import {HISTORY_TYPES} from "../models/histories/History";


	export default {
		components:{
			FullWidthRow,
			SearchBar
		},
		data () {return {
			searchTerms:'',
			networkFilter:null,
			buttons:[],
		}},
		computed:{
			...mapState([
				'scatter',
				'history',
			]),
			...mapGetters([
				'keypairs',
				'accounts',
				'networks',
				'explorers',
			]),
			fullNetworks(){
				return this.networks.filter(net => {
					const accounts = this.accounts.filter(acc => acc.networkUnique === net.unique());
					return accounts.some(account => {
						return account.tokenCount() > 0 || account.tokenCount(account.network().systemToken()) > 0;
					})
				})
			},
			filteredHistories(){
				return this.history
					.filter(x => !this.networkFilter ? true : x.from.network().unique() === this.networkFilter.unique())
					.filter(x => !this.searchTerms.length ? true : (() => {
						return x.from.sendable().toLowerCase().indexOf(this.searchTerms) > -1 ||
								x.to.toLowerCase().indexOf(this.searchTerms) > -1 ||
								x.token.symbol.toLowerCase().indexOf(this.searchTerms) > -1 ||
								(x.memo && x.memo.toLowerCase().indexOf(this.searchTerms) > -1)
					})())
					.map(item => {
						const token = item.type === HISTORY_TYPES.Transfer
							? item.token
							: item.fromToken;
						const toToken = item.type === HISTORY_TYPES.Transfer
							? null
							: item.toToken;
						const amount = item.type === HISTORY_TYPES.Transfer
							? item.amount
							: item.fromToken.amount;
						const toAmount = item.type === HISTORY_TYPES.Transfer
							? null
							: item.orderDetails.expected;


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
						}
					})
			}
		},
		mounted(){
			this.buttons = [
				{text:'Clear History', clicked:this.clearHistory},
			];
		},
		methods:{
			back(){
				this.$router.back();
			},
			redo(item){
				const route = item.type === HISTORY_TYPES.Transfer
					? this.RouteNames.TRANSFER
					: this.RouteNames.EXCHANGE
				this.$router.push({name:route, query:{history:item.id}});
			},
			clearHistory(){
				PopupService.push(Popup.prompt(
					"Clearing History",
					"Your history in Scatter is only stored locally. If you clear it you will not be able to restore it.",
					accepted => {
						if(accepted) this[Actions.DELTA_HISTORY](null)
					}
				))
			},
			openInExplorer(item){
				const explorer = this.explorers[item.token.blockchain].parsed();
				ElectronHelpers.openLinkInBrowser(explorer.transaction(item.txid));
			},
			...mapActions([
				Actions.DELTA_HISTORY
			])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";
	@import "../styles/tokens";

	b {
		margin:0 !important;
	}

</style>
