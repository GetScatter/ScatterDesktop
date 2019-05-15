<template>

	<section class="pop-in">

		<section>
			<section class="head">
				<figure class="icon font icon-user-add"></figure>
				<figure class="title">Create Account</figure>
			</section>

			<!----------------------------->
			<!------- USING ACCOUNT ------->
			<!----------------------------->
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


	let accountTimeout;

	export default {
		props:['popin'],
		data () {return {

			accountName:'',
			accountNameError:' ',
			eosToUse:'1.0000',
			resourceError:null,

			systemSymbol:'EOS',
			ramPrice:null,

			transactionId:'',

			ownerKey:'',
			activeKey:'',
		}},

		mounted(){
			this.ownerKey = this.activeKey = this.account.publicKey;
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
				return this.popin.data.props.account;
			},
			decimals(){
				return this.account.network().systemToken().decimals;
			},
			minimumPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : '1.0000') + 1.2).toFixed(this.decimals);
			},
			totalPrice(){
				return (parseFloat(this.ramPrice ? this.ramPrice : 0) + parseFloat(this.eosToUse ? this.eosToUse : 0)).toFixed(this.decimals);
			},
		},

		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			keypairFor(publicKey){
				return this.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey));
			},

			async getRamPrice(){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const network = this.account.network();
				const ramPrice = await plugin.getRamPrice(network);
				this.ramPrice = (ramPrice * 4096).toFixed(this.decimals);
				this.systemSymbol = network.systemToken().symbol;
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
					if(this.accountName.length !== 12) return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.AccountNameLengthError);
					if(this.accountName.split('').filter(x => isNaN(x)).find(x => x.toUpperCase() === x))
						return this.accountNameError = this.locale(this.langKeys.CREATE_EOS.AccountNameFormattingError);

					if(!PluginRepository.plugin(Blockchains.EOSIO).isValidRecipient(this.accountName)){
						return this.accountNameError = 'only a-z, 1-5';
					}

					this.accountNameError = this.locale(this.langKeys.CREATE_EOS.CheckingNameAlert);

					const plugin = PluginRepository.plugin(Blockchains.EOSIO);
					const acc = await plugin.accountData(null, await this.account.network(), this.accountName);
					if(acc.hasOwnProperty('code') && acc.code === 500) this.accountNameError = null;
					else this.accountNameError = this.locale(this.langKeys.CREATE_EOS.NameTakenAlert);
				}, 250);
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

</style>