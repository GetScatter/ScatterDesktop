<template>

	<section class="pop-in">

		<section>
			<section class="head" v-if="account || state === STATES.SELECT_TYPE">
				<figure class="icon font icon-user-add"></figure>
				<figure class="title">Create Account</figure>
			</section>

			<!----------------------------->
			<!------- USING ACCOUNT ------->
			<!----------------------------->
			<section v-if="account">
				<section>
					<Input big="1" :error="accountNameError" :placeholder="locale(langKeys.GENERIC.AccountName)" :text="accountName" v-on:changed="x => accountName = x" />

					<section v-for="item in changeableKeys" class="key-entry">
						<label>{{item.label}}</label>
						<section class="split-inputs">
							<Select truncate="1" v-if="validKeypairs.length" bordered="1" style="flex:0.5; max-width:180px;"
							        :options="validKeypairs"
							        :selected="keys[item.ref] ? keypairFor(keys[item.ref]) ? keypairFor(keys[item.ref]).name : '' : ''"
							        :parser="x => x.name"
							        v-on:selected="x => selectKey(x, item)" />
							<Input style="margin-bottom:0; flex:1;" placeholder="EOS..." :text="keys[item.ref]" v-on:changed="x => keys[item.ref] = x" />
						</section>
					</section>

				</section>

				<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Create Account', blue:true, click:() => createAccount()}]" />
			</section>

			<section v-else>


				<!------------------------------------>
				<!------- SELECT CREATION TYPE ------->
				<!------------------------------------>
				<section class="type-selector" v-if="state === STATES.SELECT_TYPE">
					<br>
					<br>
					<section class="types">
						<section class="type" @click="state = STATES.EXCHANGE">
							<figure class="type-icon icon-globe"></figure>
							<figure class="type-text">Exchange</figure>
							<figure class="type-desc">
								You can send funds from an exchange or another wallet to create your account.
							</figure>
						</section>
						<section class="type disabled">
							<figure class="type-icon"><CreditCard /></figure>
							<figure class="type-text">Credit Card</figure>
							<figure class="type-desc">
								This option is currently disabled while we work on regulatory compliance.
							</figure>
						</section>
					</section>
				</section>


				<!------------------------------------>
				<!------- TYPE SELECTED -------------->
				<!------------------------------------>
				<section class="type-selected" v-if="state !== STATES.SELECT_TYPE">
					<i style="margin-bottom:11px; display:block;" v-if="!accountName.trim().length && !accountNameError">Start typing in a name to see if it is available.</i>
					<Input big="1" centered="1" :error="accountNameError" :placeholder="locale(langKeys.GENERIC.AccountName)" :text="accountName" v-on:changed="x => accountName = x" />


					<!------------------------------------>
					<!------- USING EXCHANGE ------------->
					<!------------------------------------>

					<section v-if="state === STATES.EXCHANGE">
						<section class="send-memo" v-if="canUseExchange">
							<u>send</u> <b class="large">{{minimumPrice}} {{systemSymbol}}</b> <u>to</u> <b class="large">makeaccounts</b>
							<br>
							<br>
							<br>

							<b class="red">Make sure you include this memo when you send it or your funds will be lost!</b>
							<figure class="memo">
								<b>{{exchangeMemo}}</b>
								<b class="copy icon-docs" @click="copyExchangeMemo">Copy</b>
							</figure>
						</section>
					</section>
				</section>

				<ActionBar :buttons-left="noAccountButtonsLeft" :buttons-right="noAccountButtonsRight" />
			</section>

		</section>

	</section>



</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {Blockchains} from "@walletpack/core/models/Blockchains";
	import PluginRepository from "@walletpack/core/plugins/PluginRepository";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import AccountService from "@walletpack/core/services/blockchain/AccountService";
	import Account from "@walletpack/core/models/Account";
	import Keypair from "@walletpack/core/models/Keypair";
	import Exchange from '../../svgs/quick-actions/Exchange'
	import CreditCard from '../../svgs/CreditCard'
	import * as UIActions from "../../../store/ui_actions";


	const STATES = {
		SELECT_TYPE:'selectType',
		ACCOUNT:'account',
		EXCHANGE:'exchange',
		CREDIT_CARD:'creditCard',
	}

	let accountTimeout;

	export default {
		props:['popin'],
		components:{Exchange, CreditCard},
		data () {return {

			accountName:'',
			accountNameError:'',
			eosToUse:'1.0000',
			resourceError:null,
			ramPrice:null,

			transactionId:'',

			keys:{
				owner:'',
				active:'',
			},

			state:STATES.SELECT_TYPE,
			STATES,
		}},

		mounted(){
			if(this.account) this.keys.owner = this.keys.active = this.account.publicKey;
			this.getRamPrice();
		},

		computed:{
			...mapState([
				'balances'
			]),
			...mapGetters([
				'keypairs',
				'accounts',
				'networks',
			]),
			validKeypairs(){
				return this.keypairs.filter(x => x.blockchains.includes(Blockchains.EOSIO))
			},
			canUseExchange(){
				return this.accountName.length === 12 && !this.accountNameError
			},
			noAccountButtonsLeft(){
				if(this.state === STATES.SELECT_TYPE) return [{text:'Cancel', click:() => this.returnResult(false)}];
				return [{text:'Back', click:() => this.state = STATES.SELECT_TYPE}];
			},
			noAccountButtonsRight(){
				if(this.state === STATES.EXCHANGE && this.canUseExchange) return [{text:'Click after Transfer', blue:true, click:() => this.findExchangeAccount()}];
				return [];
			},
			changeableKeys(){
				return [{
					label:'Owner/Master Key',
					ref:'owner',
				}, {
					label:'Active/Daily Key',
					ref:'active',
				}]
			},

			account(){
				return this.popin.data.props.account instanceof Account ? this.popin.data.props.account : null;
			},
			keypair(){
				return this.popin.data.props.account instanceof Keypair ? this.popin.data.props.account : null;
			},
			availableAccounts(){
				return this.accounts.filter(x => x.network().chainId === this.network.chainId);
			},
			network(){
				const endorsed = PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork();
				return this.account ? this.account.network() : this.networks.find(x => x.chainId === endorsed.chainId) || endorsed;
			},
			decimals(){
				return this.network.systemToken().decimals;
			},
			minimumPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : '1.0000') + 0.5).toFixed(this.decimals);
			},
			totalPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : 0) + parseFloat(this.eosToUse ? this.eosToUse : 0)).toFixed(this.decimals);
			},
			systemSymbol(){
				return this.network.systemToken().symbol
			},
			exchangeMemo(){
				return `${this.keypair.enabledKey().key},${this.accountName}`
			}
		},

		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[UIActions.RELEASE_POPUP](this.popin);
			},
			selectKey(key, item){
				this.keys[item.ref] = this.publicKeyForKeypair(key);
			},
			keypairFor(publicKey){
				return this.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey));
			},
			copyExchangeMemo(){
				this.copyText(this.exchangeMemo);
			},

			findExchangeAccount(){
				const accountName = this.accountName;
				const network = this.network.clone();
				const keypair = this.keypair;
				let timeout = 0;

				PopupService.push(Popup.prompt(
					"Looking for account",
					"Scatter will continuously look for the account being created for the next 30 minutes. Once it is found it will automatically be added to your Scatter."
				));

				const findUntilFoundOrTimedOut = async () => {
					timeout++;
					if(timeout >= 60){
						// 30 minutes have passed
						PopupService.push(Popup.prompt(
							"Exchange account creation error.",
							"30 minutes have passed since you sent money from your exchange. It looks like an account still hasn't been created. You should check the status of the transaction in the exchange."
						))
					}

					const plugin = PluginRepository.plugin(Blockchains.EOSIO);
					const account = await plugin.accountData(null, network, accountName);

					if(account && account.hasOwnProperty('account_name') && account.account_name === accountName){
						await AccountService.importAllAccounts(this.keypair);
						PopupService.push(Popup.prompt(
							"Account found!",
							"Scatter found the account you created using an exchange. You can now see it in your wallet."
						));
						return true;
					}

					setTimeout(() => {
						findUntilFoundOrTimedOut();
					}, 1000 * 30);
				}

				findUntilFoundOrTimedOut();
				this.returnResult(true);
			},

			async getRamPrice(){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const ramPrice = await plugin.getRamPrice(this.network);
				this.ramPrice = (ramPrice * 4096).toFixed(this.decimals);
			},

			finishedAccountCreation(tx){
				setTimeout(async () => {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, tx));
					const owner = this.keypairs.find(x => x.publicKeys.find(y => y.key === this.keys.owner));
					const active = this.keypairs.find(x => x.publicKeys.find(y => y.key === this.keys.active));

					if(owner && (!active || active.id !== owner.id)) await AccountService.importAllAccounts(owner, false, [Blockchains.EOSIO], [this.account.network()]);
					if(active) await AccountService.importAllAccounts(active, false, [Blockchains.EOSIO], [this.account.network()]);

					setTimeout(() => {
						if(owner || active){
							const account = this.accounts.find(x => x.sendable() === this.accountName);
							if(account) this.$router.push({name:this.RouteNames.ACCOUNT, params:{unique:account.unique()}});
						}

						this.returnResult(true);
						this.setWorkingScreen(false);
					}, 500);
				}, 500);
			},

			async createAccount(){
				this.resourceError = null;

				if(this.accountNameError) return;
				if(this.resourceError) return;

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				this.eosToUse = parseFloat(this.eosToUse).toFixed(this.decimals);

				this.setWorkingScreen(true);

				plugin.createAccount(
					this.account,
					this.accountName,
					this.keys.owner,
					this.keys.active,
					this.eosToUse
				)
					.then(tx => this.finishedAccountCreation(tx))
					.catch(error => {
						this.setWorkingScreen(false);
						console.error('error', error);
					});
			},

			async checkAccountName(){
				clearTimeout(accountTimeout);
				accountTimeout = setTimeout(async () => {
					this.accountName = this.accountName.trim().toLowerCase();
					if(!this.accountName.length) return this.accountNameError = '';
					if(this.accountName.length !== 12) return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.AccountNameLengthError) + ` - ${this.accountName.length}/12`;
					if(this.accountName.split('').filter(x => isNaN(x)).find(x => x.toUpperCase() === x))
						return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.AccountNameFormattingError);

					if(!PluginRepository.plugin(Blockchains.EOSIO).isValidRecipient(this.accountName)){
						return this.accountNameError = 'only a-z, 1-5';
					}

					this.accountNameError = this.locale(this.langKeys.CREATE_EOS.CheckingNameAlert);

					const plugin = PluginRepository.plugin(Blockchains.EOSIO);
					const acc = await plugin.accountData(null, this.network, this.accountName);
					if(acc.hasOwnProperty('code') && acc.code === 500) this.accountNameError = null;
					else this.accountNameError = this.locale(this.langKeys.CREATE_EOS.NameTakenAlert);
				}, 10);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},

		watch:{
			['accountName'](){
				this.checkAccountName();
			},
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.split-inputs {
		text-align:left;
	}

	.key-entry {
		min-width:500px;

		&:not(:last-child){
			margin-bottom:20px;
		}
	}

	.type-selected {
		min-width:500px;
	}

	.send-memo {
		font-size: $large;
		max-width:500px;
		margin:0 auto;
		text-align:center;

		u {
			padding:0 5px;
		}

		b {
			&.large {
				font-size: 20px;
			}

			&.red {
				color:$red;
				font-size: $medium;
				text-decoration: underline;
			}
		}

		i {
			display:block;
			margin-top:30px;
			font-size: $small;
			font-weight: 800;
		}

		.memo {
			border-radius:$radius;
			background:$red;
			border:1px solid #d30606;
			color:$white;
			padding:5px 5px 5px 10px;
			margin-top:3px;
			font-size: $small;
			display:flex;
			justify-content: space-between;
			align-items: center;

			.copy {
				background:$white;
				color:$black;
				padding:5px 10px;
				border-radius:$radius;
				cursor: pointer;
				border:1px solid #d30606;
			}
		}
	}

</style>