<template>
	<section class="token-graph">
		<section class="tip" v-if="graphValue">
			<div>{{graphValue}}</div>
		</section>
		<section class="chart"></section>
	</section>
</template>

<script>
	import {mapState, mapGetters, mapActions} from 'vuex';
	import * as Actions from '../../store/constants';
	import Chartist from 'chartist';
	import PriceService from "../../services/apis/PriceService";
	import {dateId, utcToLocal} from "../../util/DateHelpers";
	require("../../styles/charts.scss");

	export default {
		props:['balances'],
		data(){return {
			chart:null,
			graphValue:null,
		}},
		computed:{
			...mapState([
				'priceData',
				'prices',
			]),
			...mapGetters([
				'displayCurrency',
			]),
			totalBalance(){
				return {
					amount:'1.0000 EOS',
				}
			}
		},
		mounted(){
			this.init();
		},
		methods:{
			async init(){
				if(this.priceData && this.priceData.hasOwnProperty('prices')) await this.setupGraph();
				const prices = await PriceService.getCurrencyPrices();
				const yesterday = await PriceService.getTimeline(dateId(1));
				const today = await PriceService.getTimeline();
				this[Actions.SET_PRICE_DATA]({prices, yesterday, today});
				this.setupGraph();
			},
			getTotaled(){
				let totaled = [];
				Object.keys(this.priceData.yesterday).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
					totaled.push({hour, data:this.priceData.yesterday[hour], date:dateId(1)}));
				Object.keys(this.priceData.today).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
					totaled.push({hour, data:this.priceData.today[hour], date:dateId()}));
				totaled = totaled.slice(totaled.length-(totaled.length > 24 ? 24 : totaled.length), totaled.length);
				return totaled;
			},
			async setupGraph(){
				try {
					const labels = [];
					const values = [];
					let totaled = this.getTotaled();
					const onlyShowingSystemAndUntouchable = (() => {
						if(this.balances.length !== 2) return false;
						const tokenUnique = this.balances[0].uniqueWithChain();
						return this.balances.every(x => x.uniqueWithChain(false) === tokenUnique);
					})();
					totaled.map(({hour, data, date}, i) => {
						[date, hour] = utcToLocal(date, hour);
						const label = `${hour}:00`;

						let total;

						if(this.balances.length === 1 || onlyShowingSystemAndUntouchable){
							let tokenUnique = this.balances[0].uniqueWithChain(false);
							total = (data[tokenUnique] / this.prices[tokenUnique].USD) * this.prices[tokenUnique][this.displayCurrency];
						} else {
							total = this.balances.reduce((acc,balance) => {
								const priceData = data[balance.uniqueWithChain()];
								if(!priceData) return acc;
								acc += parseFloat(balance.fiatBalance(false, priceData * this.priceData.prices[this.displayCurrency]));
								return acc;
							}, 0);
						}

						// let total = this.balances.reduce((acc,balance) => {
						// 	const priceData = data[balance.uniqueWithChain()];
						// 	if(!priceData) return acc;
						// 	acc += parseFloat(balance.fiatBalance(false, priceData * this.priceData.prices[this.displayCurrency]));
						// 	return acc;
						// }, 0);
						values.push({value:total, meta:`${date} ${label}`});
					})

					if(this.balances.length !== 1 && !onlyShowingSystemAndUntouchable){
						values.pop();
						values.push({value:this.totalBalance.amount, meta:'Now'});
					}

					const CHART_OPTIONS = {
						showArea:true,
						showPoint: true,
						lineSmooth: true,
						chartPadding: { top: 50, right: -20, bottom: -20, left: 0 },
						fullWidth:true,
						axisX: { showGrid: true, showLabel: false, },
						axisY: { showGrid:false, scaleMinSpace:0, showLabel: false, offset: 0, position: 'start', labelInterpolationFnc: n => this.formatNumber(n, n < 100000) },
					};

					if(!this.chart){
						this.chart = new Chartist.Line('.chart', {
							labels,
							series: [values]
						}, CHART_OPTIONS);
						this.chart.on('draw', data => {
							const toggleTooltip = (show = true) => {
								let parsed = parseFloat(data.value.y);
								if(this.balances.length !== 1) parsed = parsed.toFixed(2);
								// TODO:
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
								offset: 0,
								'stop-color': 'rgba(0, 168, 255, 0)'
							}).parent().elem('stop', {
								offset: 0.5,
								'stop-color': 'rgba(0, 168, 255, 1)'
							});
						});
					} else {
						this.chart.update({
							labels,
							series:[values]
						})
					}
				} catch(e){
					console.log('err', e);
				}
			},

			...mapActions([
				Actions.SET_PRICE_DATA,
			])
		},
		watch:{
			['balances'](){
				this.setupGraph();
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.token-graph {
		height:180px;
		width:100%;
		border-bottom:1px solid $border;
		position: relative;

		.tip {
			position:absolute;
			top:5px;
			right:5px;
			display:flex;
			justify-content: center;
			align-items: center;

			div {
				font-size: 11px;
				background:$blue;
				padding:5px 10px;
				color:$white;
			}
		}

		.chart {
			height:180px;
			width:100%;
		}
	}

</style>