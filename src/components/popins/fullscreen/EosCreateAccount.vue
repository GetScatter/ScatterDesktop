<template>

	<section>
		<back-bar :text="state === STATES.SEND_AMOUNT ? accountName : null"
		          :subtext="state === STATES.SEND_AMOUNT ? locale(langKeys.CREATE_EOS.EXCHANGE.ChangeName) : null"
		          v-on:back="back" />

		<!----------------------------->
		<!------- USING ACCOUNT ------->
		<!----------------------------->
		<section class="full-panel inner limited" v-if="state === STATES.ACCOUNT">
			<section class="name-input">
				<cin centered="1" :error="accountNameError"
				     big="1"
				     :label="locale(langKeys.GENERIC.AccountName)"
				     :placeholder="locale(langKeys.GENERIC.AccountName)"
				     :text="accountName" v-on:changed="x => accountName = x" />
			</section>

			<section class="dynamic-panel" v-if="state === STATES.ACCOUNT">
				<section class="split-panel no-divider">
					<FlatList class="panel" v-if="state === STATES.ACCOUNT"
					          :label="locale(langKeys.CREATE_EOS.ACCOUNT.AccountsLabel)"
					          :items="creators"
					          selected-icon="icon-check"
					          :selected="creator ? creator.unique() : null"
					          v-on:selected="selectedCreator" />

					<section class="padded square" style="flex:1; overflow:auto;">
						<cin :label="`${locale(langKeys.CREATE_EOS.ACCOUNT.RamCostLabel)} - ( 4096 bytes )`"
						     disabled="1" :text="`${ramPrice ? ramPrice : '0.0000'} ${systemSymbol}`" />
						<cin :error="resourceError" :label="locale(langKeys.CREATE_EOS.ACCOUNT.ResourcesLabel)"
						     :right-text="tokenBalance"
						     v-on:right="eosToUse = tokenBalance.split(' ')[0]"
						     type="number" :text="eosToUse" v-on:changed="x => eosToUse = x" />
						<cin big="1" :label="locale(langKeys.CREATE_EOS.ACCOUNT.TotalLabel)"
						     disabled="1" :text="`${totalPrice} ${systemSymbol}`" />

						<section v-if="showKeys">
							<br>

							<cin label="Owner"
							     :text="ownerKey" v-on:changed="x => ownerKey = x" />
							<cin label="Active"
							     :text="activeKey" v-on:changed="x => activeKey = x" />
						</section>
					</section>
				</section>

				<section class="action-bar short bottom centered">
					<btn blue="1" :disabled="!creator || resourceError || accountNameError"
					     :text="locale(langKeys.CREATE_EOS.ACCOUNT.ActionBarButton)"
					     v-on:clicked="createAccount" />
				</section>
			</section>
		</section>







		<!----------------------------->
		<!------- USING EXCHANGE ------>
		<!----------------------------->
		<section class="full-panel center-fold inner limited" v-if="state === STATES.EXCHANGE">

			<img src="../../../assets/piggy_bank.png" style="margin-top:-50px;" />
			<br>
			<section class="name-input" style="padding-top:0; max-width:400px;">
				<cin centered="1"
				     :error="accountNameError"
				     big="1"
				     :label="locale(langKeys.GENERIC.AccountName)"
				     :placeholder="locale(langKeys.GENERIC.AccountName)"
				     :text="accountName" v-on:changed="x => accountName = x" />
			</section>

			<section class="action-bar short bottom centered">
				<btn blue="1"
				     :disabled="accountNameError"
				     :text="locale(langKeys.CREATE_EOS.EXCHANGE.UseNameButton)"
				     v-on:clicked="state = STATES.SEND_AMOUNT" />
			</section>
		</section>

		<section class="full-panel center-fold inner with-action limited" v-if="state === STATES.SEND_AMOUNT">
			<section class="padded" v-if="allowsFreeAccounts">
				<section class="centered">
					<h1>Free Account Available!</h1>
					<br>
					<img class="eos-logo" src="../../../assets/scrooge_mcpig.png" />
					<br>
					<br>

					<section style="max-width:500px;">
						Thanks to the community and various apps running on EOS, you can create an account for free.
						<br>
						<br>
						<br>
						<b style="font-size: 13px;">Just click the button below to create your account.</b>
					</section>
				</section>
			</section>
			<section class="padded" v-else>
				<b>EOS Mainnet</b>
				<br>
				<br>
				<section style="margin:0 auto;" class="disclaimer less-pad">
					{{locale(langKeys.CREATE_EOS.EXCHANGE.InfoTitle)}}
					<p>{{locale(langKeys.CREATE_EOS.EXCHANGE.InfoSubtitle)}}</p>
				</section>

				<figure class="line"></figure>

				<section class="details" style="display:flex;">
					<figure class="title inline-input">
						{{locale(langKeys.CREATE_EOS.EXCHANGE.ExchangeFieldParts)[0]}}
					</figure>
					<cin style="margin-bottom:0; flex:1;" disabled="1"
					     :text="`${minimumPrice} ${systemSymbol}`" copy="1" />
					<figure class="title inline-input">
						{{locale(langKeys.CREATE_EOS.EXCHANGE.ExchangeFieldParts)[1]}}
					</figure>
					<cin style="margin-bottom:0; flex:1;" disabled="1"
					     text="createbridge" copy="1" />
				</section>

				<br>
				<section class="details" style="display:flex;">
					<figure class="title inline-input">
						{{locale(langKeys.CREATE_EOS.EXCHANGE.ExchangeFieldParts)[2]}}
					</figure>
					<cin red="1" style="margin-bottom:0; flex:1;" disabled="1"
					     :text="memo" copy="1" />
					<figure class="title inline-input" style="margin-right:0;">
						{{locale(langKeys.CREATE_EOS.EXCHANGE.ExchangeFieldParts)[3]}}
					</figure>
				</section>

				<figure class="line"></figure>
			</section>



			<section class="action-bar short bottom centered">
				<btn blue="1"
				     :disabled="accountNameError"
				     :text="locale(langKeys.CREATE_EOS.EXCHANGE.ActionBarButton)"
				     v-on:clicked="createExchangeAccount" />
			</section>
		</section>






	</section>



</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import {Blockchains} from "../../../models/Blockchains";
	import FlatList from '../../reusable/FlatList';
	import FullWidthRow from '../../reusable/FullWidthRow';
	import PluginRepository from "../../../plugins/PluginRepository";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import AccountService from "../../../services/AccountService";
	import Onboarding from '../../svgs/Onboarding';
	import EosAccountService from "../../../services/EosAccountService";

	const STATES = {
		ACCOUNT:'account',
		EXCHANGE:'exchange',
		SEND_AMOUNT:'sendAmount',
	};

	let accountTimeout;

	export default {
		props:['popin'],
		components:{
			FullWidthRow,
			FlatList,
			Onboarding
		},
		data () {return {
			state:STATES.EXCHANGE,
			STATES,
			allowsFreeAccounts:false,

			accountName:'',
			accountNameError:' ',
			creator:null,
			eosToUse:'1.0000',
			resourceError:null,

			systemSymbol:'EOS',
			ramPrice:null,

			transactionId:'',

			ownerKey:'',
			activeKey:'',
		}},

		created(){
			this.ownerKey = this.ownerPublicKey;
			this.activeKey = this.activePublicKey;

			this.checkAccountName();
			if(this.hasOtherEosAccounts) this.state = STATES.ACCOUNT;
			else this.checkFreeAccounts();
			this.getRamPrice();
		},

		computed:{
			...mapState([
				'seed',
				'balances'
			]),
			...mapGetters([
				'keypairs',
				'accounts',
				'networks',
			]),

			ownerPublicKey(){ return this.popin.data.props.ownerPublicKey; },
			activePublicKey(){ return this.popin.data.props.activePublicKey; },
			ownerId(){ return this.popin.data.props.ownerId; },
			activeId(){ return this.popin.data.props.activeId; },
			showKeys(){ return this.popin.data.props.showKeys; },

			creators(){
				return this.accounts
					.filter(x => x.blockchain() === Blockchains.EOSIO)
					.filter(x => !x.keypair().external)
				.reduce((acc, account) => {
					if(!acc.find(x => account.network().unique() === x.network().unique()
						&& account.sendable() === x.sendable())) acc.push(account);
					return acc;
				}, []).map(account => ({
					id:account.unique(),
					title:account.name,
					description:account.network().name,
				}));
			},
			minimumPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : '1.0000') + 1.2).toFixed(this.decimals);
			},
			decimals(){
				return !this.creator ? 4 : this.creator.network().systemToken().decimals;
			},
			totalPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : 0) + parseFloat(this.eosToUse ? this.eosToUse : 0)).toFixed(this.decimals);
			},
			hasOtherEosAccounts(){
				return !!this.accounts.find(x => x.blockchain() === Blockchains.EOSIO);
			},
			memo(){
				return this.activePublicKey;
			},
			tokenBalance(){
				if(!this.creator) return;
				const network = this.creator.network();
				const accountBalances = this.balances[this.creator.identifiable()];
				if(!accountBalances) return null;
				const balance = this.balances[this.creator.identifiable()].find(x => x.unique() === network.systemToken().unique());
				if(!balance) return null;
				return `${balance.amount} ${balance.symbol}`;
			},
		},

		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			back(){
				if(this.state === STATES.SEND_AMOUNT) return this.state = STATES.EXCHANGE;
				return this.returnResult(null);
			},

			async getNetwork(){
				if(this.creator) return this.creator.network();

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const mainnetChainId = plugin.getEndorsedNetwork().chainId;
				return this.networks.find(x => x.chainId === mainnetChainId && x.blockchain === Blockchains.EOSIO);
			},

			async getRamPrice(){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const network = await this.getNetwork();
				const ramPrice = await plugin.getRamPrice(network);
				this.ramPrice = (ramPrice * 4096).toFixed(this.decimals);
				this.systemSymbol = network.systemToken().symbol;
			},

			selectedCreator(item){
				this.creator = this.accounts.find(x => x.unique() === item.id);
				this.eosToUse = '1.0000';
				this.checkAccountName();
			},

			finishedAccountCreation(tx, network, exchange = false){
				setTimeout(async () => {
					if(!exchange) PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, tx));
					const owner = this.keypairs.find(x => x.id === this.ownerId);
					const active = this.keypairs.find(x => x.id === this.activeId);
					this.$router.push({name:this.RouteNames.KEYPAIR, params:{id:owner ? owner.id : active.id}});
					this.setWorkingScreen(false);

					const networks = network ? [network] : [];
					await AccountService.importAllAccounts(owner ? owner : active, false, [Blockchains.EOSIO], networks);
					this.returnResult(true);
				}, 500);
			},

			async checkFreeAccounts(){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const network = this.networks.find(x => plugin.isEndorsedNetwork(x));
				const machineId = await EosAccountService.getMachineId();
				if(!await EosAccountService.canMakeFreeAccount(machineId)) return false;
				this.allowsFreeAccounts = await EosAccountService.allowsFreeAccounts(network);
			},

			async createExchangeAccount(){
				if(this.accountNameError) return;
				this.setWorkingScreen(true);

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const network = this.networks.find(x => plugin.isEndorsedNetwork(x));
				const result = await EosAccountService.createAccount(this.activePublicKey, this.accountName, this.allowsFreeAccounts);

				if(!result || result.hasOwnProperty('error')){
					this.setWorkingScreen(false);
					return PopupService.push(Popup.snackbar(result.error));
				}

				this.finishedAccountCreation(result, network, true);
			},

			async createAccount(){
				this.resourceError = null;

				if(this.accountNameError) return;
				if(this.resourceError) return;

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				this.eosToUse = parseFloat(this.eosToUse).toFixed(this.decimals);

				this.setWorkingScreen(true);

				plugin.createAccount(
					this.creator,
					this.accountName,
					this.ownerKey,
					this.ownerKey,
					this.eosToUse
				).then(tx => {
					this.finishedAccountCreation(tx, this.creator.network());
				})
				.catch(error => {
					this.setWorkingScreen(false);
					PopupService.push(Popup.prompt("Error", error));
					console.log('error', error);
				});
			},

			async checkResourceError(){
				if(parseFloat(this.eosToUse) < 1) return this.resourceError =
					this.locale(this.langKeys.CREATE_EOS.ACCOUNT.ResourcesLowError, `1.0000 ${this.systemSymbol}`);
				this.resourceError = null;
			},

			async checkAccountName(){
				clearTimeout(accountTimeout);
				accountTimeout = setTimeout(async () => {
					if(this.accountName.length !== 12) return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.AccountNameLengthError);
					if(this.accountName.split('').filter(x => isNaN(x)).find(x => x.toUpperCase() === x))
						return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.AccountNameFormattingError);

					if(!PluginRepository.plugin(Blockchains.EOSIO).isValidRecipient(this.accountName)){
						return this.accountNameError = 'only a-z, 1-5';
					}

					if(this.state === STATES.ACCOUNT && !this.creator)
						return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.SelectCreatorError);

					this.accountNameError = this.locale(this.langKeys.CREATE_EOS.CheckingNameAlert);

					const plugin = PluginRepository.plugin(Blockchains.EOSIO);
					const acc = await plugin.accountData(null, await this.getNetwork(), this.accountName);
					if(acc.hasOwnProperty('code') && acc.code === 500){
						this.accountNameError = null;
					} else {
						this.accountNameError = this.locale(this.langKeys.CREATE_EOS.NameTakenAlert);
					}
				}, 250);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},

		watch:{
			['creator'](){
				this.getRamPrice();
			},
			['accountName'](){
				this.checkAccountName();
			},
			['eosToUse'](){
				this.checkResourceError();
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.line {
		width:100%;
		height:1px;
		background:rgba(0,0,0,0.1);
		margin:30px 0;
	}

	.name-input {
		padding:30px 30px 0;
		max-width:600px;
		margin:0 auto;
		width:100%;
	}

	.padded {
		padding:30px 80px;

		&.square {
			padding:30px;
		}
	}

	.panel {
		flex:1;
		position: relative;
		display:flex;
		flex-direction: column;
	}

	.input-button {
		display:flex;
		flex-direction: row;
		align-items: center;

		section {
			flex:5;
		}

		button {
			flex:1;
			margin-left:10px;
		}
	}

	.details {
		display:flex;
		justify-content: center;
		align-items: center;


		.title {
			&.inline-input {
				flex:0 0 auto;

				&:first-child {
					margin-right:20px;
				}

				&:not(:first-child){
					margin:0 20px;
				}
			}
		}
	}


</style>