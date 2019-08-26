<template>
	<section class="token-list" :class="{'blue':blue}">
		<SearchAndFilter full-search="1" v-on:terms="x => terms = x" />
		<section class="tokens">
			<section class="single-asset" :class="{'hoverable':hoverable, 'active':selected && selected.uniqueWithChain() === token.uniqueWithChain()}" v-for="token in sortedBalances" @click="selectToken(token)">
				<section class="asset-movement">
					<section class="token-change" v-if="!token.unusable && change(token).perc">
						<figure class="change-value" :class="{'red':!change(token).plus}" v-if="!token.unusable">{{change(token).perc}}</figure>
					</section>
					<section class="staked" v-if="token.unusable">
						<figure class="locked icon-lock">{{token.unusable}}</figure>
					</section>
				</section>
				<section class="asset-details">
					<section class="column token-icon">
						<section class="token-symbol" :class="token.name">
							<div class="symbol" :class="[{'iconed':token.symbolClass(), 'small':token && token.symbol.length >= 4, 'unusable':!!token.unusable}, token.symbolClass()]"></div>
						</section>
					</section>
					<section class="column token-value">
						<section v-if="token.amount">
							<figure class="title">{{token.symbol}}</figure>
							<figure class="secondary" v-if="token.fiatPrice() && parseFloat(token.fiatPrice())">{{fiatSymbol(displayCurrency)}}{{formatNumber(token.fiatPrice(), true)}}</figure>
						</section>
					</section>
					<section class="column token-conversion">
						<figure class="value">{{formatNumber(token.amount, true)}}</figure>
						<figure class="fiat" v-if="token.fiatBalance() && parseFloat(token.fiatBalance())">{{fiatSymbol(displayCurrency)}}{{formatNumber(token.fiatBalance(false), true)}} </figure>
						<!-- <figure class="secondary" v-if="token.baseTokenPrice() && parseFloat(token.baseTokenPrice())">{{formatNumber(token.baseTokenPrice(), true)}}</figure> -->
					</section>
				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import {mapState, mapGetters, mapActions} from 'vuex';
	import SearchAndFilter from "../reusable/SearchAndFilter";
	import Token from "@walletpack/core/models/Token";

	export default {
		components: {SearchAndFilter},
		props:['balances', 'hoverable', 'selected', 'noSearch', 'blue'],
		data(){return {
			terms:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'balanceFilters',
				'displayCurrency',
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
		padding:$padding-med 0 $padding-med $padding-med;
		background:$blue;

		.search-and-filter {
			background:white;
			border-radius:$radius-big $radius-big 0 0;
		}

		.tokens {
			height:calc(100% - 70px);
			overflow-y:auto;
			background:white;
			border-radius:0 0 $radius-big $radius-big;

			.single-asset {
				cursor: pointer;
				background:transparent;
				border-bottom:1px solid $lightergrey;
				height:72px;
  				transition: all 0.12s ease-in-out;
				grid-template-columns:78px auto;
				display: grid;

				&:hover,
				&.active {
					background-color:lighten($blue, 44%)
				}

				.asset-movement {
					border-right:1px solid rgba(0,0,0,.06);
					height:70px;
					line-height:72px;
					text-align:center;

					.staked {
						font-size:$small;
						color:$grey;
					}

					.token-change {
						text-align:center;
						align-self:center;
						display: inline-block;

						.change-value {
							font-size:$large;
							display:block;
							color:$green;
							font-family: 'Poppins', sans-serif;

							&.red {
								color:$red;
							}
						}
					}
				}

				.asset-details {
					display: grid;
					grid-template-columns:72px auto auto;

					.token-icon {
						width:72px;
						text-align:center;
						align-self:center;
					}

					.token-symbol {
						line-height: 44px;
					    font-size: 16px;
					    width: 44px;
					    height: 44px;
					    border-radius: 22px;
					    background: $grey;
					    margin: 0 auto;
				        position: relative;

				        &.TRX {
							background:linear-gradient(60deg, #304352 0%, lighten(#304352, 10%) 100%);
						}

						&.EOS {
							background:linear-gradient(60deg, $blue 0%, lighten($blue, 10%) 100%);
						}

						&.ETH {
							background:linear-gradient(60deg, #F15F79 0%, lighten(#F15F79, 10%) 100%);
						}

						&.BTC {
							background:linear-gradient(60deg, #757519 0%, lighten(#757519, 10%) 100%);
						}

						&.RIDL {
							background:linear-gradient(60deg, #8DC26F 0%, lighten(#8DC26F, 10%) 100%);
						}

						&.EBTC {
							background:linear-gradient(60deg, #92FE9D 0%, lighten(#92FE9D, 10%) 100%);
						}

						&.TRYBE {
							background:linear-gradient(60deg, #eea849 0%, lighten(#eea849, 10%) 100%);
						}

						&.BRM {
							background:linear-gradient(60deg, #00dbde 0%, lighten(#00dbde, 10%) 100%);
						}

						&.TEA {
							background:linear-gradient(60deg, #CCCCB2 0%, lighten(#CCCCB2, 10%) 100%);
						}

						&.ATMOS {
							background:linear-gradient(60deg, #BA8B02 0%, lighten(#BA8B02, 10%) 100%);
						}

						&.DICE {
							background:linear-gradient(60deg, #3d72b4 0%, lighten(#3d72b4, 10%) 100%);
						}

						&.ER {
							background:linear-gradient(60deg, #004FF9 0%, lighten(#004FF9, 10%) 100%);
						}

						&.MEETONE,
						&.Meet.One {
							background:linear-gradient(60deg, #135058 0%, lighten(#135058, 10%) 100%);
						}

						&.IQ {
							background:linear-gradient(60deg, #D1913C 0%, lighten(#D1913C, 10%) 100%);
						}

						&.PKE {
							background:linear-gradient(60deg, #7b4397 0%, lighten(#7b4397, 10%) 100%);
						}

						&.BLACK {
							background:linear-gradient(60deg, #111111 0%, lighten(#111111, 10%) 100%);
						}

						&.KARMA {
							background:linear-gradient(60deg, #dc2430 0%, lighten(#dc2430, 10%) 100%);
						}

						&.HASH {
							background:linear-gradient(60deg, #136a8a 0%, lighten(#136a8a, 10%) 100%);
						}

						&.INF {
							background:linear-gradient(60deg, #00bf8f 0%, lighten(#00bf8f, 10%) 100%);
						}

						&.TOB {
							background:linear-gradient(60deg, #ff0084 0%, lighten(#ff0084, 10%) 100%);
						}

						&.UTG {
							background:linear-gradient(60deg, #fd1d1d 0%, lighten(#fd1d1d, 10%) 100%);
						}

						&.BG {
							background:linear-gradient(60deg, #fcb045 0%, lighten(#fcb045, 10%) 100%);
						}

						&.EETH {
							background:linear-gradient(60deg, #C779D0 0%, lighten(#C779D0, 10%) 100%);
						}

						&.EETH {
							background:linear-gradient(60deg, #fcb045 0%, lighten(#fcb045, 10%) 100%);
						}

						&.BEAN {
							background:linear-gradient(60deg, #6441A5 0%, lighten(#6441A5, 10%) 100%);
						}

						&.ET {
							background:linear-gradient(60deg, #185a9d 0%, lighten(#185a9d, 10%) 100%);
						}

						&.PLO {
							background:linear-gradient(60deg, #00223E 0%, lighten(#00223E, 10%) 100%);
						}

						&.ZKS {
							background:linear-gradient(60deg, #0b8793 0%, lighten(#0b8793, 10%) 100%);
						}

						&.LUCK {
							background:linear-gradient(60deg, #948E99 0%, lighten(#948E99, 10%) 100%);
						}

						&.OFS {
							background:linear-gradient(60deg, #9a8478 0%, lighten(#9a8478, 10%) 100%);
						}

						&.TPT {
							background:linear-gradient(60deg, #D38312 0%, lighten(#D38312, 10%) 100%);
						}

						&.OKT {
							background:linear-gradient(60deg, #A83279 0%, lighten(#A83279, 10%) 100%);
						}

						&.PIXEOS {
							background:linear-gradient(60deg, #73C8A9 0%, lighten(#73C8A9, 10%) 100%);
						}

						&.POOR {
							background:linear-gradient(60deg, #373B44 0%, lighten(#373B44, 10%) 100%);
						}

						&.PEOS {
							background:linear-gradient(60deg, #485563 0%, lighten(#485563, 10%) 100%);
						}

						&.DBET {
							background:linear-gradient(60deg, #fe8c00 0%, lighten(#fe8c00, 10%) 100%);
						}

						&.EPT {
							background:linear-gradient(60deg, #52c234 0%, lighten(#52c234, 10%) 100%);
						}

						&.CRASH {
							background:linear-gradient(60deg, #0072ff 0%, lighten(#0072ff, 10%) 100%);
						}

						&.OCT {
							background:linear-gradient(60deg, #70e1f5 0%, lighten(#70e1f5, 10%) 100%);
						}

						&.EGT {
							background:linear-gradient(60deg, #556270 0%, lighten(#556270, 10%) 100%);
						}

						&.LT {
							background:linear-gradient(60deg, #9D50BB 0%, lighten(#9D50BB, 10%) 100%);
						}

						&.KING {
							background:linear-gradient(60deg, #780206 0%, lighten(#780206, 10%) 100%);
						}

						&.TGC {
							background:linear-gradient(60deg, #061161 0%, lighten(#061161, 10%) 100%);
						}

						&.LYNX {
							background:linear-gradient(60deg, #e74c3c 0%, lighten(#e74c3c, 10%) 100%);
						}

						&.MVISION {
							background:linear-gradient(60deg, #4B1248 0%, lighten(#4B1248, 10%) 100%);
						}

						&.CryptoBankCoin {
							background:linear-gradient(60deg, #FF4E50 0%, lighten(#FF4E50, 10%) 100%);
						}

						&.EXODUS {
							background:linear-gradient(60deg, #7B920A 0%, lighten(#7B920A, 10%) 100%);
						}

						&.TronLottery {
							background:linear-gradient(60deg, #BB377D 0%, lighten(#BB377D, 10%) 100%);
						}

						&.TRONONE {
							background:linear-gradient(60deg, #606c88 0%, lighten(#606c88, 10%) 100%);
						}

						&.Tronics {
							background:linear-gradient(60deg, #649173 0%, lighten(#649173, 10%) 100%);
						}

						&.BET {
							background:linear-gradient(60deg, #8CA6DB 0%, lighten(#8CA6DB, 10%) 100%);
						}

						&.BKT {
							background:linear-gradient(60deg, #870000 0%, lighten(#870000, 10%) 100%);
						}

						&.EUSD {
							background:linear-gradient(60deg, #3a7bd5 0%, lighten(#3a7bd5, 10%) 100%);
						}

						&.MAIL {
							background:linear-gradient(60deg, #D3959B 0%, lighten(#D3959B, 10%) 100%);
						}

						&.MAIL {
							background:linear-gradient(60deg, #f2709c 0%, lighten(#f2709c, 10%) 100%);
						}

						&.DAPPHDL {
							background:linear-gradient(60deg, #274046 0%, lighten(#274046, 10%) 100%);
						}

						&.PEN {
							background:linear-gradient(60deg, #faaca8 0%, lighten(#faaca8, 10%) 100%);
						}

						&.ATD {
							background:linear-gradient(60deg, #616161 0%, lighten(#616161, 10%) 100%);
						}

						&.SLT {
							background:linear-gradient(60deg, #215f00 0%, lighten(#215f00, 10%) 100%);
						}

						&.NEB {
							background:linear-gradient(60deg, #c21500 0%, lighten(#c21500, 10%) 100%);
						}

						&.TOOK {
							background:linear-gradient(60deg, #999966 0%, lighten(#999966, 10%) 100%);
						}

						&.EFOR {
							background:linear-gradient(60deg, #DE6262 0%, lighten(#DE6262, 10%) 100%);
						}

						&.WIZZ {
							background:linear-gradient(60deg, #d53369 0%, lighten(#d53369, 10%) 100%);
						}

						&.XBL {
							background:linear-gradient(60deg, #a73737 0%, lighten(#a73737, 10%) 100%);
						}

						&.ENJOY {
							background:linear-gradient(60deg, #f857a6 0%, lighten(#f857a6, 10%) 100%);
						}

						&.LTC {
							background:linear-gradient(60deg, #4b6cb7 0%, lighten(#4b6cb7, 10%) 100%);
						}

						&.BT {
							background:linear-gradient(60deg, #FC354C 0%, lighten(#FC354C, 10%) 100%);
						}

						&.EOSDT {
							background:linear-gradient(60deg, #0ABFBC 0%, lighten(#0ABFBC, 10%) 100%);
						}

						&.HPOINT {
							background:linear-gradient(60deg, #727a17 0%, lighten(#727a17, 10%) 100%);
						}

						&.JOY {
							background:linear-gradient(60deg, #e43a15 0%, lighten(#e43a15, 10%) 100%);
						}

						&.POKER {
							background:linear-gradient(60deg, #480048 0%, lighten(#480048, 10%) 100%);
						}

						&.EWGT {
							background:linear-gradient(60deg, #5f2c82 0%, lighten(#5f2c82, 10%) 100%);
						}

						&.FISH {
							background:linear-gradient(60deg, #F3A183 0%, lighten(#F3A183, 10%) 100%);
						}

						&.GAMBLR {
							background:linear-gradient(60deg, #7474BF 0%, lighten(#7474BF, 10%) 100%);
						}

						&.HBGO {
							background:linear-gradient(60deg, #ED4264 0%, lighten(#ED4264, 10%) 100%);
						}

						&.OSDS {
							background:linear-gradient(60deg, #4A569D 0%, lighten(#4A569D, 10%) 100%);
						}

						&.GO {
							background:linear-gradient(60deg, #514A9D 0%, lighten(#514A9D, 10%) 100%);
						}

						&.PHC {
							background:linear-gradient(60deg, #24C6DC 0%, lighten(#24C6DC, 10%) 100%);
						}

						&.PVP {
							background:linear-gradient(60deg, #283048 0%, lighten(#283048, 10%) 100%);
						}

						&.IOST {
							background:linear-gradient(60deg, #3D7EAA 0%, lighten(#3D7EAA, 10%) 100%);
						}

						&.ZKSPLAY {
							background:linear-gradient(60deg, #1CD8D2 0%, lighten(#1CD8D2, 10%) 100%);
						}

						&.DAI {
							background:linear-gradient(60deg, #c0392b 0%, lighten(#c0392b, 10%) 100%);
						}

						&.TUSD {
							background:linear-gradient(60deg, #27ae60 0%, lighten(#27ae60, 10%) 100%);
						}

						&.USDC {
							background:linear-gradient(60deg, #9b59b6 0%, lighten(#9b59b6, 10%) 100%);
						}

						&.Karma {
							background:linear-gradient(60deg, #ff4b1f 0%, lighten(#ff4b1f, 10%) 100%);
						}

						&.HorusPay {
							background:linear-gradient(60deg, #CB3066 0%, lighten(#CB3066, 10%) 100%);
						}

						&.HorusPay {
							background:linear-gradient(60deg, #CB3066 0%, lighten(#CB3066, 10%) 100%);
						}

						&.Prochain {
							background:linear-gradient(60deg, #16BFFD 0%, lighten(#16BFFD, 10%) 100%);
						}

						&.BetDice {
							background:linear-gradient(60deg, #16BFFD 0%, lighten(#16BFFD, 10%) 100%);
						}

						&.OracleChain {
							background:linear-gradient(60deg, #16BFFD 0%, lighten(#16BFFD, 10%) 100%);
						}

						&.HireVibes {
							background:linear-gradient(60deg, #19a974 0%, lighten(#19a974, 10%) 100%);
						}

						&.MyVegas {
							background:linear-gradient(60deg, #ff4b1f 0%, lighten(#ff4b1f, 10%) 100%);
						}

						&.Carbon {
							background:linear-gradient(60deg, #2196f3 0%, lighten(#2196f3, 10%) 100%);
						}

						

						.symbol {
							width: 44px;
						    height: 44px;
						    border-radius: 22px;
						    text-align: center;
					        font-size: 32px;
    						line-height: 44px;
    						color:white;
						}

						.icon-lock {
							float:left;
							color:$red;
						}
					}

					.token-value {
						align-self:center;
						text-align:left;
						font-size:$small;

						.title {
							margin-bottom:4px;
							font-weight:bold;
							font-size:$medium;
						}
					}

					.token-conversion {
						align-self:center;
						text-align:right;
						padding-right:$padding-small;
						font-size:$small;
						opacity: 0.6;

						.value {
							margin-bottom:4px;
							font-weight:bold;
							font-size:$medium;
						}
					}

					&:hover, &:active, &.active {
						border-color:$blue;
					}
				}

				

			}
		}
	}

</style>