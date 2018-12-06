<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel inner with-action center-fold limited">
			<section class="head">
				<figure class="icon icon-microchip"></figure>
				<figure class="title">RAM</figure>
				<p>{{account.sendable()}}</p>
			</section>

			<section class="panel-switch">
				<figure class="button" :class="{'active':state === STATES.BUY}" @click="switchState(STATES.BUY)">Buy</figure>
				<figure class="button" :class="{'active':state === STATES.SELL}" @click="switchState(STATES.SELL)">Sell</figure>
			</section>

			<br>
			<section v-if="state === STATES.BUY" class="disclaimer less-pad">
				Buying RAM will let this account hold more data on the blockchain.
			</section>
			<section v-if="state === STATES.SELL" class="disclaimer less-pad">
				Selling RAM reclaims token to that account at the current price of RAM.
			</section>

			<section class="resource-moderator">
				<section class="split-inputs">
					<cin style="width:120px;"
					     :label="quantityLabel"
					     type="number"
					     v-on:changed="x => ram.quantity = x"
					     :text="ram.quantity" />

					<sel style="width:200px;"
					     label="Type"
					     :selected="ram.denom"
					     :options="Object.keys(denom).map(x => denom[x])"
					     v-on:changed="changeRamDenom"></sel>

					<section style="flex:1;"></section>

					<section style="width:200px; align-self: flex-end;">
						<cin v-if="state === STATES.BUY"
						     :label="`Available ${systemToken.symbol}`"
						     :text="parseFloat(balance - (ram.quantity * price)).toFixed(systemToken.decimals)"
						     v-on:changed="" />

						<cin v-if="state === STATES.SELL"
						     :label="`Reclaiming ${systemToken.symbol}`"
						     :text="parseFloat(ram.quantity * price).toFixed(systemToken.decimals)"
						     v-on:changed="" />
					</section>

				</section>

				<slider v-if="state === STATES.BUY" :min="0" :max="balance / price" step="1" :value="ram.quantity" v-on:changed="x => ram.quantity = x"></slider>
				<slider v-if="state === STATES.SELL && accountData" :min="0" :max="availableRam" step="1" :value="ram.quantity" v-on:changed="x => ram.quantity = x"></slider>
			</section>


		</section>
		<section class="action-bar short bottom centered">
			<btn text="Confirm" blue="1" v-on:clicked="buyOrSell" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../popins.scss';
	import {Blockchains} from "../../../models/Blockchains";
	import PluginRepository from "../../../plugins/PluginRepository";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";

	const STATES = {
		BUY:'buy',
		SELL:'sell',
	}

	const denom = {
		BYTES:'Bytes',
		KB:'Kilo-Bytes',
		MB:'Mega-Bytes'
	}

	export default {
		props:['popin'],
		data () {return {
			state:STATES.BUY,
			STATES,

			pricePerByte:0,
			balance:0,

			denom,
			ram:{
				denom:denom.BYTES,
				quantity:0,
			},
		}},
		created(){
			this.init()
		},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'keypairs',
				'accounts',
			]),
			account(){
				return this.accounts.find(x => x.unique() === this.popin.data.props.account.unique());
			},

			systemToken(){
				return this.account.network().systemToken();
			},

			pricePerKB(){
				return (this.pricePerByte * 1024).toFixed(this.systemToken.decimals);
			},
			pricePerMB(){
				return (this.pricePerKB * 1024).toFixed(this.systemToken.decimals);
			},
			price(){
				switch(this.ram.denom){
					case denom.BYTES: return this.pricePerByte;
					case denom.KB: return this.pricePerKB;
					case denom.MB: return this.pricePerMB;
				}
			},
			availableRam(){
				const ram = this.accountData.ram_quota - this.accountData.ram_usage;
				switch(this.ram.denom){
					case denom.BYTES: return ram;
					case denom.KB: return ram / 1024;
					case denom.MB: return (ram / 1024) / 1024;
				}
			},

			quantityLabel(){
				switch(this.state){
					case STATES.BUY: return 'Buying';
					case STATES.SELL: return 'Selling';
				}
			}
		},
		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			buyOrSell(){

				let bytes = 0;
				switch(this.ram.denom){
					case denom.BYTES: bytes = this.ram.quantity; break;
					case denom.KB: bytes = this.ram.quantity * 1024; break;
					case denom.MB: bytes = (this.ram.quantity * 1024) * 1024; break;
				}

				bytes = parseFloat(bytes);
				if(bytes <= 15) return PopupService.push(Popup.snackbar("Bytes must be over 15", 'attention'));

				this.setWorkingScreen(true);

				const isBuying = this.state === STATES.BUY;
				PluginRepository.plugin(Blockchains.EOSIO).buyOrSellRAM(this.account, bytes, this.account.network(), isBuying).then(res => {
					this.setWorkingScreen(false);
					if(!res || !res.hasOwnProperty('transaction_id')) {
						return false;
					}
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, res.transaction_id));
					this.returnResult(res);
				}).catch(err => {
					this.setWorkingScreen(false);
				})

			},

			async init(){
				this.setWorkingScreen(false);
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const network = this.account.network();
				const token = this.systemToken;
				this.balance = await plugin.balanceFor(this.account, token);

				this.pricePerByte = await plugin.getRamPrice(network);

				plugin.accountData(this.account).then(data => {
					this.accountData = data;
				});
			},



			switchState(state){
				this.state = state;
				this.ram.denom = denom.BYTES;
				this.ram.quantity = 0;
			},
			changeRamDenom(denom){
				this.ram.denom = denom;
				this.ram.quantity = 0;
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
		watch:{
			['ram.quantity'](){
				if(!this.ram.quantity.toString().length) this.ram.quantity = 0;
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 250px);
	}

	.resource-moderator {
		.input {
			margin-bottom:0;
		}
	}


</style>
