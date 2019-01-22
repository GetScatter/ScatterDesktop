<template>
	<section class="transfer">
		<back-bar v-on:back="back" :buttons="[{text:locale(langKeys.GENERIC.History), clicked:() => openHistory()}]" />

		<TokenSelector v-if="selectingToken" :title="locale(langKeys.GENERIC.SelectToken)" :lists="selectableTokens" />

		<section class="full-panel inner limited" v-if="account && token && !selectingToken">

			<section class="tokens-out">

				<section class="panel">
					<h5>{{locale(langKeys.EXCHANGE.Exchanging)}}</h5>

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
						</section>
					</section>

					<section style="max-height: 100px;">
						<section class="box" :class="{'unclickable':loadingPairs || loadingRate, 'clickable':flatPairs.length}">
							<section class="row" v-if="loadingPairs">
								<figure class="fill">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
							</section>
							<section class="row clickable" v-else @click="selectToken('from')">
								<figure class="icon" :class="[{'small':token && token.symbol.length >= 4}, token.symbolClass()]">
									<span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
								</figure>
								<figure class="fill">{{token.name}}</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
							
							<section class="row highlighted">
								<figure class="icon">{{token.truncatedSymbol()}}</figure>
								<figure class="fill">
									<input style="flex:1;" v-model="token.amount" v-on:input="changedAmount"
									       :placeholder="parseFloat(1).toFixed(token.decimals)" />
								</figure>
							</section>

							<section class="row unpad">
								<section class="row pad">
									<figure class="icon">{{displayCurrency}}</figure>
									<input style="flex:1;" v-model="fiat" v-on:input="changedFiat" placeholder="0.00" />
								</section>
							</section>

						</section>

						<section class="box no-box row unpad">
							<figure class="fill no-pad">
								<section class="row unpad" style="width:50%;">
									<div class="fraction clickable" @click="setFraction('100')">100%</div>
									<div class="fraction clickable" @click="setFraction('50')">50%</div>
									<div class="fraction clickable" @click="setFraction('25')">25%</div>
								</section>
							</figure>
						</section>

					</section>

				</section>






				<!-- RIGHT PANEL -->
				<section class="panel">
					<h5>{{locale(langKeys.EXCHANGE.Receiving)}}</h5>

					<section>
						<section class="box dark">
							<section class="row" v-if="loadingPairs">
								<figure class="fill" style="flex:0 0 auto; padding-right:20px;">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
								<figure class="fill">{{locale(langKeys.EXCHANGE.FetchingPairs)}}</figure>
							</section>
							<section class="row clickable" v-else @click="selectToken('to')">
								<figure class="icon" v-if="pair" :class="[{'small':pair && pair.token.symbol.length >= 4}, pair.token.symbolClass()]">
									<span v-if="!pair.token.symbolClass()">{{pair.token.truncatedSymbol()}}</span>
								</figure>
								<figure class="fill">{{flatPairs.length ? pair ? pair.symbol : `${locale(langKeys.EXCHANGE.SelectPair)} (${flatPairs.length})` : 'No Available Pairs'}}</figure>
								<figure class="chevron" :class="{'icon-down-open-big':flatPairs.length > 1, 'icon-lock':flatPairs.length === 1}" v-if="flatPairs.length"></figure>
								<figure class="chevron icon-cancel" v-if="!flatPairs.length"></figure>
							</section>
							<section class="row" v-if="loadingRate || !rate">
								<figure class="fill" style="flex:0 0 auto; padding-right:20px;" v-if="loadingRate">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
								<figure class="fill" v-if="loadingRate">{{locale(langKeys.EXCHANGE.FetchingRate)}}</figure>
								<figure class="fill" v-else>{{locale(langKeys.EXCHANGE.NoRates)}}</figure>
							</section>
							<section class="row" v-else>
								<figure class="fill">
									<input v-model="estimatedAmount" :class="{'bad':rate && rate.max && (estimatedAmount > rate.max || estimatedAmount < rate.min)}" :disabled="true" />
								</figure>
							</section>
							<section class="row unpad">
								<section class="row pad">
									<figure class="icon small" style="width:auto;">{{locale(langKeys.EXCHANGE.Min)}}</figure>
									<div class="small" style="flex:0 0 auto;" :class="{'bad':rate && rate.min && (rate.min > estimatedAmount)}">{{rate && rate.min ? rate.min : '--'}}</div>
									<figure class="icon small" style="margin-left:50px; width:auto;">{{locale(langKeys.EXCHANGE.Max)}}</figure>
									<div class="small" style="flex:0 0 auto;" :class="{'bad':rate && rate.max && (rate.max < estimatedAmount)}">{{rate && rate.max ? rate.max : '--'}}</div>
								</section>
							</section>
						</section>
					</section>

					<h5 v-if="pair">{{locale(langKeys.EXCHANGE.To)}}</h5>

					<section>
						<Recipient v-if="pair" :account="account"
						           :recipient="recipient"
						           v-on:change="x => recipient = x"
						           v-on:select="selectAccount" />
					</section>
				</section>

			</section>


			<section class="action-bar short bottom centered">
				<btn blue="1" :text="locale(langKeys.EXCHANGE.ExchangeButton)" v-on:clicked="send" :disabled="!canSend" :loading="sending" />
			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import TokenSelector from '../../../components/panels/TokenSelector';
	import Recipient from '../../../components/panels/transfer/Recipient';
	import ExchangeService from "../../../services/ExchangeService";
	import PluginRepository from "../../../plugins/PluginRepository";
	import Account from "../../../models/Account";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import TransferService from "../../../services/TransferService";
	import BalanceService from "../../../services/BalanceService";
	import HistoricExchange from "../../../models/histories/HistoricExchange";
	import ObjectHelpers from "../../../util/ObjectHelpers";
	import TokenService from "../../../services/TokenService";

	export default {
		props:['popin'],
		components:{
			TokenSelector,
			Recipient
		},
		data () {return {
			account:null,
			recipient:null,
			token:null,
			pair:null,
			rate:null,
			fiat:null,
			selectingToken:false,
			pairs:{},
			loadingPairs:false,
			loadingRate:false,
			sending:false,
			failedConnection:false,
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
			isValidRecipient(){
				if(!this.pair) return true;
				const plugin = PluginRepository.plugin(this.pair.blockchain);
				if(!plugin) return true;
				return plugin.isValidRecipient(this.recipient);
			},
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

				if(this.selectingToken === 'from'){
					if(!this.account) return [];
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


					// TODO: Localize
					const titleFormatter = (title, pair) => {
						switch(title){
							case 'base': return `Base Tokens (${pair.type})`;
							case 'stable': return `Stable Coins (${pair.type})`;
							default: return `${this.blockchainName(title)} (${pair.type})`;
						}
					}

					return Object.keys(this.pairs).map(title => {
						if(!this.pairs[title][0]) return;
						return {
							title:titleFormatter(title, this.pairs[title][0]),
							active:this.pair ? this.pair.id : null,
							handler:id => {
								const pair = this.flatPairs.find(x => x.id === id);
								this.setPair(pair);
							},
							tokens:this.pairs[title].map(x => Object.assign(Object.assign(x, x.token), {
								meta:{
									sub:this.blockchainName(x.token.blockchain),
									title:x.token.name,

								}
							})),
						}
					}).filter(x => !!x);
				}

				return [];
			},
			estimatedAmount(){
				if(!this.rate) return 0;
				if(!this.pair) return 0;
				return parseFloat(this.rate.rate * this.token.amount).toFixed(this.pair.token.decimals);
			},
			canSend(){
				return !!this.rate &&
					!!this.pair &&
					!this.sending &&
					this.recipient &&
					this.token.amount > 0 &&
					(this.rate.min === null || this.rate.min <= this.estimatedAmount) &&
					(this.rate.max === null || this.rate.max >= this.estimatedAmount) &&
					!this.failedConnection
			},
			flatPairs(){
				return Object.keys(this.pairs).reduce((acc,key) => {
					this.pairs[key].map(x => acc.push(x));
					return acc;
				}, []);
			}
		},
		created(){
			setTimeout(async () => {

				let {history, token, account} = this.popin.data.props;
				if(history){
					history = this.history.find(x => x.id === history);
					this.account = history.from;
					this.token = history.fromToken.clone();
					await this.getPairs();
					this.recipient = history.to;
					this.pair = history.toToken;
					this.changedAmount();
					this.getRate();
				}

				else if (token){
					const found = this.accounts.filter(x => x.tokens().find(t => t.uniqueWithChain() === token.uniqueWithChain()));
					this.account = account || !found.length
						? account
						: found[0];

					token.amount = null;
					this.token = token;
					await this.getPairs();
				}

				else {
					this.account = this.accounts.filter(x => x.authority !== 'watch').sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance())[0] || null;
					const token = this.account.network().systemToken().clone();
					token.amount = null;
					this.token = token;
					await this.getPairs();
				}
			}, 1);

		},
		methods:{
			back(){
				if(this.selectingToken) return this.selectingToken = false;
				this.popin.data.callback(true);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			openHistory(){
				PopupService.push(Popup.history('exchange', () => {}));
			},
			selectAccount(type){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					if(type === 'from'){
						this.account = account;
						BalanceService.loadBalancesFor(account);
						if(this.accountTokens.length){
							this.token = this.accountTokens[0].clone();
							this.token.amount = null;
						}
						if(this.recipient === account.sendable()) this.recipient = '';
					} else {
						this.recipient = account;
					}
					this.changedAmount()
				}, type === 'from', null, type === 'to' && this.pair ? this.pair.blockchain : null, type === 'from'));
			},
			setFraction(fraction){
				const balance = parseFloat(this.account.tokenBalance(this.token));
				if(!balance) return 0;
				switch(fraction){
					case '100': this.token.amount = balance; break;
					case '50': this.token.amount = balance/2; break;
					case '25': this.token.amount = balance/4; break;
				}

				this.token.amount = parseFloat(this.token.amount).toFixed(this.token.decimals);
				this.changedAmount()
			},
			changedFiat(){
				this.token.amount = parseFloat(this.fiat / this.token.fiatPrice(false)).toFixed(this.token.decimals);
			},
			changedAmount(){
				this.fiat = !this.token.amount || this.token.amount === '' ? null : this.token.fiatBalance(false)
			},
			selectToken(id){
				if(this.loadingPairs || this.loadingRate) return;
				// if(id === 'to' && (this.pairs.length < 2)) return;
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
				PopupService.push(Popup.prompt(
					this.locale(this.langKeys.EXCHANGE.ExchangeError),
					this.locale(this.langKeys.EXCHANGE.CantConnect)
				));
				this.back()
				this.loadingPairs = false;
			},
			async getPairs(){
				this.pair = null;
				this.pairs = {};
				this.loadingPairs = true;
				let pairs = await ExchangeService.pairs(this.token);
				const {base, stable, eth, eos, trx} = pairs;

				if(!pairs) {
					this.cantConnect();
				} else {

					Object.keys(pairs).map(type => {
						pairs[type] = pairs[type].sort((a,b) => b.token.symbolClass() ? 1 : a.token.symbolClass() ? -1 : 0)
					});

					this.pairs = pairs;
				}

				const allPairs = Object.keys(pairs).reduce((acc,key) => {
					this.pairs[key].map(x => acc.push(x));
					return acc;
				}, []);
				if(!allPairs.length) {
					this.rate = null;
				}

				if(allPairs.length === 1){
					this.setPair(allPairs[0]);
				}

				this.loadingPairs = false;
				return true;
			},
			async getRate(){
				this.loadingRate = true;
				this.rate = null;
				this.rate = await ExchangeService.rate(this.token, this.pair.symbol, this.pair.service);
				this.loadingRate = false;
			},
			async send(){
				if(!this.canSend) return;
				this.sending = true;

				const from = { account:this.account.sendable() };
				const to = { account:this.recipient };
				const order = await ExchangeService.order(this.pair.service, this.token, this.pair.symbol, this.token.amount, from, to);

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
				PopupService.push(Popup.confirmExchange(accounts, symbols, order, async accepted => {
					if(!accepted) {
						ExchangeService.cancelled(order.id);
						this.sending = false;
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
						bypassHistory:true,
					}).catch(() => false);

					if(sent){
						if(!TokenService.hasToken(this.pair.token)){
							if(!!this.pair.token.contract && !!this.pair.token.contract.length) {
								await TokenService.addToken(this.pair.token, false, false);
							}
						}



						const history = new HistoricExchange(this.account, this.recipient, this.token, this.pair, order, TransferService.getTransferId(sent, this.token.blockchain));
						this[Actions.DELTA_HISTORY](history);

						setTimeout(() => {
							ExchangeService.watch(history);
							BalanceService.loadBalancesFor(this.account);
						}, 1000);
					}
					this.sending = false;

				}));


			},

			...mapActions([
				Actions.DELTA_HISTORY,
				Actions.RELEASE_POPUP
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