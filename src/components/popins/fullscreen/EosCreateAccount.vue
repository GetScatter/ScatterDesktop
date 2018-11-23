<template>

	<section>
		<back-bar :text="state === STATES.SEND_AMOUNT ? accountName : null"
		          :subtext="state === STATES.SEND_AMOUNT ? 'Want to change names?' : null"
		          v-on:back="back" />

		<!----------------------------->
		<!------- USING ACCOUNT ------->
		<!----------------------------->
		<section class="full-panel inner limited" v-if="state === STATES.ACCOUNT">
			<section class="name-input">
				<cin centered="1" :error="accountNameError"
				     big="1"
				     :label="locale(langKeys.CREATE_EOS.AccountNameLabel)"
				     :placeholder="locale(langKeys.CREATE_EOS.AccountNamePlaceholder)"
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
						     type="number" :text="eosToUse" v-on:changed="x => eosToUse = x" />
						<cin big="1" :label="locale(langKeys.CREATE_EOS.ACCOUNT.TotalLabel)"
						     disabled="1" :text="`${totalPrice} ${systemSymbol}`" />

						<section v-if="showKeys">
							<br>

							<cin label="Owner"
							     :text="ownerPublicKey" />
							<cin label="Active"
							     :text="activePublicKey" />
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
				<cin centered="1" :error="accountNameError"
				     big="1"
				     :label="locale(langKeys.CREATE_EOS.AccountNameLabel)"
				     :placeholder="locale(langKeys.CREATE_EOS.AccountNamePlaceholder)"
				     :text="accountName" v-on:changed="x => accountName = x" />
			</section>

			<section class="action-bar short bottom centered">
				<btn blue="1" :disabled="accountNameError"
				     text="Use Name"
				     v-on:clicked="state = STATES.SEND_AMOUNT" />
			</section>
		</section>

		<section class="full-panel center-fold inner with-action limited" v-if="state === STATES.SEND_AMOUNT">
			<section class="padded">
				<section style="margin:0 auto;" class="disclaimer less-pad">
					You need to pay for the resources needed to create accounts on the EOS blockchain.
					<p>All of the extra funds you send will be transferred to the account.</p>
				</section>
				<!--<section class="disclaimer less-pad">-->
					<!--EOS accounts need to be paid for so that they can exist on the network.-->
					<!--<p>All of the extra funds you send will be transferred to the account.</p>-->
				<!--</section>-->
				<figure class="line"></figure>

				<!--<section class="details">-->
					<!--<figure class="title">Please send Nudes</figure>-->
				<!--</section>-->

				<section class="details" style="display:flex;">
					<figure class="title inline-input">
						Send at least
					</figure>
					<cin style="margin-bottom:0; flex:1;" disabled="1"
					     :text="`${minimumPrice} ${systemSymbol}`" copy="1" />
					<figure class="title inline-input">
						to account
					</figure>
					<cin style="margin-bottom:0; flex:1;" disabled="1"
					     text="makeaccounts" copy="1" />
				</section>

				<br>
				<section class="details" style="display:flex;">
					<figure class="title inline-input">
						with
					</figure>
					<cin red="1" style="margin-bottom:0; flex:1;" disabled="1"
					     :text="memo" copy="1" />
					<figure class="title inline-input" style="margin-right:0;">
						as the Memo
					</figure>
				</section>

				<figure class="line"></figure>

				<section class="details less-pad" style="display:block;">
					<section class="title">After sending EOS from an exchange with the above details, copy the transaction ID here.</section>
					<p>You must wait for the transaction to be irreversible, this takes around 3 minutes.</p>
				</section>
				<br>
				<cin placeholder="Transaction ID" big="1" :text="transactionId" v-on:changed="x => transactionId = x" />

			</section>



			<section class="action-bar short bottom centered">
				<btn blue="1" :disabled="accountNameError || !transactionId.length"
				     :text="locale(langKeys.CREATE_EOS.EXCHANGE.ActionBarButton)" v-on:clicked="createExchangeAccount" />
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

			accountName:'',
			accountNameError:' ',
			creator:null,
			eosToUse:'1.0000',
			resourceError:null,

			systemSymbol:'EOS',
			ramPrice:null,

			transactionId:'',
		}},

		created(){

			this.checkAccountName();
			if(this.hasOtherEosAccounts) this.state = STATES.ACCOUNT;
			this.getRamPrice();
		},

		computed:{
			...mapState([
				'seed',
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
				return (parseFloat(this.ramPrice ? this.ramPrice : '1.0000') + 1).toFixed(4);
			},
			totalPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : 0) + parseFloat(this.eosToUse ? this.eosToUse : 0)).toFixed(4);
			},
			hasOtherEosAccounts(){
				return !!this.accounts.find(x => x.blockchain() === Blockchains.EOSIO);
			},
			memo(){
				return this.activePublicKey;
			}
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
				this.ramPrice = (ramPrice * 4096).toFixed(4);
				this.systemSymbol = network.systemToken().symbol;
			},

			selectedCreator(item){
				this.creator = this.accounts.find(x => x.unique() === item.id);
				this.checkAccountName();
			},

			finishedAccountCreation(tx, network){
				setTimeout(async () => {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, tx));
					const owner = this.keypairs.find(x => x.id === this.ownerId);
					const active = this.keypairs.find(x => x.id === this.activeId);
					this.$router.push({name:this.RouteNames.KEYPAIR, params:{id:owner ? owner.id : active.id}});
					this.setWorkingScreen(false);

					const networks = network ? [network] : [];
					await AccountService.importAllAccounts(owner ? owner : active, false, [Blockchains.EOSIO], networks);
				}, 500);
			},

			async createExchangeAccount(){
				if(this.accountNameError) return;
				this.setWorkingScreen(true);

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const signature = await plugin.signer({data:this.activePublicKey}, this.activePublicKey, true);

				const payload = {
					transaction_id:this.transactionId,
					signature,
					keys:{
						active:this.activePublicKey,
						owner:this.ownerPublicKey
					},
					account_name:this.accountName
				};

				const result = await fetch(`http://localhost:6545/v1/create_eos`, {
					method: 'POST',
					headers:{
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body:JSON.stringify(payload)
				}).then(r => r.json()).catch(error => ({error}));

				if(!result || result.hasOwnProperty('error')){
					this.setWorkingScreen(false);
					return PopupService.push(Popup.snackbar(result.error));
				}

				const network = this.networks.find(x => plugin.isEndorsedNetwork(x));
				this.finishedAccountCreation(result.created, network);
			},

			async createAccount(){
				this.resourceError = null;

				if(this.accountNameError) return;
				if(this.resourceError) return;

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				this.eosToUse = parseFloat(this.eosToUse).toFixed(4);

				this.setWorkingScreen(true);

				plugin.createAccount(
					this.creator,
					this.accountName,
					this.ownerPublicKey,
					this.activePublicKey,
					this.eosToUse
				).then(tx => {
					this.finishedAccountCreation(tx, this.creator.network());
				})
				.catch(error => {
					this.setWorkingScreen(false);
					console.log('error', error);
					PopupService.push(Popup.snackbar(error, 'attention'));
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
	@import "../../../variables";

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