<template>
	<section class="token-list">
		<SearchAndFilter full-search="1" v-on:terms="x => terms = x" />
		<section class="tokens">
			<section class="badge-item" :class="{'hoverable':hoverable, 'active':selected && selected.unique() === token.unique()}" v-for="token in sortedBalances" @click="selectToken(token)">
				<figure class="badge" :class="[{'iconed':token.symbolClass(), 'small':token && token.symbol.length >= 4, 'unusable':!!token.unusable}, token.symbolClass()]">
					<span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
					<div class="locked icon-lock" v-if="token.unusable"></div>
				</figure>
				<section class="details">
					<figure class="title">{{token.amount}} {{token.symbol}}</figure>
					<section class="row">
						<figure class="red" v-if="token.unusable">{{token.unusable}}</figure>
						<figure class="primary" v-if="!token.unusable"><b :class="{'red':!change(token).plus}">{{change(token).perc}}</b></figure>
						<figure class="secondary">{{token.fiatBalance()}} </figure>
					</section>
					<section class="row" v-if="token.fiatPrice()">
						<figure class="secondary">{{token.baseTokenPrice()}}</figure>
						<figure class="secondary">{{token.fiatPrice()}}</figure>
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

	export default {
		components: {SearchAndFilter},
		props:['balances', 'hoverable', 'selected'],
		data(){return {
			terms:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'networkTokens',
			]),
			sortedBalances(){
				return this.balances.filter(token => {
					if(!this.terms.length) return true;
					if(this.terms === '-') return this.change(token) && !this.change(token).plus && token.fiatBalance(false);
					if(this.terms === '+') return this.change(token) && this.change(token).plus && token.fiatBalance(false);
					if(this.terms.indexOf('::') > -1) return `${token.contract.toLowerCase()}::${token.symbol.toLowerCase()}` === this.terms;
					if(isNaN(this.terms)) return token.symbol.toLowerCase().indexOf(this.terms) > -1 || token.contract.toLowerCase().indexOf(this.terms) > -1;
					return token.amount >= parseFloat(this.terms);
				}).sort((a,b) => {
					if(this.terms === '+' || this.terms === '-') return this.change(b, true) - this.change(a, true);
					const systemToken = !this.account ? null : this.account.network().systemToken().uniqueWithChain();
					const system = systemToken === b.uniqueWithChain() ? 1 : systemToken === a.uniqueWithChain() ? -1 : 0;
					const untouchable = !!b.unusable ? 1 : !!a.unusable ? -1 : 0;
					const systemTokenUniques = this.networkTokens.map(x => x.uniqueWithChain(false));
					const isSelfSystem = systemTokenUniques.includes(b.uniqueWithChain(false)) ? 1 : systemTokenUniques.includes(a.uniqueWithChain(false)) ? -1 : 0;
					return isSelfSystem || system || untouchable || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0);
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