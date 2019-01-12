<template>
	<section class="token-panel">
		<back-bar style="border-bottom:0;" v-on:back="back" :buttons="buttons" />

		<section class="panel-container">
			<figure class="bg"></figure>

			<section class="token-filters">
				<SearchBar tokens="1"
				           style="flex:2; margin-left:-30px;"
				           :placeholder="locale(langKeys.GENERIC.Search)"
				           v-on:terms="x => searchTerms = x" />

				<sel :options="[null].concat(fullNetworks)" style="margin-bottom:0; flex:1;"
				     :selected="networkFilter"
				     v-on:changed="x => networkFilter = x"
				     :parser="x => x ? x.name : locale(langKeys.GENERIC.AllNetworks)" />
			</section>

			<section class="tokens">

				<section v-for="item in allHistories">

					<!-- TOKEN HISTORY -->
					<section class="token" v-if="item.type === 'transfer' || item.type === 'exchange'">
						<figure class="icon" :class="{'small':item.token && item.token.symbol.length >= 4, 'token-icon':item.token.symbolClass(), 'unusable':item.type === 'exchange'}">
							<span v-if="!item.token.symbolClass()">{{item.token.truncatedSymbol()}}</span>
							<span v-else :class="item.token.symbolClass()"></span>
						</figure>
						<section style="flex:1.7;">
							<section class="title" style="text-transform: capitalize">
								<b>{{item.type}}</b>
							</section>
							<section class="sub"><b style="font-size: 11px;">{{item.from.sendable()}}</b> <i class="icon-right-outline"></i> <b style="font-size: 11px;">{{item.to}}</b></section>
							<section class="sub"><i>{{item.from.network().name}}</i> <i class="icon-right-outline"></i> <i>{{new Date(item.timestamp).toLocaleString()}}</i></section>
							<section class="sub txid" style="font-size: 9px; cursor:pointer;" @click="openInExplorer(item)" v-if="item.txid">{{item.txid}}</section>
						</section>
						<section>
							<section class="title" v-if="item.toAmount"><b>+{{formatNumber(parseFloat(item.toAmount).toFixed(decimalsOrDefault(item.toToken)), true)}} {{item.toToken.symbol}}</b></section>
							<section :class="item.toAmount ? 'sub' : 'title'"><b>-{{formatNumber(parseFloat(item.token.amount).toFixed(decimalsOrDefault(item.token)), true)}} {{item.token.symbol}}</b></section>
							<section class="sub" v-if="item.memo && item.memo.length">{{item.memo}}</section>
							<section class="sub" v-if="item.type === 'exchange'">
								{{item.status}}
								<btn small="1" colorless="1" :loading="loadingStatus" @click.native="refreshStatus(item.id)" v-if="item.status !== 'complete'" icon="icon-arrows-ccw" />
							</section>

						</section>
						<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto;">
							<btn style="width:auto;" colorless="1" @click.native="redo(item)" :text="locale(langKeys.GENERIC.Redo)" />
						</section>
					</section>


					<!-- ACTION HISTORY -->
					<section class="token" v-if="item.type === 'action'">
						<figure class="icon action" :class="{'small':item.token && item.token.symbol.length >= 4, 'token-icon':item.token.symbolClass()}">
							<span v-if="!item.token.symbolClass()">{{item.token.truncatedSymbol()}}</span>
							<span v-else :class="item.token.symbolClass()"></span>
						</figure>
						<!--<figure class="icon token-icon icon-network" style="color:rgba(255,255,255,0.3)"></figure>-->
						<section style="flex:1.7;">
							<section class="title" style="text-transform: capitalize">
								<b>{{item.action}}</b>
							</section>
							<section class="sub"><i>{{item.account.network().name}}</i> <i class="icon-right-outline"></i> <i>{{new Date(item.timestamp).toLocaleString()}}</i></section>
							<section class="sub txid" style="font-size: 9px; cursor:pointer;" @click="openInExplorer(item)" v-if="item.txid">{{item.txid}}</section>
						</section>
						<section>
							<section class="title"><b>{{item.account.sendable()}}</b></section>
							<section class="sub"><i style="font-size: 9px;">{{item.account.keypair().name}}</i></section>
						</section>
						<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto;">
							<btn style="width:auto;" @click.native="openKeypair(item.account.keypair().id)" :text="locale(langKeys.GENERIC.Open)" />
						</section>
					</section>
				</section>

			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import FullWidthRow from '../../../components/reusable/FullWidthRow';
	import SearchBar from '../../../components/reusable/SearchBar';
	import HistoricTransfer from "../../../models/histories/HistoricTransfer";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import ElectronHelpers from "../../../util/ElectronHelpers";
	import {HISTORY_TYPES} from "../../../models/histories/History";
	import StorageService from "../../../services/StorageService";
	import ExchangeService from "../../../services/ExchangeService";
	import PluginRepository from "../../../plugins/PluginRepository";


	export default {
		props:['popin'],
		components:{
			FullWidthRow,
			SearchBar
		},
		data () {return {
			searchTerms:'',
			networkFilter:null,
			buttons:[],
			typeFilter:null,
			loadingStatus:false,
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
			filteredTokenHistories(){
				return this.history
					.filter(x => [HISTORY_TYPES.Transfer, HISTORY_TYPES.Exchange].includes(x.type))
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
							status:item.status,
						}
					})
					.filter(x => !this.networkFilter ? true : x.from.network().unique() === this.networkFilter.unique())
					.filter(x => !this.searchTerms.length ? true : (() => {
						return x.from.sendable().toLowerCase().indexOf(this.searchTerms) > -1 ||
								x.to.toLowerCase().indexOf(this.searchTerms) > -1 ||
								x.token.symbol.toLowerCase().indexOf(this.searchTerms) > -1 ||
								(x.memo && x.memo.toLowerCase().indexOf(this.searchTerms) > -1)
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
					.filter(x => !this.searchTerms.length ? true : (() => {
						return x.account.sendable().toLowerCase().indexOf(this.searchTerms) > -1 ||
								x.action.toLowerCase().indexOf(this.searchTerms) > -1
					})())
			},
			allHistories(){
				return this.filteredTokenHistories.concat(this.filteredActionHistories)
					.filter(x => !this.typeFilter ? true : x.type === this.typeFilter)
					.sort((a,b) => b.timestamp - a.timestamp)
			}
		},
		mounted(){
			this.typeFilter = this.popin.data.props.filter;
			if(!this.typeFilter) this.buttons = [{text:this.locale(this.langKeys.GENERIC.RemoveAll), clicked:this.clearHistory}];
		},
		methods:{
			back(){
				this.popin.data.callback(true);
				this[Actions.RELEASE_POPUP](this.popin);
			},
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
					PopupService.push(Popup.exchange({history:item.id}));
				}
				else {
					this.$router.push({name:this.RouteNames.TRANSFER, query:{history:item.id}});
					this.back();
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

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";
	@import "../../../styles/tokens";

	b {
		margin:0 !important;
	}

</style>
