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
							        :selected="item.ref ? keypairFor(item.ref) ? keypairFor(item.ref).name : '' : ''"
							        :parser="x => x.name"
							        v-on:selected="x => item.ref = publicKeyForKeypair(x)" />
							<Input style="margin-bottom:0; flex:1;" placeholder="EOS..." :text="item.ref" v-on:changed="x => item.ref = x" />
						</section>
					</section>

				</section>

				<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Create Account', blue:true, click:() => createAccount()}]" />
			</section>

			<!------------------------------------>
			<!------- SELECT CREATION TYPE ------->
			<!------------------------------------>
			<section v-else>
				<br>
				<br>
				<section class="type-selector" v-if="state === STATES.SELECT_TYPE">
					<section class="types">
						<section class="type" @click="state = STATES.EXCHANGE">
							<figure class="type-icon icon-globe"></figure>
							<figure class="type-text">Send Funds</figure>
						</section>
						<section class="type disabled">
							<figure class="type-icon"><CreditCard /></figure>
							<figure class="type-text">Credit Card</figure>
						</section>
					</section>
				</section>

				<!------------------------------------>
				<!------- USING EXCHANGE ------->
				<!------------------------------------>
				<section class="using-exchange" v-if="state === STATES.EXCHANGE">
					<i v-if="!accountName.length && !accountNameError">Start typing in a name to see if it is available.</i>
					<Input big="1" :error="accountNameError" :placeholder="locale(langKeys.GENERIC.AccountName)" :text="accountName" v-on:changed="x => accountName = x" />

					<section class="send-memo" v-if="accountName.length === 12 && !accountNameError">
						<u>send</u> <b class="large">{{minimumPrice}} {{systemSymbol}}</b> <u>to</u> <b class="large">createbridge</b>
						<br>
						<br>
						<br>

						<b class="red">Make sure you include this memo when you send it or your funds will be lost!</b>
						<figure class="memo">
							<b>{{exchangeMemo}}</b>
							<b class="copy icon-docs" @click="copyExchangeMemo">Copy</b>
						</figure>

						<i><u>DO NOT</u> send large amounts of {{systemSymbol}} to createbridge. Only send the required {{minimumPrice}} {{systemSymbol}} to create the account. Once your new <u>{{accountName}}</u> account is created, you can send <u>that</u> account {{systemSymbol}}.</i>
					</section>
				</section>

				<ActionBar :buttons-left="noAccountButtons" />
			</section>

		</section>

	</section>



</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import {Blockchains} from "../../../models/Blockchains";
	import PluginRepository from "../../../plugins/PluginRepository";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import AccountService from "../../../services/blockchain/AccountService";
	import EosAccountService from "../../../services/blockchain/EosAccountService";
	import Account from "../../../models/Account";
	import Keypair from "../../../models/Keypair";
	import Exchange from '../../svgs/quick-actions/Exchange'
	import CreditCard from '../../svgs/CreditCard'
	import ElectronHelpers from "../../../util/ElectronHelpers";


	const STATES = {
		SELECT_TYPE:'selectType',
		EXCHANGE:'exchange',
		CREDIT_CARD:'creditCard',
	}

	let accountTimeout;

	export default {
		props:['popin'],
		components:{Exchange, CreditCard},
		data () {return {

			accountName:'',
			accountNameError:' ',
			eosToUse:'1.0000',
			resourceError:null,
			ramPrice:null,

			transactionId:'',

			ownerKey:'',
			activeKey:'',

			state:STATES.SELECT_TYPE,
			STATES,
		}},

		mounted(){
			if(this.account) this.ownerKey = this.activeKey = this.account.publicKey;
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
			noAccountButtons(){
				if(this.state === STATES.SELECT_TYPE) return [{text:'Cancel', click:() => this.returnResult(false)}];
				return [{text:'Back', click:() => this.state = STATES.SELECT_TYPE}];
			},
			changeableKeys(){
				return [{
					label:'Owner/Master Key',
					ref:this.ownerKey,
				}, {
					label:'Active/Daily Key',
					ref:this.activeKey,
				}]
			},

			account(){
				return this.popin.data.props.account instanceof Account ? this.popin.data.props.account : null;
			},
			keypair(){
				return this.popin.data.props.account instanceof Keypair ? this.popin.data.props.account : null;
			},
			network(){
				const endorsed = PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork();
				return this.account ? this.account.network() : this.networks.find(x => x.chainId === endorsed.chainId) || endorsed;
			},
			decimals(){
				return this.network.systemToken().decimals;
			},
			minimumPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : '1.0000') + 1.2).toFixed(this.decimals);
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
				this[Actions.RELEASE_POPUP](this.popin);
			},
			keypairFor(publicKey){
				return this.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey));
			},
			copyExchangeMemo(){
				ElectronHelpers.copy(this.exchangeMemo);
			},

			async getRamPrice(){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const ramPrice = await plugin.getRamPrice(this.network);
				this.ramPrice = (ramPrice * 4096).toFixed(this.decimals);
			},

			finishedAccountCreation(tx){
				setTimeout(async () => {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, tx));
					const owner = this.keypairs.find(x => x.publicKeys.find(y => y.key === this.ownerKey));
					const active = this.keypairs.find(x => x.publicKeys.find(y => y.key === this.activeKey));

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
					this.ownerKey,
					this.activeKey,
					this.eosToUse
				)
					.then(tx => this.finishedAccountCreation(tx))
					.catch(error => {
						this.setWorkingScreen(false);
						PopupService.push(Popup.prompt("Error", error));
						console.error('error', error);
					});
			},

			async checkAccountName(){
				clearTimeout(accountTimeout);
				accountTimeout = setTimeout(async () => {
					this.accountName = this.accountName.trim().toLowerCase();
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
				Actions.RELEASE_POPUP
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

	.using-exchange {
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