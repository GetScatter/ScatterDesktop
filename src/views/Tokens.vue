<template>
	<section class="token-panel">
		<back-bar style="border-bottom:0;" v-on:back="back" :subtext="account ? account.sendable() : null" :buttons="[{text:locale(langKeys.TOKENS.SetDisplayTokens), clicked:() => openDisplayToken()}]" />

		<section class="panel-container">
			<figure class="bg"></figure>

			<section class="panel-top">
				<section class="values">
					<figure class="value">{{totalBalance.symbol}} {{formatNumber(totalBalance.amount, true)}}</figure>
					<section class="refresh" v-if="account" @click="refreshTokens" :class="{'loading':loadingBalances}">
						<i v-if="!loadingBalances" class="icon-arrows-ccw"> {{locale(langKeys.GENERIC.RefreshBalances)}}</i>
						<i v-if="loadingBalances" class="icon-spin4 animate-spin"></i>
					</section>
					<p>
						{{calculatedBalances.length}} {{locale(langKeys.GENERIC.Tokens, calculatedBalances.length)}}
						<router-link tag="u" v-if="hiddenTokenCount > 0" :to="{name:RouteNames.SETTINGS, params:{panel:SETTINGS_OPTIONS.TOKENS}}" style="color:rgba(255,255,255,0.3); cursor: pointer;">
							( {{hiddenTokenCount}} filtered out )
						</router-link>
					</p>
				</section>

				<!--<section class="graph-actions">-->
					<!--<figure class="action active">12 Hours</figure>-->
					<!--<figure class="action">Day</figure>-->
					<!--<figure class="action">Week</figure>-->
				<!--</section>-->
			</section>

			<section class="graph" v-show="loaded">
				<section class="tip" v-if="graphValue">
					<div>{{graphValue}}</div>
				</section>
				<section class="chart"></section>
			</section>

			<section class="graph loading" v-if="!loaded">
				<figure class="icon-spin4 animate-spin"></figure>
			</section>


			<section class="token-filters">
				<SearchBar tokens="1"
				           style="flex:2;"
				           :placeholder="locale(langKeys.GENERIC.Search) + '   ( ^ / + / - )'"
				           v-on:terms="x => searchTerms = x" />

				<sel :options="[null].concat(fullNetworks)" style="margin-bottom:0; flex:1;"
				     :selected="networkFilter"
				     v-on:changed="x => networkFilter = x"
				     :parser="x => x ? x.name : locale(langKeys.GENERIC.AllNetworks)" />

			</section>

			<section class="tokens">

				<section class="token" v-for="token in calculatedBalances">
					<figure class="icon" @click="goToToken(token)" :class="[{'small':token && token.symbol.length >= 4, 'unusable':!!token.unusable}, token.symbolClass()]">
						<span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
					</figure>
					<section>
						<section class="sub lighter" style="font-size: 9px; margin-bottom:5px;">{{token.network().name}}</section>
						<section class="title">
							<b>{{token.symbol}}</b> {{formatNumber(token.amount, true)}}
						</section>
						<section class="sub" v-if="token.fiatBalance(false)">{{fiatSymbol(displayCurrency)}} {{formatNumber(token.fiatBalance(false), true) || '--'}}</section>
					</section>
					<section>
						<section class="price-movement-bold sub" v-if="!token.unusable"> <b :class="{'red':!change(token).plus}">{{change(token).perc}}</b></section>
						<section class="sub" v-if="!token.unusable">{{fiatSymbol(displayCurrency)}} {{token.fiatPrice(false) || '--'}}</section>
						<section class="sub" v-else><i class="icon-lock" style="margin-right:5px;"></i>{{token.unusable}}</section>
						<section class="sub lighter" v-if="token.baseTokenPrice()">{{token.baseTokenPrice()}}</section>
					</section>
					<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto; min-width:180px;">
						<!--<btn v-if="canStabilize(token)" colorless="1" style="width:auto;" text="Stabilize" @click.native="stabilizeToken(token)" />-->
						<btn v-if="canStabilize(token)" style="width:auto;" blue="1" :text="locale(langKeys.GENERIC.Exchange)" @click.native="exchangeToken(token)" />
						<figure @click="goToToken(token)" class="chevron icon-right-open-big"></figure>
					</section>
				</section>

			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import SearchBar from '../components/reusable/SearchBar';
	import StorageService from "../services/StorageService";
	import PriceService from "../services/PriceService";
	import Token from "../models/Token";

	import Chartist from 'chartist';
	import {dateId, hourNow, utcToLocal} from "../util/DateHelpers";
	import BalanceService from "../services/BalanceService";
	import ExchangeService from "../services/ExchangeService";
	import PopupService from "../services/PopupService";
	import {Popup} from "../models/popups/Popup";
	require("../styles/charts.scss");
	require("../styles/tokens.scss");

	let refreshInterval;

	export default {
		components:{
			SearchBar
		},
		data () {return {
			loaded:false,
			totalFiat:0,
			networkFilter:null,
			searchTerms:'',
			priceData:{},
			yesterData:{},
			chart:null,
			graphValue:null,
			currencyPrices:{},
			account:null,
			pairable:[],
			loadingBalances:false,

			fiatSymbol:PriceService.fiatSymbol
		}},
		computed:{
			...mapState([
				'scatter',
				'balances',
				'prices',
			]),
			...mapGetters([
				'accounts',
				'fullTotalBalances',
				'totalBalances',
				'networks',
				'displayCurrency',
				'balanceFilters',
				'blacklistTokens',
				'networkTokens',
			]),
			totalBalance(){
				const totals = this.calculatedBalances.reduce((acc,x) => {
					acc[x.uniqueWithChain()] = x;
					return acc;
				}, {});
				return PriceService.getTotal(totals);
			},
			hiddenTokenCount(){
				const totals = this.account ? this.balances[this.account.identifiable()] : Object.keys(this.fullTotalBalances.totals).map(key => this.fullTotalBalances.totals[key]);
				return totals
					.filter(token => {
						return this.balanceFilters[token.blockchain] && parseFloat(this.balanceFilters[token.blockchain]) > token.amount;
					}).length;
			},
			calculatedBalances(){
				const terms = this.searchTerms.trim();
				const totals = this.account ? this.balances[this.account.identifiable()] : Object.keys(this.fullTotalBalances.totals).map(key => this.fullTotalBalances.totals[key]);
				return totals
					.filter(token => {
						if(!this.networkFilter) return true;
						return token.blockchain === this.networkFilter.blockchain && token.chainId === this.networkFilter.chainId;
					})
					.filter(token => {
						if(this.balanceFilters[token.blockchain] && parseFloat(this.balanceFilters[token.blockchain]) > token.amount) return false;
						if(!terms.length) return true;
						if(terms === '^') return true;
						if(terms === '-') return this.change(token) && !this.change(token).plus && token.fiatBalance(false);
						if(terms === '+') return this.change(token) && this.change(token).plus && token.fiatBalance(false);
						if(terms.indexOf('::') > -1) return `${token.contract.toLowerCase()}::${token.symbol.toLowerCase()}` === terms;
						if(isNaN(terms)) return token.symbol.toLowerCase().indexOf(terms) > -1 || token.contract.toLowerCase().indexOf(terms) > -1;
						return token.amount >= parseFloat(terms);
					})
					.filter(token => {
						return !this.blacklistTokens.find(x => x.uniqueWithChain(false) === token.uniqueWithChain(false))
					})
					.sort((a,b) => {
						if(terms === '+' || terms === '-') return this.change(b, true) - this.change(a, true)
						if(terms === '^') return b.amount - a.amount;

						const systemToken = !this.account ? null : this.account.network().systemToken().uniqueWithChain();
						const system = systemToken === b.uniqueWithChain() ? 1 : systemToken === a.uniqueWithChain() ? -1 : 0;
						const untouchable = this.account && !!b.unusable ? 1 : this.account && !!a.unusable ? -1 : 0;

						const systemTokenUniques = this.networkTokens.map(x => x.uniqueWithChain(false));
						const isSelfSystem = systemTokenUniques.includes(b.uniqueWithChain(false)) ? 1 : systemTokenUniques.includes(a.uniqueWithChain(false)) ? -1 : 0;

						return isSelfSystem || system || untouchable || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0);
					});
			},
			fullNetworks(){
				return this.networks.filter(net => {
					const accounts = this.accounts.filter(acc => acc.networkUnique === net.unique());
					return accounts.some(account => {
						return account.tokenCount() > 0 || account.tokenCount(account.network().systemToken()) > 0;
					})
				})
			},
		},
		mounted(){
			if(this.$route.params.account) this.account = this.accounts.find(x => x.unique() === this.$route.params.account);

			this.totalFiat = this.calculatedBalances.reduce((acc,x) => {
				acc += parseFloat(x.fiatBalance(false) || 0);
				return acc;
			}, 0);

			this.setup();
			refreshInterval = setInterval(() => this.setup(), 1000*60*5);
		},
		destroyed(){
			clearInterval(refreshInterval)
		},
		methods:{
			back(){
				if(!this.account) return this.$router.push({name:this.RouteNames.HOME})
				this.$router.back();
			},
			async refreshTokens(){
				if(this.loadingBalances) return;
				this.loadingBalances = true;
				await BalanceService.loadBalancesFor(this.account);
				await PriceService.getAll();
				this.loadingBalances = false;
			},
			openDisplayToken(){
				PopupService.push(Popup.setDisplayToken());
			},
			async setup(){
				this.pairable = await ExchangeService.pairable();
				this.currencyPrices = await PriceService.getCurrencyPrices();
				this.priceData = await PriceService.getTimeline();
				this.loaded = true;
				this.yesterData = await PriceService.getTimeline(dateId(1));
				this.setupGraph();
			},
			canStabilize(token){
				if(token.unusable) return false;
				if(!this.pairable || !this.pairable.length) return false;
				return this.pairable.includes(token.uniqueWithChain());
			},
			exchangeToken(token){
				PopupService.push(Popup.exchange({
					token:token.clone(),
					account:this.account
				}));
			},
			stabilizeToken(token){
				PopupService.push(Popup.stabilize({token, account:this.account}));
			},
			getTotaled(){
				let totaled = [];

				Object.keys(this.yesterData).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
					totaled.push({hour, data:this.yesterData[hour], date:dateId(1)}));
				Object.keys(this.priceData).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
					totaled.push({hour, data:this.priceData[hour], date:dateId()}));

				totaled = totaled.slice(totaled.length-(totaled.length > 24 ? 24 : totaled.length), totaled.length);

				return totaled;
			},
			async setupGraph(){
				try {
					const labels = [];
					const values = [];
					let totaled = this.getTotaled();

					const onlyShowingSystemAndUntouchable = (() => {
						if(this.calculatedBalances.length !== 2) return false;
						const tokenUnique = this.calculatedBalances[0].uniqueWithChain();
						return this.calculatedBalances.every(x => x.uniqueWithChain(false) === tokenUnique);
					})();
					totaled.map(({hour, data, date}, i) => {
						[date, hour] = utcToLocal(date, hour);
						const label = `${hour}:00`;
						if(i % 2 === 0) labels.push(label);
						else labels.push('');

						let total;

						if(this.calculatedBalances.length === 1 || onlyShowingSystemAndUntouchable){
							let tokenUnique = this.calculatedBalances[0].uniqueWithChain(false);
							total = (data[tokenUnique] / this.prices[tokenUnique].USD) * this.prices[tokenUnique][this.displayCurrency];
						} else {
							total = this.calculatedBalances.reduce((acc,balance) => {
								const priceData = data[balance.uniqueWithChain()];
								if(!priceData) return acc;
								acc += parseFloat(balance.fiatBalance(false, priceData * this.currencyPrices[this.displayCurrency]));
								return acc;
							}, 0);
						}

						values.push({value:total, meta:`${date} ${label}`});
					})

					if(this.calculatedBalances.length !== 1 && !onlyShowingSystemAndUntouchable){
						values.pop();
						values.push({value:this.totalBalance.amount, meta:'Now'});
					}


					const CHART_OPTIONS = {
						showArea:true,
						showPoint: true,
						lineSmooth: true,

						chartPadding: { top: 15, right: 0, bottom: 0, left: 0 },
						fullWidth:true,
						axisX: { showGrid: true, showLabel: true, },
						axisY: { scaleMinSpace:40, offset: 60, position: 'start', labelInterpolationFnc: n => this.formatNumber(n, n < 100000) },
					};

					if(!this.chart){
						this.chart = new Chartist.Line('.chart', {
							labels,
							series: [values]
						}, CHART_OPTIONS);

						this.chart.on('draw', data => {

							const toggleTooltip = (show = true) => {
								let parsed = parseFloat(data.value.y);
								if(this.calculatedBalances.length !== 1) parsed = parsed.toFixed(2);
								this.graphValue = show ? `${data.meta} -- ${this.formatNumber(parsed, true)}` : null;
							}

							if (data.type === 'label') {
								let labelCount = data.axis.ticks.length
								if ((data.index + 1) === labelCount) {
									data.element._node.childNodes[0].classList.add('the-last-of-the-labels')
								}
							}

							if (data.type === "point") {
								data.element._node.addEventListener("mouseenter", e => toggleTooltip())
								data.element._node.addEventListener("mouseleave", e => toggleTooltip(false));
							}
						});

						this.chart.on('created', ctx => {
							ctx.svg.elem('defs').elem('linearGradient', {
								id: 'gradient',
								x1: 0,
								y1: 1,
								x2: 0,
								y2: 0
							}).elem('stop', {
								offset: 0.2,
								'stop-color': 'rgba(255,255,255,0)'
							}).parent().elem('stop', {
								offset: 1,
								'stop-color': 'rgba(255,255,255,1)'
							});

						});
					} else {
						this.chart.update({
							labels,
							series:[values]
						})
					}
				} catch(e){}
			},
			change(token, numOnly = false){
				if(!this.priceData) return;
				if(token.unusable) return;
				const hour = this.priceData.latest;
				const totaled = this.getTotaled();
				const latest = totaled[totaled.length-1] ? totaled[totaled.length-1].data : null;
				const earliest = totaled[0] ? totaled[0].data : null;

				if(!latest || !earliest || !latest[token.uniqueWithChain()] || !earliest[token.uniqueWithChain()]) return '--';
				const diff = earliest[token.uniqueWithChain()] - latest[token.uniqueWithChain()];
				const change = (diff / earliest[token.uniqueWithChain()]) * 100;
				if(numOnly) return Math.abs(parseFloat(change).toFixed(2));
				const symbol = change > 0 ? '-' : '+';
				return {plus:change <= 0, perc:`${symbol}${Math.abs(parseFloat(change).toFixed(2))}%`};

			},
			goToToken(token){
				this.$router.push({name:this.RouteNames.TOKEN, params:{id:token.uniqueWithChain()}})
			}
		},
		watch:{
			['calculatedBalances'](){
				this.setupGraph();
			},
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";


</style>