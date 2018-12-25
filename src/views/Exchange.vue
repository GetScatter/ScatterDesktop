<template>
	<section>
		<back-bar v-on:back="back" />

		<TokenSelector v-if="selectingToken" title="Select Token" :lists="selectableTokens" />

		<section class="full-panel inner limited" v-if="!selectingToken">
			<section class="tokens-out">

				<section class="panel">
					<h5>Exchange</h5>

					<section style="max-height: 100px;">
						<section class="box" :class="{'unclickable':loadingPairs || loadingRate || !pairs.length, 'clickable':pairs.length}" @click="selectToken('from')">
							<section class="row" v-if="loadingPairs">
								<figure class="fill">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
							</section>
							<section class="row" v-else>
								<figure class="icon">{{token.symbol.length > 4 ? token.symbol[0] : token.symbol}}</figure>
								<figure class="fill">{{token.name}}</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
						</section>
					</section>

					<section>
						<label>From</label>
						<section class="box">
							<section class="row clickable">
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


					<section>
						<label>Exchanging</label>
						<section class="box clickable">
							<section class="row">
								<figure class="icon">{{token.symbol}}</figure>
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

					<section style="max-height: 100px;">
						<section class="box dark" :class="{'outlined unclickable':loadingPairs || loadingRate || !pairs.length, 'clickable':pairs.length}" @click="selectToken('to')">
							<section class="row" v-if="loadingPairs">
								<figure class="fill" style="flex:0 0 auto; padding-right:20px;">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
								<figure class="fill">Fetching Pairs</figure>
							</section>
							<section class="row" v-else>
								<figure class="icon" :class="{'small':pair && pair.length >= 4}" v-if="pairs.length && pair">{{pair ? pair : ''}}</figure>
								<figure class="fill">{{pairs.length ? pair ? pair : `Select Pair (${pairs.length})` : 'No Available Pairs'}}</figure>
								<figure class="chevron icon-down-open-big" v-if="pairs.length"></figure>
								<figure class="chevron icon-cancel" v-if="!pairs.length"></figure>
							</section>
						</section>
					</section>

					<section>
						<label>Recipient</label>
						<section class="box dark clickable outlined">
							<section class="row" style="height:150px; text-align:center;">
								<figure class="fill">
									<div>EOS Mainnet</div>
									scatterfunds
								</figure>
								<figure class="chevron icon-down-open-big"></figure>
							</section>
						</section>
					</section>

					<section>
						<label>Estimated Exchange Rate</label>
						<section class="box dark" :class="{'outlined unclickable':loadingPairs || loadingRate || !pairs.length}">
							<section class="row" v-if="loadingRate">
								<figure class="fill" style="flex:0 0 auto; padding-right:20px;">
									<b class="icon-spin4 animate-spin"></b>
								</figure>
								<figure class="fill">Fetching Rate</figure>
							</section>
							<section class="row" v-else>
								<figure class="icon" :class="{'small':pair && pair.length >= 4}">{{pair ? pair : '--'}}</figure>
								<figure class="fill">
									<input v-model="estimatedAmount" :class="{'bad':rate && (estimatedAmount > rate.limitMaxDestinationCoin || estimatedAmount < rate.limitMinDestinationCoin)}" :disabled="true" />
								</figure>
							</section>
							<section class="row unpad">
								<section class="row pad">
									<figure class="icon small" style="width:auto;">MIN</figure>
									<div class="small" style="flex:0 0 auto;" :class="{'bad':rate && rate.limitMinDestinationCoin > estimatedAmount}">{{rate ? rate.limitMinDestinationCoin : '--'}}</div>
									<figure class="icon small" style="margin-left:50px; width:auto;">MAX</figure>
									<div class="small" style="flex:0 0 auto;" :class="{'bad':rate && rate.limitMaxDestinationCoin < estimatedAmount}">{{rate ? rate.limitMaxDestinationCoin : '--'}}</div>
								</section>
							</section>
						</section>
					</section>
				</section>

			</section>


			<section class="action-bar short bottom centered">
				<btn blue="1" text="Exchange Tokens" v-on:clicked="send" />
			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import TokenSelector from '../components/panels/TokenSelector';
	import ExchangeService from "../services/ExchangeService";

	export default {
		components:{
			TokenSelector
		},
		data () {return {
			account:null,
			token:null,
			pair:null,
			rate:null,
			fiat:0,
			selectingToken:false,
			pairs:[],
			loadingPairs:false,
			loadingRate:false,
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
			selectableTokens(){

				const systemToken = this.account.network().systemToken().uniqueWithChain()

				if(this.selectingToken === 'from'){
					const tokens = this.account.tokens()
						.sort((a,b) => {
							const system = systemToken === b.uniqueWithChain() ? 1
								: systemToken === a.uniqueWithChain() ? -1 : 0;
							return system || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0) || b.amount - a.amount
						})
						.map(token => {
						const amount = this.account.tokenBalance(token);
						return {
							id:token.uniqueWithChain(),
							name:token.name,
							symbol:token.symbol,
							amount:amount ? this.formatNumber(parseFloat(amount).toFixed(2), parseInt(amount) < 1000000) : '--',
							token:token.clone(),
							fiat:token.fiatBalance(false),
						}
					});
					return [{
						title:'',
						active:this.token.uniqueWithChain(),
						handler:token => {
							this.token = token;
							this.selectingToken = false;
						},
						tokens,
					}];
				}

				if(this.selectingToken === 'to'){

					return [{
						title:'',
						active:this.pair,
						handler:symbol => {
							this.pair = symbol.toUpperCase();
							this.selectingToken = false;
							this.getRate();
						},
						tokens:this.pairs,
					}];
				}

				return [];
			},
			estimatedAmount(){
				if(!this.rate) return 0;
				return this.rate.rate * this.token.amount;
			},
			estimatedValue(){
				if(!this.rate) return 0;
				return parseFloat((this.rate.rate * this.token.amount) * this.token.fiatPrice(false)).toFixed(2);
			},
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
				if(id === 'to' && !this.pairs.length) return;
				this.selectingToken = id;
			},
			async getPairs(){
				this.pair = null;
				this.loadingPairs = true;
				let pairs = await ExchangeService.pairs(this.token);
				// TODO: ERROR HANDLING
				pairs = pairs.sort((a,b) => {
					const TOP_PAIRS = ['btc', 'eth', 'eos', 'trx', 'usdt'].map(x => x.toUpperCase());
					return TOP_PAIRS.includes(b) ? 1 : TOP_PAIRS.includes(a) ? -1 : 0;
				});
				pairs = pairs.map(other => {
					return {
						id:other,
						name:'',
						symbol:other,
						amount:other,
						token:other,
					}
				});

				this.pairs = pairs;

				if(!this.pairs.length) {
					this.rate = null;
				}

				this.loadingPairs = false;
			},
			async getRate(){
				this.loadingRate = true;
				this.rate = null;
				this.rate = await ExchangeService.rate(this.token, this.pair);
				this.loadingRate = false;
			},
			send(){

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
	@import "../_variables";

	.full-panel {
		min-height:calc(100vh - 250px);
		display:flex;
		flex-direction: column;

		&.limited {
			overflow-x:hidden;
		}
	}

	.tokens-out {
		display:flex;
		flex:1;
		height:0;

		$border:#dfe0e1;


		.panel {
			flex:1;
			position:relative;
			padding:40px;
			display: flex;
			flex-direction: column;
			min-height:550px;

			> section {
				flex:1 1 auto;
				max-height:200px;
			}

			.clickable {
				cursor: pointer;
			}

			.unclickable {
				cursor: not-allowed;
			}

			.box {
				border:1px solid $border;
				border-radius:4px;
				display:flex;
				flex-direction: column;

				.row {
					display:flex;
					align-items: center;
					position:relative;
					padding:20px;

					input {
						border:0;
						outline:0;
						width:100%;
						height:40px;
						font-size: 22px;
						background:transparent;

						&:disabled {
							cursor: inherit;
						}

						&.small {
							font-size: 11px;
							height:14px;
						}

						&.bad {
							color:yellow;
						}
					}

					div {
						&.small {
							font-size: 11px;
							height:14px;

							&.bad {
								color:yellow;
							}
						}
					}

					.fraction {
						margin-right:20px;
						color:rgba(0,0,0,0.4);

						&:hover {
							color:$primary;
						}
					}

					.fill {
						flex:1;
						font-size: 22px;

						div {
							font-size: 11px;
							font-weight: bold;
						}

						&.darker {
							background:rgba(0,0,0,0.05);
						}

						&.pad {
							padding:10px 20px;
						}
					}

					.icon {
						margin-right:20px;
						width:40px;

						&.small {
							font-size: 11px;
							font-weight: bold;
						}
					}

					.chevron {
						font-size: 18px;

						&.icon-cancel {
							color:red;
							font-size: 26px;
							line-height:0;
						}
					}

					&.unpad {
						padding:0;
					}

					&.pad {
						padding:10px 20px;
					}

					&:not(:first-child){
						border-top:1px solid $border;
					}
				}


				&.dark {
					border:0;
					background: $blue-grad;

					&.outlined {
						background:transparent;
						/*border:1px solid rgba(255,255,255,0.2);*/
						box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2);

						.chevron {
							align-self: flex-start;
						}
					}

					input {
						color:#fff;
					}

					.row {
						&:not(:first-child){
							border-top:1px solid rgba(255,255,255,0.1);
						}
					}
				}


			}

			&:nth-child(2){
				background:$reverse-gradient;
				color:#fff;

				&:before {
					content:'';
					display:block;
					position:fixed;
					right:0;
					top:170px;
					bottom:80px;
					width:40%;
					z-index:-1;

					background:$reverse-gradient;
				}

				&:after {
					content:'';
					display:block;
					position:absolute;
					top:calc(50% - 7px);
					bottom:0;
					left:0;

					$arrow:15px;
					width: 0;
					height: 0;
					border-top: $arrow solid transparent;
					border-bottom: $arrow solid transparent;

					border-left: $arrow solid #fff;
				}
			}
		}
	}

</style>