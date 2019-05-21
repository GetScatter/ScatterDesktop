<template>
	<section class="quick-actions" :class="{'short':isShort}">
		<section class="left" v-if="!quickBack && accounts.length">
			<section class="fiat">
				<span class="balance">{{totalBalance.symbol}}{{formatNumber(totalBalance.amount, true)}}</span>
				<Refresh class="refresh" :class="{'spin':loadingBalances}" @click.native="refreshTokens" />
			</section>
			<section class="token" v-if="displayToken">
				<i class="symbol token-eos-eos"></i>
				<span class="balance">{{formatNumber(totalTokenBalance.amount, true)}} {{totalTokenBalance.symbol}}</span>
			</section>
		</section>
		<section class="left" v-if="!quickBack && !accounts.length">
			<section class="fiat">
				<span class="balance" style="opacity:0.2;">No accounts</span>
			</section>
		</section>


		<section class="left" v-if="quickBack">
			<section class="quick-back" @click="back">
				<i class="icon-left-small"></i>
			</section>
		</section>

		<section class="right" v-if="accounts.length">
			<section class="action" @click="$router.push({name:RouteNames.TRANSFER})">
				<Send />
				<span>Send</span>
			</section>
			<section class="action" @click="$router.push({name:RouteNames.RECEIVE})">
				<Receive />
				<span>Receive</span>
			</section>
			<section class="action" @click="$router.push({name:RouteNames.EXCHANGE})">
				<Exchange />
				<span>Exchange</span>
			</section>
		</section>
	</section>
</template>

<script>
	import {mapGetters, mapState} from 'vuex';
	import Send from './svgs/quick-actions/Send';
	import Refresh from './svgs/quick-actions/Refresh';
	import Exchange from './svgs/quick-actions/Exchange';
	import Receive from './svgs/quick-actions/Receive';
	import PriceService from "../services/apis/PriceService";
	import BalanceService from "../services/blockchain/BalanceService";
	import {RouteNames} from "../vue/Routing";

	export default {
		components:{
			Send,
			Refresh,
			Exchange,
			Receive
		},
		data(){return {
			loadingBalances:false,
		}},
		computed:{
			...mapState([
				'scatter',
				'balances',
				'prices',
				'history',
			]),
			...mapGetters([
				'keypairs',
				'accounts',
				'totalBalances',
				'displayToken',
				'displayCurrency',
			]),
			totalBalance(){
				const totals = this.totalBalances.totals;
				return PriceService.getTotal(totals);
			},
			totalTokenBalance(){
				const totals = this.totalBalances.totals;
				return PriceService.getTotal(totals, null, false, this.displayToken);
			},
			isShort(){
				return [
					RouteNames.ASSETS,
					RouteNames.TRANSFER,
					RouteNames.RECEIVE,
					RouteNames.EXCHANGE,
					RouteNames.ACCOUNT,
					RouteNames.IDENTITIES,
					this.features.creditCards ? null : RouteNames.WALLET,
				].filter(x => !!x).includes(this.$route.name);
			},
			quickBack(){
				return [
					RouteNames.ACCOUNT,
					RouteNames.EXCHANGE,
					RouteNames.TRANSFER,
					RouteNames.RECEIVE,
					RouteNames.APP,
				].filter(x => !!x).includes(this.$route.name);
			}
		},
		mounted(){
			this.refreshTokens();
		},
		methods:{
			async refreshTokens(force = false){
				if(!force && Object.keys(this.balances).length) return;
				if(this.loadingBalances) return;
				this.loadingBalances = true;
				await BalanceService.loadAllBalances(true);
				await PriceService.getAll();
				this.loadingBalances = false;
			},
		}

	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.quick-actions {
		height:$quickactionsheight;
		border-right:1px solid $darkerblue;

		&:not(.short){
			height:calc(#{$quickactionsheight} + #{$quickactionsbuffer});
		}

		width:100%;
		background:$blue;
		/* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#007fd7+0,00a8ff+100 */
		background: #007fd7; /* Old browsers */
		background: $blue-gradient;
		padding:40px;

		display:flex;
		color:$white;

		.left { flex:1; }
		.right {
			flex:0 0 auto;
			display:flex;
		}

		.quick-back {
			font-size: 48px;
			line-height:0;
			cursor: pointer;
			display:inline-block;

			i {
				&:before {
					padding:0;
					margin:0;
				}
			}

		}

		.fiat {
			display:flex;
			align-items: center;

			.balance {
				font-size: 24px;
				font-weight: bold;
			}

			.refresh {
				cursor: pointer;
				font-size: 24px;
				margin-left:10px;
			}
		}

		.token {
			display:flex;
			align-items: center;
			margin-top:5px;

			.balance {
				font-size: $small;
				font-weight: bold;
			}
			.symbol {
				cursor: pointer;
				font-size: 24px;
			}
		}

		.action {
			height:55px;
			display:flex;
			flex-direction: column;
			justify-content: center;
			padding:0 20px;
			font-size: $medium;
			text-align:center;
			cursor: pointer;

			img {
				transition:transform 0.2s ease;
				transform:translateY(0px);
			    width: 44px;
    			margin: 0 auto;
			}

			&:hover {
				img {
					animation: slowbounce 1s ease infinite;
				}
			}

			&:last-child {
				border-left:2px solid rgba(255,255,255,0.2);
				padding-left:30px;
				margin-left:10px;
				padding-right:0;
			}
		}
	}

</style>