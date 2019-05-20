<template>
	<section class="token-list">
		<SearchAndFilter full-search="1" v-on:terms="x => terms = x" />
		<section class="tokens">
			<section class="badge-item" :class="{'hoverable':hoverable, 'active':selected && selected.uniqueWithChain() === token.uniqueWithChain()}" v-for="token in sortedBalances" @click="selectToken(token)">
				<figure class="badge" :class="[{'iconed':token.symbolClass(), 'small':token && token.symbol.length >= 4, 'unusable':!!token.unusable}, token.symbolClass()]">
					<span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
					<div class="locked icon-lock" v-if="token.unusable"></div>
				</figure>
				<section class="details">
					<figure class="title"><span v-if="token.amount">{{formatNumber(token.amount, true)}}</span> {{token.symbol}}</figure>
					<section class="row">
						<figure class="red" v-if="token.unusable">{{token.unusable}}</figure>
						<figure class="primary" v-if="!token.unusable"><b :class="{'red':!change(token).plus}">{{change(token).perc}}</b></figure>
						<figure class="secondary" v-if="token.fiatBalance() && parseFloat(token.fiatBalance())">{{formatNumber(token.fiatBalance(), true)}} </figure>
					</section>
					<section class="row" v-if="token.fiatPrice()">
						<figure class="secondary" v-if="token.fiatBalance() && parseFloat(token.fiatBalance())">{{formatNumber(token.baseTokenPrice(), true)}}</figure>
						<figure class="secondary">{{formatNumber(token.fiatPrice(), true)}}</figure>
					</section>
				</section>

			</section>
		</section>
	</section>
</template>

<script>
	import {mapState, mapGetters, mapActions} from 'vuex';
	import * as Actions from '../../store/constants';
	import SearchAndFilter from "../reusable/SearchAndFilter";
	import Token from "../../models/Token";

	export default {
		components: {SearchAndFilter},
		props:['balances', 'hoverable', 'selected', 'noSearch'],
		data(){return {
			terms:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'networkTokens',
				'balanceFilters'
			]),
			sortedBalances(){
				return this.balances
					.filter(token => {
						if(!this.terms.length) return true;
						if(this.terms === '-') return this.change(token) && !this.change(token).plus && token.fiatBalance(false);
						if(this.terms === '+') return this.change(token) && this.change(token).plus && token.fiatBalance(false);
						if(this.terms.indexOf('::') > -1) return `${token.contract.toLowerCase()}::${token.symbol.toLowerCase()}` === this.terms;
						if(isNaN(this.terms)) return token.symbol.toLowerCase().indexOf(this.terms) > -1 || token.contract.toLowerCase().indexOf(this.terms) > -1;
						return token.amount >= parseFloat(this.terms);
					}).sort((a,b) => {
						if(this.terms === '+' || this.terms === '-') return this.change(b, true) - this.change(a, true);
						return Token.sorter(a,b);
					})
			}
		},
		methods:{
			selectToken(token){
				if(!this.hoverable) return;
				this.$emit('token', token);
			},
			change(token, numOnly = false){
				const dummy = {plus:false, perc:'0%'};
				if(!this.priceData || !this.priceData.hasOwnProperty('today')) return dummy;
				if(token.unusable) return dummy;
				const hour = this.priceData.today.latest;
				const totaled = this.getTokensTotaled();
				const latest = totaled[totaled.length-1] ? totaled[totaled.length-1].data : null;
				const earliest = totaled[0] ? totaled[0].data : null;
				if(!latest || !earliest || !latest[token.uniqueWithChain()] || !earliest[token.uniqueWithChain()]) return '--';
				const diff = earliest[token.uniqueWithChain()] - latest[token.uniqueWithChain()];
				const change = (diff / earliest[token.uniqueWithChain()]) * 100;
				if(numOnly) return Math.abs(parseFloat(change).toFixed(2));
				const symbol = change > 0 ? '-' : '+';
				return {plus:change <= 0, perc:`${symbol}${Math.abs(parseFloat(change).toFixed(2))}%`};
			},
		},
		watch:{
			['terms'](){
				this.$emit('balances', this.sortedBalances);
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.token-list {
		width:100%;
		flex:1;

		.search-and-filter {
			padding:0 20px;
			border-bottom:0;
		}

		.tokens {
			padding:20px;
			overflow-y:auto;
			height:calc(100% - 70px);
			//height:calc(100vh - 470px);
		}
	}

</style>