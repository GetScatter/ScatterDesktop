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
					<figure class="icon" :class="[{'small':item.token && item.token.symbol.length >= 4}, item.token.symbolClass()]">
						<span v-if="!item.token.symbolClass()">{{item.token.truncatedSymbol()}}</span>
					</figure>
					<section>
						<section class="title">
							<b>{{item.from.network().name}}</b>
						</section>
						<section class="sub"><b style="margin:0;">{{item.from.sendable()}}</b> <i class="icon-right-outline"></i> <b style="margin:0;">{{item.to}}</b></section>
						<section class="sub" style="font-size: 9px; cursor:pointer;" @click="openInExplorer(item)" v-if="item.txid"><u>{{item.txid}}</u></section>
						<!--<section class="sub" v-else>{{token.unusable}}</section>-->
					</section>
					<section>
						<section class="title"><b>{{formatNumber(parseFloat(item.amount).toFixed(item.token.decimals), true)}} {{item.token.symbol}}</b></section>
						<section class="sub">{{item.memo && item.memo.length ? item.memo : '--'}}</section>
					</section>
					<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto;">
						<btn style="width:auto;" @click.native="redoTransfer(item)" text="Redo Transfer" />
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
			redoTransfer(item){
				this.$router.push({name:this.RouteNames.TRANSFER, query:{history:item.id}});
			},
			clearHistory(){
				PopupService.push(Popup.prompt(
					"Clearing History",
					"Are you sure?",
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

</style>
