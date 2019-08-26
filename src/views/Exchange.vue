<template>
	<section>
		<section class="exchange" v-if="account && token && toSend">
			<!----------------------->
			<!--------- FROM -------->
			<!----------------------->
			<section class="greyback">
				<section class="limit-width">
					<section class="boxes">
						<section class="box-container">
							<label>From & Token</label>
							<section class="box nested account-selector" @click="selectTokenAndAccount">
								<section>
									<figure class="name">{{account.sendable()}}</figure>
									<figure class="network">{{account.network().name}}</figure>
									<figure class="token">{{token.amount}} {{token.symbol}}</figure>
									<figure class="price">{{token.fiatPrice()}}</figure>
								</section>
								<figure class="chevron icon-dot-3"></figure>
							</section>
						</section>
						<section class="box-container">
							<label>Receiver</label>
							<section class="box nested">
								<section class="padded recipient-selector" @click="selectRecipient">
									<figure class="name">Contacts</figure>
									<figure class="chevron icon-dot-3"></figure>
								</section>
								<figure class="line"></figure>
								<section class="input-container">
									<input placeholder="Address / Account" v-model="recipient" class="input" />
								</section>
							</section>
						</section>
					</section>
				</section>
			</section>



			<!----------------------->
			<!---------- TO --------->
			<!----------------------->
			<section class="whiteback">
				<section class="limit-width">
					<!--<section class="split-flex">-->
						<!--<label>To Token</label>-->
						<!--<section class="min-max">-->
							<!--<div>Min<span>120.0000</span></div>-->
							<!--<div>Max<span>120.0000</span></div>-->
						<!--</section>-->
					<!--</section>-->


					<section class="boxes" style="margin:0;">


						<section class="box" :class="{'not-allowed':!rate}">
							<section class="input-container">
								<figure class="label">{{token.truncatedSymbol()}}</figure>
								<input :disabled="!rate" placeholder="0.00" v-on:input="changedAmount" v-model="toSend.amount" class="input" />
							</section>
							<figure class="line"></figure>
							<section class="input-container">
								<figure class="label">{{displayCurrency}}</figure>
								<input :disabled="!rate" placeholder="0.00" v-if="toSend.fiatPrice()" v-on:input="changedFiat" v-model="fiat" class="input" />
								<figure class="input not-available" v-else>Price not available</figure>
							</section>
						</section>




						<!--- LOADING PAIRS --->
						<section class="box account-selector" v-if="loadingPairs">
							<section class="symbol"><i class="icon-spin4 animate-spin"></i></section>
							<section>
								<figure class="name">Loading Pairs</figure>
								<figure class="network">Please wait</figure>
							</section>
						</section>

						<!--- PAIRS LOADED --->
						<section class="box account-selector" @click="selectToken" v-if="!loadingPairs">

							<section class="symbol icon-attention-circled" v-if="!pair"></section>
							<section class="symbol" v-else-if="loadingRate"><i class="icon-spin4 animate-spin"></i></section>
							<section class="symbol" v-else>
								<figure class="icon" :class="[{'small':pair && pair.symbol.length >= 4}, pair.symbolClass()]">
									<span v-if="!pair.symbolClass()">{{pair.truncatedSymbol()}}</span>
								</figure>
							</section>


							<section v-if="!pair">
								<figure class="name" v-if="pairs.length">Select a Token</figure>
								<figure class="name" v-else>No pairs found</figure>
							</section>
							<section v-if="pair">
								<figure class="name" v-if="!loadingRate">{{estimatedAmount}}</figure>
								<figure class="name" v-if="loadingRate">Loading Rate</figure>
								<figure class="network" v-if="pair">{{pair.symbol}}</figure>
							</section>
							<figure class="chevron icon-dot-3" v-if="pairs.length"></figure>
						</section>
					</section>

				</section>
			</section>


			<section class="tail">
				<Button :disabled="!canExchange" big="1" text="Exchange" blue="1" @click.native="exchange" />
			</section>
		</section>

	</section>
</template>

<script>
	import {mapGetters, mapActions, mapState} from 'vuex';
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";
	import BalanceService from "@walletpack/core/services/blockchain/BalanceService";
	import PriceService from "@walletpack/core/services/apis/PriceService";
	import Token from "@walletpack/core/models/Token";
	import ExchangeService from "@walletpack/core/services/apis/ExchangeService";
	import TokenService from "@walletpack/core/services/utility/TokenService";
	import * as Actions from "@walletpack/core/store/constants";
	import TransferService from "@walletpack/core/services/blockchain/TransferService";
	import HistoricExchange from "@walletpack/core/models/histories/HistoricExchange";
	require('../styles/transfers.scss');

	export default {
		data(){return {
			account:null,
			recipient:null,
			memo:'',

			token:null,
			toSend:null,
			fiat:0,

			sending:false,

			rawPairs:[],
			pairs:[],
			pair:null,
			rate:null,
			loadingPairs:false,
			loadingRate:false,

		}},
		computed:{
			...mapState([
				'history',
			]),
			...mapGetters([
				'accounts',
				'displayCurrency'
			]),
			sendableTokens(){
				return this.account.tokens().filter(x => !x.unusable).sort((a,b) => {
					return Token.sorter(a,b);
				});
			},
			canExchange(){
				return !!this.rate &&
					!!this.pair &&
					!this.sending &&
					this.recipient &&
					this.toSend.amount > 0 &&
					(this.rate.min === null || this.rate.min <= this.estimatedAmount) &&
					(this.rate.max === null || this.rate.max >= this.estimatedAmount)
			},
			estimatedAmount(){
				if(!this.rate) return 0;
				if(!this.pair) return 0;
				return parseFloat(this.rate.rate * this.toSend.amount).toFixed(this.pair.decimals);
			},
			rawPair(){
				if(!this.pair) return;
				return this.rawPairs.find(x => x.token.id === this.pair.id);
			}
		},
		mounted(){
			const history = this.$route.query.history ? this.history.find(x => x.id === this.$route.query.history) : null;
			if(history){
				setTimeout(async () => {
					this.account = history.from;
					this.recipient = history.to;
					this.setToken(history.fromToken);
					await this.getPairs();
					if(this.rawPairs.length){
						const pair = this.rawPairs.find(x => x.token.uniqueWithChain() === history.toToken.uniqueWithChain());
						if(pair) this.setPair(pair.token);
					}
				})
				return;
			}

			if(this.$route.query.account){
				this.account = this.accounts.find(x => x.identifiable() === this.$route.query.account);
			}

			if(!this.account){
				this.account = this.accounts.filter(x => x.tokens().length)
					.sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance())[0];
			}

			this.recipient = this.account.sendable();
			this.setToken(this.sendableTokens[0]);
		},
		methods:{
			selectTokenAndAccount(){
				PopupService.push(Popup.selectTokenAndAccount(result => {
					if(!result) return;
					const {token, account} = result;
					this.account = account;
					this.setToken(token);

					this.recipient = this.account.sendable();
				}))
			},
			selectRecipient(){
				PopupService.push(Popup.selectRecipient(this.account ? this.account.blockchain() : null, recipient => {
					if(!recipient) return;
					this.recipient = recipient;
				}));
			},
			selectToken(){
				if(!this.pairs.length) return;
				PopupService.push(Popup.selectToken(this.pairs, token => {
					if(!token) return;
					this.setPair(token.clone());
				}))
			},
			setToken(token){
				PriceService.setPrices();
				this.token = this.account.tokens().find(x => x.uniqueWithChain() === token.uniqueWithChain()).clone();
				this.toSend = this.token.clone();
				this.toSend.amount = 0;
				this.fiat = 0;
				this.rate = null;
				this.pair = null;
				// this.recipient = null;
			},
			changedFiat(){
				this.toSend.amount = parseFloat(this.fiat / this.toSend.fiatPrice(false)).toFixed(this.toSend.decimals);
			},
			changedAmount(){
				this.fiat = !this.toSend.amount || this.toSend.amount === '' ? null : this.toSend.fiatBalance(false)
			},







			cantConnect(){
				PopupService.push(Popup.prompt(
					this.locale(this.langKeys.EXCHANGE.ExchangeError),
					this.locale(this.langKeys.EXCHANGE.CantConnect)
				));
				this.$router.push({name:this.RouteNames.HOME});
			},
			setPair(pair){
				this.pair = pair;
				this.getRate();
			},

			async getPairs(){
				this.pair = null;
				this.pairs = {};
				this.loadingPairs = true;
				let pairs = await ExchangeService.pairs(this.token);
				let {base, stable, eth, eos, trx} = pairs;

				this.rawPairs = Object.keys(pairs).reduce((acc,key) => {
					acc = acc.concat(pairs[key]);
					return acc;
				}, []);

				if(!pairs) {
					this.cantConnect();
				} else {

					let categories = [];

					let bases = [];
					if(base) bases = bases.concat(base.map(x => x.token));
					if(stable) bases = bases.concat(stable.map(x => x.token));
					if(bases.length) categories.push({ tokens:bases })

					const swaps = [eth,eos,trx].filter(x => !!x).reduce((acc,x) => {
						x.map(t => acc.push(t.token));
						return acc;
					}, []);
					if(swaps.length) categories.push({ tokens:swaps });

					this.pairs = categories;
				}
				if(!this.rawPairs.length) this.rate = null;
				if(this.rawPairs.length === 1) this.setPair(this.rawPairs[0].token);
				this.loadingPairs = false;
				return true;
			},
			async getRate(){
				this.loadingRate = true;
				this.rate = null;
				this.rate = await ExchangeService.rate(this.token, this.rawPair.symbol, this.rawPair.service);
				this.loadingRate = false;
			},




			async exchange(){
				if(!this.canExchange) return;
				this.sending = true;
				const from = { account:this.account.sendable() };
				const to = { account:this.recipient };
				const amount = this.toSend.amount;
				const order = await ExchangeService.order(this.rawPair.service, this.token, this.pair.symbol, amount, from, to);

				if(!order) {
					this.cantConnect();
					this.sending = false;
					return;
				}
				const accounts = {
					from:from.account,
					to:to.account,
				}
				const symbols = {
					from:this.token.symbol,
					to:this.pair.symbol
				}

				ExchangeService.accepted(order.id);
				const sent = await TransferService[this.account.blockchain()]({
					account:this.account,
					recipient:order.account,
					amount,
					memo:order.memo,
					token:this.token,
					promptForSignature:false,
					bypassHistory:true,
				}).catch(() => false);
				if(sent){
					if(!TokenService.hasToken(this.rawPair.token)){
						if(!!this.rawPair.token.contract && !!this.rawPair.token.contract.length) {
							await TokenService.addToken(this.rawPair.token, false, false);
						}
					}
					const history = new HistoricExchange(this.account, this.recipient, this.toSend, this.pair, order, TransferService.getTransferId(sent, this.token.blockchain));
					this[Actions.DELTA_HISTORY](history);
					setTimeout(() => {
						ExchangeService.watch(history);
						BalanceService.loadBalancesFor(this.account);
					}, 1000);
				}
				this.sending = false;
			},


			...mapActions([
				Actions.DELTA_HISTORY
			])
		},
		watch:{
			['token.symbol'](){
				this.getPairs();
			}
		},
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

</style>