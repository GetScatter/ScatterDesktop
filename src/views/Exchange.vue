<template>
	<section class="transfer">
		<back-bar v-on:back="back" :buttons="[{text:'History', clicked:() => $router.push({name:RouteNames.DISPLAY_TOKEN})}]" />

		<TokenSelector v-if="selectingToken" title="Select Token" :lists="selectableTokens" />

		<section class="full-panel inner limited" v-if="!selectingToken">

			<section class="tokens-out">

				<section class="panel">
					<h5>Exchange</h5>

					<section>
						<section class="box">
							<section class="row clickable" @click="selectAccount('from')">
								<figure class="fill">
									<div>{{account.network().name}}</div>
									{{account.sendable()}}
								</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
							<section class="row unpad">
								<figure class="fill pad darker">
									<div>{{account.tokenBalance(token)}} {{token.symbol}}</div>
								</figure>
							</section>
							<section class="row unpad">
								<figure class="fill pad">
									<section class="row unpad" style="width:50%;">
										<div class="fraction clickable" @click="setFraction('100')">100%</div>
										<div class="fraction clickable" @click="setFraction('1/2')">1/2</div>
										<div class="fraction clickable" @click="setFraction('1/4')">1/4</div>
									</section>
								</figure>
							</section>
						</section>
					</section>


					<section style="max-height: 100px;">
						<section class="box" :class="{'unclickable':loadingPairs || loadingRate, 'clickable':pairs.length}" @click="selectToken('from')">
							<section class="row" v-if="loadingPairs">
								<figure class="fill">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
							</section>
							<section class="row clickable" v-else>
								<figure class="icon" :class="{'small':token && token.symbol.length >= 4}">{{token.symbol.length > 4 ? token.symbol[0] : token.symbol}}</figure>
								<figure class="fill">{{token.name}}</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
							<section class="row">
								<figure class="icon icon-right-outline"></figure>
								<figure class="fill">
									<input v-model="token.amount" v-on:input="changedAmount"
									       :placeholder="parseFloat(1).toFixed(token.decimals)" />
								</figure>
							</section>
							<section class="row unpad">
								<section class="row pad">
									<figure class="icon small">{{displayCurrency}}</figure>
									<input style="flex:1;" class="small" v-model="fiat" v-on:input="changedFiat" placeholder="0.00" />
								</section>
							</section>
						</section>
					</section>

				</section>






				<!-- RIGHT PANEL -->
				<section class="panel">
					<h5>Receive</h5>

					<section>
						<section class="box dark clickable outlined">
							<section class="row" style="height:144px; text-align:center;" @click="selectAccount('to')">
								<figure class="fill">
									{{recipient && recipient.length ? recipient : 'Select Recipient'}}
								</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
						</section>
					</section>

					<section>
						<section class="box dark">
							<section class="row" v-if="loadingPairs">
								<figure class="fill" style="flex:0 0 auto; padding-right:20px;">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
								<figure class="fill">Fetching Pairs</figure>
							</section>
							<section class="row clickable" v-else @click="selectToken('to')">
								<figure class="icon" :class="{'small':pair && pair.symbol.length >= 4}" v-if="pairs.length && pair">{{pair ? pair.symbol : ''}}</figure>
								<figure class="fill">{{pairs.length ? pair ? pair.symbol : `Select Pair (${pairs.length})` : 'No Available Pairs'}}</figure>
								<figure class="chevron" :class="{'icon-down-open-big':pairs.length > 1, 'icon-lock':pairs.length === 1}" v-if="pairs.length"></figure>
								<figure class="chevron icon-cancel" v-if="!pairs.length"></figure>
							</section>
							<section class="row" v-if="loadingRate || !rate">
								<figure class="fill" style="flex:0 0 auto; padding-right:20px;" v-if="loadingRate">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
								<figure class="fill" v-if="loadingRate">Fetching Rate</figure>
								<figure class="fill" v-else>No Rates</figure>
							</section>
							<section class="row" v-else>
								<figure class="icon" :class="{'small':pair && pair.symbol.length >= 4}">{{pair ? pair.symbol : '--'}}</figure>
								<figure class="fill">
									<input v-model="estimatedAmount" :class="{'bad':rate && rate.max && (estimatedAmount > rate.max || estimatedAmount < rate.min)}" :disabled="true" />
								</figure>
							</section>
							<section class="row unpad">
								<section class="row pad">
									<figure class="icon small" style="width:auto;">MIN</figure>
									<div class="small" style="flex:0 0 auto;" :class="{'bad':rate && rate.min && (rate.min > estimatedAmount)}">{{rate && rate.min ? rate.min : '--'}}</div>
									<figure class="icon small" style="margin-left:50px; width:auto;">MAX</figure>
									<div class="small" style="flex:0 0 auto;" :class="{'bad':rate && rate.max && (rate.max < estimatedAmount)}">{{rate && rate.max ? rate.max : '--'}}</div>
								</section>
							</section>
						</section>
					</section>
				</section>

			</section>


			<section class="action-bar short bottom centered">
				<btn blue="1" text="Exchange Tokens" v-on:clicked="send" :disabled="!canSend" :loading="sending" />
			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import TokenSelector from '../components/panels/TokenSelector';
	import ExchangeService from "../services/ExchangeService";
	import Account from "../models/Account";
	import PopupService from "../services/PopupService";
	import {Popup} from "../models/popups/Popup";
	import TransferService from "../services/TransferService";
	import BalanceService from "../services/BalanceService";

	export default {
		components:{
			TokenSelector
		},
		data () {return {
			account:null,
			recipient:null,
			token:null,
			pair:null,
			rate:null,
			fiat:0,
			selectingToken:false,
			pairs:[],
			loadingPairs:false,
			loadingRate:false,
			sending:false,
			failedConnection:false,
		}},
		computed:{
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'accounts',
				'displayCurrency',
				'totalBalances',
			]),
			accountTokens(){
				if(!this.account) return [];

				const systemToken = this.account.network().systemToken().uniqueWithChain();
				return this.account.tokens()
					.sort((a,b) => {
						const system = systemToken === b.uniqueWithChain() ? 1
							: systemToken === a.uniqueWithChain() ? -1 : 0;
						return system || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0) || b.amount - a.amount
					})
			},
			selectableTokens(){

				if(this.selectingToken === 'from'){
					return [{
						title:'',
						active:this.token ? this.token.uniqueWithChain() : null,
						handler:id => {
							this.token = this.account.tokens().find(x => x.uniqueWithChain() === id).clone();
							this.token.amount = null;
							this.selectingToken = false;
						},
						tokens:this.accountTokens
							.map(token => {
								const amount = this.account.tokenBalance(token);
								return {
									id:token.uniqueWithChain(),
									name:token.name,
									symbol:token.symbol,
									amount:amount ? this.formatNumber(parseFloat(amount).toFixed(token.decimals), parseInt(amount) < 1000000) : '--',
									token:token.clone(),
									fiat:token.fiatBalance(false),
								}
							}),
					}];
				}

				if(this.selectingToken === 'to'){

					const pairs = this.pairs.reduce((acc,x) => {
						if(!acc.hasOwnProperty(x.type)) acc[x.type] = [];
						acc[x.type].push(x);
						return acc;
					}, {});

					return Object.keys(pairs).map(type => {
						return {
							title:type,
							active:this.pair ? this.pair.id : null,
							handler:id => {
								const pair = this.pairs.find(x => x.id === id);
								this.setPair(pair);
							},
							tokens:pairs[type],
						}
					});
				}

				return [];
			},
			estimatedAmount(){
				if(!this.rate) return 0;
				if(!this.pair) return 0;
				return this.rate.rate * this.token.amount;
			},
			canSend(){
				return !!this.rate && !!this.pair && !this.sending && this.recipient &&
						this.rate.min <= this.estimatedAmount &&
						this.rate.max >= this.estimatedAmount
			}
		},
		created(){


			// TODO: Validity Checking
			this.account = this.accounts.sort((a,b) => b.logins - a.logins)[0] || null;
			const systemTokenUnique = this.account.network().systemToken().uniqueWithChain();
			const token = this.account.network().systemToken().clone();
			token.amount = 0;
			this.token = token;

			this.getPairs();
		},
		methods:{
			back(){
				if(this.selectingToken) return this.selectingToken = false;
				this.$router.back();
			},
			selectAccount(type){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					if(type === 'from'){
						this.account = account;
						BalanceService.loadBalancesFor(account);
						this.token = this.accountTokens.length ? this.accountTokens[0] : null;
					} else {
						this.recipient = account;
					}
					this.changedAmount()
				}, type === 'from', null, type === 'to' && this.pair ? this.pair.blockchain : null));
			},
			setFraction(fraction){
				const balance = parseFloat(this.account.tokenBalance(this.token));
				if(!balance) return 0;
				switch(fraction){
					case '100': this.token.amount = balance; break;
					case '1/2': this.token.amount = balance/2; break;
					case '1/4': this.token.amount = balance/4; break;
				}

				this.token.amount = parseFloat(this.token.amount).toFixed(this.token.decimals);
				this.changedAmount()
			},
			changedFiat(){
				this.token.amount = parseFloat(this.fiat / this.token.fiatPrice(false)).toFixed(this.token.decimals);
			},
			changedAmount(){
				this.fiat = this.token.amount === '' ? '0' : this.token.fiatBalance(false)
			},
			selectToken(id){
				if(this.loadingPairs || this.loadingRate) return;
				if(id === 'to' && (this.pairs.length < 2)) return;
				this.selectingToken = id;
				this.changedAmount()
			},
			setPair(pair){
				this.pair = pair;
				this.selectingToken = false;
				this.recipient = null;
				this.getRate();
			},
			cantConnect(){
				this.failedConnection = true;
				PopupService.push(Popup.snackbar(`Can't connect to Exchange API`));
				this.loadingPairs = false;
			},
			async getPairs(){
				this.pair = null;
				this.pairs = [];
				this.loadingPairs = true;
				let pairs = await ExchangeService.pairs(this.token);
				// TODO: ERROR HANDLING
				console.log('pairs', pairs);
				if(!pairs) {
					this.cantConnect();
				} else {
					pairs = pairs.sort((a,b) => {
						const TOP_PAIRS = ['btc', 'eth', 'eos', 'trx', 'usdt'].map(x => x.toUpperCase());
						return TOP_PAIRS.includes(b.symbol) ? 1 : TOP_PAIRS.includes(a.symbol) ? -1 : 0;
					});
					pairs = pairs.map(pair => {
						const {service, type, id, symbol} = pair;
						return Object.assign({
							name:'',
							symbol:symbol,
							amount:symbol,
							token:symbol,
						}, pair);
					});

					this.pairs = pairs;
				}

				if(!this.pairs.length) {
					this.rate = null;
				}

				if(this.pairs.length === 1){
					this.setPair(this.pairs[0]);
				}

				this.loadingPairs = false;
			},
			async getRate(){
				this.loadingRate = true;
				this.rate = null;
				this.rate = await ExchangeService.rate(this.token, this.pair.id, this.pair.service);
				this.loadingRate = false;
			},
			async send(){
				if(!this.canSend) return;
				this.sending = true;

				const from = { account:this.account.sendable() };
				const to = { account:this.recipient };
				const order = await ExchangeService.order(this.pair.service, this.token, this.pair.symbol, this.token.amount, this.account, to);
				this.sending = false;

				if(!order) {
					this.cantConnect();
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
				PopupService.push(Popup.confirmExchange(accounts, symbols, order, async accepted => {
					if(!accepted) {
						ExchangeService.cancelled(order.id);
						return;
					}

					ExchangeService.accepted(order.id);

					const sent = await TransferService[this.account.blockchain()]({
						account:this.account,
						recipient:order.account,
						amount:order.deposit.toString(),
						memo:order.memo,
						token:this.token,
						promptForSignature:false,
					}).catch(() => false);

					if(sent){
						setTimeout(() => {
							BalanceService.loadBalancesFor(this.account);
						}, 1000);
					}

					console.log('sent', sent);

				}));


			}
		},
		watch:{
			['token.symbol'](){
				this.getPairs();
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";
	@import "../styles/transfer";



</style>