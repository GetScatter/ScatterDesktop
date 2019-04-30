<template>
	<section class="token-list">
		<SearchAndFilter full-search="1" v-on:terms="x => terms = x" />
		<section class="tokens">
			<section class="token" v-for="token in sortedBalances">
				<figure class="symbol" :class="[{'iconed':token.symbolClass(), 'small':token && token.symbol.length >= 4, 'unusable':!!token.unusable}, token.symbolClass()]">
					<span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
					<div class="locked icon-lock" v-if="token.unusable"></div>
				</figure>
				<section class="details">
					<figure class="amount">{{token.amount}} {{token.symbol}}</figure>
					<section class="row">
						<figure class="unusable" v-if="token.unusable">{{token.unusable}}</figure>
						<figure class="change" v-if="!token.unusable"><b :class="{'red':!change(token).plus}">{{change(token).perc}}</b></figure>
						<figure class="fiat">{{token.fiatBalance()}} <span v-if="token.fiatPrice()">({{token.fiatPrice()}})</span></figure>
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
		props:['balances'],
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
					const untouchable = this.account && !!b.unusable ? 1 : this.account && !!a.unusable ? -1 : 0;
					const systemTokenUniques = this.networkTokens.map(x => x.uniqueWithChain(false));
					const isSelfSystem = systemTokenUniques.includes(b.uniqueWithChain(false)) ? 1 : systemTokenUniques.includes(a.uniqueWithChain(false)) ? -1 : 0;
					return isSelfSystem || system || untouchable || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0);
				})
			}
		},
		methods:{
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
			height:calc(100vh - 470px);

			.token {
				display:flex;
				margin-bottom:15px;
				border-bottom:1px solid rgba(0,0,0,0.04);
				padding-bottom:10px;

				.symbol {
					width:45px;
					height:45px;
					border-radius:50%;
					box-shadow:0 1px 2px $blue-shadow, 0 2px 3px $blue-shadow;
					display:flex;
					justify-content: center;
					align-items: center;
					font-size: 14px;
					position: relative;
					color:$silver;

					&.small {
						font-size: 11px;
					}

					&.iconed {
						font-size: 36px;
					}

					&.unusable {
						background:$blue-gradient;
						color:$white;
						border:3px solid $white;
					}

					.locked {
						position:absolute;
						font-size: 13px;
						top:5px;
						right:3px;
						text-shadow:0 1px 2px rgba(0,0,0,0.2), 0 3px 8px rgba(0,0,0,0.3);
					}
				}

				.details {
					flex:1;
					padding:0 10px;
					display:flex;
					flex-direction: column;
					justify-content: center;

					.amount {
						font-size: $medium;
						font-weight: bold;
					}

					.row {
						display:flex;
						justify-content: space-between;
						margin-top:3px;
					}

					.change {
						font-size: $small;
						font-weight: bold;
					}

					.fiat {
						font-size: $small;
						margin-left:10px;
						color:$silver;
					}

					.unusable {
						color:$red;
						font-weight: bold;
						font-size: $small;
					}
				}
			}
		}
	}

</style>