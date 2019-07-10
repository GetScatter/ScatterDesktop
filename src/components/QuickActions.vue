<template>
	<section class="quick-actions" :class="{'short':isShort}">
		<section class="left" v-if="!hideMainBalance && !quickBack && accounts.length">
			<section class="balances">
				<section class="fiat">
					<span class="balance" @click="selectDisplays">{{totalBalance.symbol}}<AnimatedNumber :number="totalBalance.amount" /></span>
					<Refresh class="refresh" :class="{'spin':loadingBalances}" @click.native="refreshTokens" />
				</section>
				<section class="token" @click="selectDisplays" v-if="displayToken">
					<i class="symbol" :class="displayTokenClass()"></i>
					<span class="balance">{{formatNumber(totalTokenBalance.amount, true)}} {{totalTokenBalance.symbol}}</span>
				</section>
			</section>
		</section>
		<section class="left" v-if="!hideMainBalance && !quickBack && !accounts.length">
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
			<section class="action" @click="quickAction(RouteNames.TRANSFER)">
				<Send />
				<span>Send</span>
			</section>
			<section class="action" @click="quickAction(RouteNames.RECEIVE)">
				<Receive />
				<span>Receive</span>
			</section>
			<section class="action" @click="quickAction(RouteNames.EXCHANGE)">
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
	import AnimatedNumber from "./reusable/AnimatedNumber";
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";

	export default {
		components:{
			AnimatedNumber,
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
				'hideMainBalance',
				'networkTokens',
			]),
			totalBalance(){
				return PriceService.getTotal(this.totalBalances.totals);
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
					RouteNames.DASHBOARD,
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
			},
			onAccount(){
				if(this.$route.name !== RouteNames.ACCOUNT) return;
				return this.accounts.find(x => x.unique() === this.$route.params.unique);
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
			quickAction(route){
				if(this.onAccount){
					return this.$router.push({name:route, query:{account:this.onAccount.identifiable()}})
				}

				this.$router.push({name:route});
			},
			selectDisplays(){
				PopupService.push(Popup.setDisplayToken(done => {

				}));
			},
			displayTokenClass(){
				return this.networkTokens.find(x => x.uniqueWithChain() === this.displayToken).symbolClass()
			}
		}

	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.quick-actions {
		height:$quickactionsheight;
		border-right:1px solid $darkerblue;
		background:$blue;
		border-top:1px solid rgba(255,255,255,0.12);
		border-bottom:1px solid rgba(255,255,255,0.12);

		&:not(.short){
			height:calc(#{$quickactionsheight} + #{$quickactionsbuffer});
		}

		width:100%;
		padding:40px;

		display:flex;
		color:$white;

		.left { flex:1; }
		.right {
			display:flex;
			justify-content: flex-end;
			flex:1;
		}

		.quick-back {
			font-size: 24px;
			width:34px;
			height:34px;
			border:2px solid white;
			line-height:24px;
			text-align:center;
			display:block;
			border-radius:22px;
			cursor: pointer;
			margin-top:10px;

			i {
				&:before {
					padding:0;
					margin:3px 0 0 0;
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
				font-size: 22px;
				margin-left:10px;
			}
		}

		.balances {
			cursor: pointer;
		}

		.token {
			display:flex;
			align-items: center;
			margin-top:2px;

			.balance {
				font-size: $small;
				font-weight: bold;
			}
			.symbol {
				cursor: pointer;
				font-size: 18px;
				margin-left:-3px;
			}
		}

		.action {
			height:55px;
			display:flex;
			flex-direction: column;
			justify-content: center;
			padding:0 20px;
			font-size: $medium;
			font-weight:bold;
			text-align:center;
			cursor: pointer;
			margin-top:-7px;
			color:rgba(255,255,255,0.8);

			img {
				transition:transform 0.2s ease;
				transform:translateY(0px);
				width: 44px;
				margin: 0 auto 4px;
			}

			&:hover {
				color:rgba(255,255,255,1);
			}

			&:last-child {
				border-left:1px solid rgba(255,255,255,0.12);
				padding-left:30px;
				margin-left:10px;
				padding-right:0;
			}
		}
	}

</style>