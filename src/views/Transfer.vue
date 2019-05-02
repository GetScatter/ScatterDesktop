<template>
	<section class="transfer">

		<!----------------------->
		<!--------- FROM -------->
		<!----------------------->
		<section class="from" v-if="account && token && toSend">
			<section class="limit-width">
				<label>Sending</label>
				<section class="boxes">
					<section class="box account-selector" @click="selectTokenAndAccount">
						<section>
							<figure class="name">{{account.sendable()}}</figure>
							<figure class="network">{{account.network().name}}</figure>
							<figure class="token">{{token.amount}} {{token.symbol}}</figure>
							<figure class="price">{{token.fiatPrice()}}</figure>
						</section>
						<figure class="chevron icon-dot-3"></figure>
					</section>
					<section class="box">
						<section class="input-container">
							<figure class="label">{{token.symbol}}</figure>
							<input placeholder="0.00" v-on:input="changedAmount" v-model="toSend.amount" class="input" />
						</section>
						<figure class="line"></figure>
						<section class="input-container">
							<figure class="label">USD</figure>
							<input placeholder="0.00" v-if="toSend.fiatPrice()" v-on:input="changedFiat" v-model="fiat" class="input" />
							<figure class="input not-available" v-else>Price not available</figure>
						</section>
					</section>
				</section>
			</section>
		</section>



		<!----------------------->
		<!---------- TO --------->
		<!----------------------->
		<section class="to">
			<section class="limit-width">
				<section class="split-inputs" style="width:calc(50% - 10px);">
					<label style="flex:1;">Recipient</label>
					<Button text="contacts" blue="1" />
				</section>

				<section class="boxes">
					<section class="box">
						<section class="input-container">
							<input placeholder="account name / address" v-model="recipient" class="input" />
						</section>
					</section>
					<section class="box">
						<section class="input-container">
							<input placeholder="optional memo" v-model="memo" class="input" />
						</section>
					</section>
				</section>
			</section>
		</section>


		<section class="tail">
			<Button :disabled="!canSend" big="1" text="Send" blue="1" @click.native="send" />
		</section>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";
	import Token from "../models/Token";
	import BalanceService from "../services/blockchain/BalanceService";
	import TransferService from "../services/blockchain/TransferService";
	import PasswordService from "../services/secure/PasswordService";
	import PriceService from "../services/apis/PriceService";

	export default {
		data(){return {
			account:null,
			recipient:null,
			memo:'',

			token:null,
			toSend:null,
			fiat:0,

			sending:false,
		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
			sendableTokens(){
				return this.account.tokens().filter(x => !x.unusable).sort((a,b) => {
					return Token.sorter(a,b);
				});
			},
			canSend(){
				return !this.sending && this.recipient && this.recipient.length && this.toSend && this.toSend.amount > 0;
			},
		},
		mounted(){
			this.account = this.accounts.filter(x => x.tokens().length)
				.sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance())[0];
			this.setToken(this.sendableTokens[0]);
		},
		methods:{
			selectTokenAndAccount(){
				PopupService.push(Popup.selectTokenAndAccount(result => {
					if(!result) return;
					const {token, account} = result;
					this.account = account;
					this.setToken(token);
				}))
			},
			setToken(token){
				PriceService.setPrices();
				this.token = token.clone();
				this.toSend = token.clone();
				this.toSend.amount = 0;
				this.fiat = 0;
			},
			changedFiat(){
				this.toSend.amount = parseFloat(this.fiat / this.toSend.fiatPrice(false)).toFixed(this.toSend.decimals);
			},
			changedAmount(){
				this.fiat = !this.toSend.amount || this.toSend.amount === '' ? null : this.toSend.fiatBalance(false)
			},
			async send(){
				const reset = () => this.sending = false;
				if(!this.canSend) return;
				this.sending = true;
				PopupService.push(Popup.confirmTransfer(this.account.sendable(), this.recipient, this.toSend, this.memo, async accepted => {
					if(!accepted) return reset();
					if(!await PasswordService.verifyPIN()) return reset();
					this.setWorkingScreen(true);
					const sent = await TransferService[this.account.blockchain()]({
						account:this.account,
						recipient:this.recipient,
						amount:this.token.amount,
						memo:this.memo,
						token:this.token,
						promptForSignature:false,
					}).catch(() => false);
					reset();
					this.setWorkingScreen(false);
					if(sent) BalanceService.loadBalancesFor(this.account);
				}))
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.transfer {
		height:calc(100vh - 220px);
		display:flex;
		flex-direction: column;

		.from {
			flex:1;
			padding:40px;
			background: $lightergrey;
		}

		.to {
			flex:1;
			padding:40px;
		}

		.tail {
			justify-content: center;
			display:flex;
			align-items: center;
			padding:20px 20px;
			border-top:1px solid $lightgrey;
			text-align:center;

			button {
				display:inline-block;
				padding:0 60px;
			}
		}

		.boxes {
			margin-top:20px;
			display:flex;
			justify-content: space-between;

			.box {
				width:calc(50% - 10px);
				background:$white;
				//box-shadow:0 3px 8px $blue-shadow;
				border:1px solid $lightgrey;
				border-radius:$radius;

				&:hover {
					border:1px solid $blue;
				}

				.line {
					width:calc(100%);
					height:2px;
					background:$blue;
				}

				&.account-selector {
					height:105px;
					padding:20px;
					display:flex;
					align-items: center;
					position: relative;
					cursor: pointer;

					.name {
						font-size: $medium;
						font-weight: bold;
						color:$blue;
						margin-bottom:2px;
					}

					.network {
						font-size: $small;
						margin-bottom:10px;

					}

					.token {
						font-size: $medium;
						font-weight: bold;
					}

					.price {
						font-size: $tiny;
						font-weight: bold;
						color:$silver;
					}

					.chevron {
						position:absolute;
						top:0;
						bottom:0;
						right:20px;
						display:flex;
						align-items: center;
						font-size: 24px;
						color:$blue;
					}
				}

				.input-container {
					height:50px;
					display:flex;
					align-items: center;
					padding:10px 20px;

					.label {
						flex:0 0 auto;
						width:50px;
						font-size: $medium;
						font-weight: bold;
					}

					.input {
						flex:1;
						font-size: $medium;
						color:$blue;
						font-weight: bold;
						text-align:left;

						&.not-available {
							color:$grey;
						}
					}

					input {
						height:36px;
						border:0;
						font-size: $medium;
						text-align:left;
						padding:0;
						margin:0;
					}
				}
			}
		}
	}

</style>