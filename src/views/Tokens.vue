<template>
	<section class="token-panel">
		<back-bar style="border-bottom:0;" v-on:back="back" :buttons="[{text:'Set Display Token', clicked:() => $router.push({name:RouteNames.DISPLAY_TOKEN})}]" />

		<section class="panel-container">
			<figure class="bg"></figure>

			<section class="panel-top">
				<section class="values">
					<figure class="value">{{totalBalance.symbol}} {{formatNumber(totalBalance.amount, true)}}</figure>
					<p>{{balances.length}} {{locale(langKeys.GENERIC.Tokens, balances.length)}}</p>
				</section>

				<!--<section class="graph-actions">-->
					<!--<figure class="action active">12 Hours</figure>-->
					<!--<figure class="action">Day</figure>-->
					<!--<figure class="action">Week</figure>-->
				<!--</section>-->
			</section>

			<section class="graph">
				<section class="tip" v-if="graphValue">
					<div>{{graphValue}}</div>
				</section>
				<section class="chart"></section>
			</section>


			<section class="token-filters">
				<SearchBar tokens="1"
				           style="flex:2;"
				           :placeholder="locale(langKeys.GENERIC.Search)"
				           v-on:terms="x => searchTerms = x" />

				<sel :options="[null].concat(fullNetworks)" style="margin-bottom:0; flex:1;"
				     :selected="networkFilter"
				     v-on:changed="x => networkFilter = x"
				     :parser="x => x ? x.name : 'All Networks'" />

			</section>

			<section class="tokens">

				<section class="token" v-for="token in balances">
					<figure class="icon" @click="goToToken(token)">{{token.symbol.length > 4 ? `${token.symbol.slice(0,3)}...`.toUpperCase() : token.symbol}}</figure>
					<section>
						<section class="title"><b>{{token.symbol}}</b> {{formatNumber(token.amount, true)}}</section>
						<section class="sub">{{token.fiatPrice() || '--'}} <b :class="{'red':!change(token).plus}">{{change(token).perc}}</b></section>
					</section>
					<section>
						<section class="title"><b>{{formatNumber(token.fiatBalance(), true) || '--'}}</b></section>
						<section class="sub">{{parseFloat((token.fiatBalance(false) / totalFiat) * 100).toFixed(1)}}% of portfolio</section>
					</section>
					<section class="split-inputs last" style="flex-direction: row; flex:0 0 auto;">
						<btn colorless="1" style="width:auto;" text="Stabilize" />
						<btn style="width:auto;" text="Exchange" />
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
	import {dateId, hourNow} from "../util/DateHelpers";
	require("../charts.scss");
	require("../tokens.scss");

	export default {
		components:{
			SearchBar
		},
		data () {return {
			totalFiat:0,
			networkFilter:null,
			searchTerms:'',
			priceData:{},
			yesterData:{},
			chart:null,
			graphValue:null,
			currencyPrices:{},
		}},
		computed:{
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'accounts',
				'fullTotalBalances',
				'totalBalances',
				'networks',
				'displayCurrency',
			]),
			totalBalance(){
				const totals = this.balances.reduce((acc,x) => {
					acc[x.uniqueWithChain()] = x;
					return acc;
				}, {});
				return PriceService.getTotal(totals);
			},
			balances(){
				const terms = this.searchTerms.trim();
				return Object.keys(this.fullTotalBalances.totals).map(key => this.fullTotalBalances.totals[key])
					.filter(token => {
						if(!this.networkFilter) return true;
						return token.blockchain === this.networkFilter.blockchain && token.chainId === this.networkFilter.chainId;
					})
					.filter(token => {
						if(!terms.length) return true;
						if(terms === '-') return !this.change(token).plus && token.fiatBalance(false);
						if(terms === '+') return this.change(token).plus && token.fiatBalance(false);
						if(isNaN(terms)) return token.symbol.toLowerCase().indexOf(terms) > -1 || token.contract.toLowerCase().indexOf(terms) > -1;
						return token.amount >= parseFloat(terms);
					})
					.sort((a,b) => {
						if(terms === '+' || terms === '-') return this.change(b, true) - this.change(a, true)
						return (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0);
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

			this.totalFiat = this.balances.reduce((acc,x) => {
				acc += parseFloat(x.fiatBalance(false) || 0);
				return acc;
			}, 0);

			this.setup();
		},
		methods:{
			back(){
				this.$router.back();
			},
			async setup(){
				this.currencyPrices = await PriceService.getCurrencyPrices();
				this.priceData = await PriceService.getTimeline();
				this.yesterData = await PriceService.getTimeline(dateId(1));
				this.setupGraph();
			},
			async setupGraph(){
				// TODO: ERROR HANDLING

				const labels = [];
				const values = [];
				let totaled = [];

				Object.keys(this.yesterData).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
					totaled.push({hour, data:this.yesterData[hour]}));
				Object.keys(this.priceData).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
					totaled.push({hour, data:this.priceData[hour]}));

				totaled = totaled.slice(totaled.length-24, totaled.length);

				totaled.map(({hour, data}, i) => {
					const label = `${hour}:00`;
					if(i % 2 === 0) labels.push(label);
					else labels.push('');

					const total = this.balances.reduce((acc,balance) => {
						const priceData = data[balance.uniqueWithChain()];
						if(!priceData) return acc;
						acc += parseFloat(balance.fiatBalance(false, priceData * this.currencyPrices[this.displayCurrency]));
						return acc;
					}, 0);
					values.push({value:total, meta:label});
				})

				values.pop();
				values.push({value:this.totalBalance.amount, meta:`${hourNow()}:00`});

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
							this.graphValue = show ? `${data.meta} -- ${this.formatNumber(parseFloat(data.value.y).toFixed(2), true)}` : null;
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
			},
			change(token, numOnly = false){
				if(!this.priceData) return;
				const hour = this.priceData.latest;
				const latest = this.priceData[hour];
				const earliest = this.yesterData.hasOwnProperty(hour)
					// Getting last update from yesterday
					? this.yesterData[hour]
					// Getting first update from today
					: this.priceData[Object.keys(this.priceData).filter(x => x !== 'latest').sort((a,b) => a - b)[0]];

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
			['balances'](){
				this.setupGraph();
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../_variables";


</style>