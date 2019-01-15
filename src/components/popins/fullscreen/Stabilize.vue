<template>
	<section class="transfer">
		<back-bar v-on:back="back" />

		<TokenSelector v-if="selectingToken" :title="locale(langKeys.GENERIC.SelectToken)" :lists="selectableTokens" />

		<section class="full-panel inner limited" v-if="account && token && !selectingToken">

			<section class="tokens-out">

				<section class="panel">
					<h5>Stabilize</h5>

					<section>
						<section class="box unclickable">
							<section class="row">
								<figure class="fill">
									<div>{{account.network().name}}</div>
									{{account.sendable()}}
								</figure>
							</section>
							<section class="row">
								<figure class="icon" :class="[{'small':token && token.symbol.length >= 4}, token.symbolClass()]">
									<span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
								</figure>
								<figure class="fill">
									<input disabled="true" v-model="clampedAmount || token.amount"
									       :placeholder="parseFloat(1).toFixed(token.decimals)" />
								</figure>
							</section>
							<section class="row unpad">
								<section class="row pad">
									<figure class="icon small">{{displayCurrency}}</figure>
									<input disabled="true" style="flex:1;" class="small" v-model="fiat" placeholder="0.00" />
								</section>
							</section>
						</section>
					</section>

					<section class="disclaimer less-pad">
						Stabilizing tokens allows you to ride out volatile markets by converting your tokens to a stable coin.

						<p>When you destabilize later your tokens will automatically be converted back to the original token.</p>
					</section>

				</section>






				<!-- RIGHT PANEL -->
				<section class="panel">
					<h5>Receive</h5>

					<section>
						<section class="box dark clickable outlined">
							<section class="row" style="height:144px; text-align:center;" @click="selectAccount('to')" v-if="pairAccounts.length">
								<figure class="fill">
									{{recipient && recipient.length ? recipient : 'Select Recipient'}}
								</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
							<section class="row" style="height:144px; text-align:center;" v-else @click="enableBlockchain">
								<figure class="fill" v-if="pair">
									No {{blockchainName(pair.blockchain)}} Account
									<br>
									<b style="font-size: 9px;">Click here to enable {{blockchainName(pair.blockchain)}} for this keypair.</b>
								</figure>
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
								<figure class="icon" :class="{'small':pair && pair.symbol.length >= 4}" v-if="stablePairs.length && pair">{{pair ? pair.symbol : ''}}</figure>
								<figure class="fill">{{stablePairs.length ? pair ? pair.symbol : `Select Stable Coin (${stablePairs.length})` : 'No Stable Coin Pairs'}}</figure>
								<figure class="chevron" :class="{'icon-down-open-big':stablePairs.length > 1, 'icon-lock':pairs.length === 1}" v-if="stablePairs.length"></figure>
								<figure class="chevron icon-cancel" v-if="!stablePairs.length"></figure>
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
				<btn blue="1" text="Stabilize Tokens" v-on:clicked="send" :disabled="!canSend" :loading="sending" />
			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import TokenSelector from '../../../components/panels/TokenSelector';
	import ExchangeService from "../../../services/ExchangeService";
	import Account from "../../../models/Account";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import TransferService from "../../../services/TransferService";
	import BalanceService from "../../../services/BalanceService";
	import HistoricExchange from "../../../models/histories/HistoricExchange";
	import KeyPairService from "../../../services/KeyPairService";

	export default {
		props:['popin'],
		components:{
			TokenSelector
		},
		data () {return {
			account:null,
			recipient:null,
			token:null,
			pair:null,
			rate:null,
			selectingToken:false,
			pairs:[],
			loadingPairs:false,
			loadingRate:false,
			sending:false,
			failedConnection:false,
			stableCoins:[],
		}},
		computed:{
			...mapState([
				'scatter',
				'history'
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
					.filter(x => !x.unusable)
					.sort((a,b) => {
						const system = systemToken === b.uniqueWithChain() ? 1
							: systemToken === a.uniqueWithChain() ? -1 : 0;
						return system || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0) || b.amount - a.amount
					})
			},
			selectableTokens(){

				const pairs = this.stablePairs.reduce((acc,x) => {
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
			},
			estimatedAmount(){
				if(!this.rate) return 0;
				if(!this.pair) return 0;
				return parseFloat(this.rate.rate * this.clampedAmount).toFixed(2);
			},
			canSend(){
				return !!this.rate && !!this.pair && !this.sending && this.recipient &&
						this.rate.min <= this.estimatedAmount &&
						this.rate.max >= this.estimatedAmount && !this.failedConnection
			},
			stablePairs(){
				if(!this.stablePaths || !this.stablePaths.hasOwnProperty('to')) return;
				return this.pairs.filter(x => this.stablePaths.to.includes(x.symbol));
			},
			clampedAmount(){
				if(!this.pair) return 0;
				if(!this.rate) return 0;
				if(this.rate.rate * this.token.amount > this.rate.max) return parseFloat((this.rate.max - 0.01) / this.rate.rate).toFixed(this.token.decimals);
				return this.token.amount;
			},
			fiat(){
				if(!this.clampedAmount) return '';
				const clone = this.token.clone();
				clone.amount = this.clampedAmount;
				return clone.fiatBalance(false);
			},
			pairAccounts(){
				if(!this.pair) return [];
				return this.accounts.filter(x => x.blockchain() === this.pair.blockchain);
			}
		},
		created(){
			setTimeout(async () => {

				this.stablePaths = await ExchangeService.stablePaths();

				const {token, account} = this.popin.data.props;
				const found = this.accounts.filter(x => x.tokens().find(t => t.uniqueWithChain() === token.uniqueWithChain()));
				this.account = account || !found.length
					? account
					: found[0];

				this.token = this.account.tokens().find(x => x.uniqueWithChain() === token.uniqueWithChain()).clone();
				this.token.amount = 10000;
				await this.getPairs();


			}, 1);


		},
		methods:{
			back(){
				if(this.selectingToken) return this.selectingToken = false;
				this.popin.data.callback(true);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			selectAccount(type){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					this.recipient = account;
				}, type === 'from', null, type === 'to' && this.pair ? this.pair.blockchain : null, type === 'from'));
			},
			selectToken(id){
				if(this.loadingPairs || this.loadingRate) return;
				if(id === 'to' && (this.pairs.length < 2)) return;
				this.selectingToken = id;
			},
			setPair(pair){
				this.pair = pair;
				this.selectingToken = false;
				this.recipient = null;
				this.getRate();
			},
			cantConnect(){
				this.failedConnection = true;
				PopupService.push(Popup.prompt(
					"Exchange Error",
					"Can't connect to the Exhange API."
				));
				this.back()
				this.loadingPairs = false;
			},
			async enableBlockchain(){
				const blockchain = this.pair.blockchain;
				const keypair = this.account.keypair();

				if(this.isHardware) return;
				if(this.isRefreshing) return;

				await KeyPairService.addOrRemoveBlockchain(keypair, blockchain);
				await Promise.all(keypair.accounts(true).map(account => {
					return BalanceService.loadBalancesFor(account);
				}));
				this.recipient = keypair.accounts().find(x => x.blockchain() === blockchain);
			},
			async getPairs(){
				this.pair = null;
				this.pairs = [];
				this.loadingPairs = true;
				let pairs = await ExchangeService.pairs(this.token);

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

				if(this.pairs.length > 0){
					this.setPair(this.stablePairs[0]);
				}

				if(this.pairAccounts.length){
					this.recipient = this.pairAccounts[0].sendable();
				}

				this.loadingPairs = false;
				return true;
			},
			async getRate(){
				this.loadingRate = true;
				this.rate = null;
				this.rate = await ExchangeService.rate(this.token, this.pair.id, this.pair.service);
				this.loadingRate = false;
			},
			async send(){
				// if(!this.canSend) return;
				// this.sending = true;
				//
				// const from = { account:this.account.sendable() };
				// const to = { account:this.recipient };
				// const order = await ExchangeService.order(this.pair.service, this.token, this.pair.symbol, this.clampedAmount, this.account, to);
				// this.sending = false;
				//
				// if(!order) {
				// 	this.cantConnect();
				// 	return;
				// }
				//
				//
				// const accounts = {
				// 	from:from.account,
				// 	to:to.account,
				// }
				// const symbols = {
				// 	from:this.token.symbol,
				// 	to:this.pair.symbol
				// }
				// PopupService.push(Popup.confirmExchange(accounts, symbols, order, async accepted => {
				// 	if(!accepted) {
				// 		ExchangeService.cancelled(order.id);
				// 		return;
				// 	}
				//
				// 	ExchangeService.accepted(order.id);
				//
				// 	const sent = await TransferService[this.account.blockchain()]({
				// 		account:this.account,
				// 		recipient:order.account,
				// 		amount:order.deposit.toString(),
				// 		memo:order.memo,
				// 		token:this.token,
				// 		promptForSignature:false,
				// 		bypassHistory:true,
				// 	}).catch(() => false);
				//
				// 	if(sent){
				// 		const history = new HistoricExchange(this.account, this.recipient, this.token, this.pair, order, TransferService.getTransferId(sent, this.token.blockchain));
				// 		this[Actions.DELTA_HISTORY](history);
				//
				// 		setTimeout(() => {
				// 			BalanceService.loadBalancesFor(this.account);
				// 		}, 1000);
				// 	}
				//
				// }));


			},

			...mapActions([
				Actions.DELTA_HISTORY,
				Actions.RELEASE_POPUP,
			])
		},
		watch:{
			['token.symbol'](){
				this.getPairs();
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";
	@import "../../../styles/transfer";



</style>