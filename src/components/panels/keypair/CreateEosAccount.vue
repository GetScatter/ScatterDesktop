<template>
	<section class="full-panel inner">

		<section class="name-input">
			<cin centered="1" :error="accountNameError"
			     :label="locale(langKeys.CREATE_EOS.AccountNameLabel)"
			     :placeholder="locale(langKeys.CREATE_EOS.AccountNamePlaceholder)"
			     :text="accountName" v-on:changed="x => accountName = x" />

		</section>

		<section style="padding:0 80px 10px;">
			<section class="disclaimer unmargin centered">
				<b>{{locale(langKeys.CREATE_EOS.DisclaimerTitle)}}</b><br>
				<p>{{locale(langKeys.CREATE_EOS.DisclaimerSubtitle)}}</p>
			</section>
		</section>


		<!----------------------------->
		<!------- USING ACCOUNT ------->
		<!----------------------------->
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
				</section>
			</section>

			<section class="action-bar short bottom centered">
				<btn blue="1" :disabled="!creator || resourceError || accountNameError"
				     :text="locale(langKeys.CREATE_EOS.ACCOUNT.ActionBarButton)"
				     v-on:clicked="createAccount" />
			</section>
		</section>


		<!----------------------------->
		<!------- USING EXCHANGE ------>
		<!----------------------------->
		<section class="dynamic-panel" v-if="state === STATES.EXCHANGE">

			<section class="padded">
				<section class="input-button">
					<cin red="1" :label="locale(langKeys.CREATE_EOS.EXCHANGE.MinimumAmountLabel)"
					     disabled="1"
					     :text="`${minimumPrice} ${systemSymbol}`" />
					<btn :text="locale(langKeys.CREATE_EOS.EXCHANGE.CopyButton)"
					     v-on:clicked="copyText(`${minimumPrice} ${systemSymbol}`)" />
				</section>
				<section class="input-button">
					<cin :label="locale(langKeys.CREATE_EOS.EXCHANGE.WithdrawAccountLabel)"
					     disabled="1" text="account4free" />
					<btn :text="locale(langKeys.CREATE_EOS.EXCHANGE.CopyButton)"
					     v-on:clicked="copyText('account4free')" />
				</section>
				<section class="input-button">
					<cin :label="locale(langKeys.CREATE_EOS.EXCHANGE.MemoLabel)"
					     disabled="1" :text="memo" />
					<btn :text="locale(langKeys.CREATE_EOS.EXCHANGE.CopyButton)"
					     v-on:clicked="copyText(memo)" />
				</section>
			</section>

			<section class="action-bar short bottom centered">
				<btn blue="1" :disabled="accountNameError"
				     :text="locale(langKeys.CREATE_EOS.EXCHANGE.ActionBarButton)" />
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

	const STATES = {
		ACCOUNT:'account',
		EXCHANGE:'exchange',
	};

	export default {
		props:['ownerPublicKey', 'activePublicKey', 'ownerId', 'activeId'],
		components:{
			FullWidthRow,
			FlatList
		},
		data () {return {
			state:STATES.EXCHANGE,
			STATES,

			accountName:'',
			accountNameError:null,
			creator:null,
			eosToUse:'1.0000',
			resourceError:null,

			systemSymbol:'EOS',
			ramPrice:null,
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

			creators(){
				return this.accounts.filter(x => x.blockchain() === Blockchains.EOSIO).reduce((acc, account) => {
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
				return this.ownerPublicKey;
			}
		},

		methods:{

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
					setTimeout(async () => {
						PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, tx));
						const owner = this.keypairs.find(x => x.id === this.ownerId);
						const active = this.keypairs.find(x => x.id === this.activeId);
						this.$router.push({name:this.RouteNames.KEYPAIR, params:{id:owner ? owner.id : active.id}});
						this.setWorkingScreen(false);
						await AccountService.importAllAccounts(active, false, [Blockchains.EOSIO], [this.creator.network()]);
						if(owner) await AccountService.importAllAccounts(owner, false, [Blockchains.EOSIO], [this.creator.network()]);
					}, 500);
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


			},

			...mapActions([
				Actions.HIDE_BACK_BTN
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
	@import "../../../_variables";

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


</style>