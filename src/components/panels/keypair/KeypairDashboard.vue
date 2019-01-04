<template>
	<section>
		<!-- MAIN KEYPAIR DASHBOARD -->
		<section class="panel-container limited">
			<cin :big="scrollerAtTop"
			     :error="nameError"
			     :label="locale(langKeys.KEYPAIR.NameLabel)"
			     :placeholder="locale(langKeys.KEYPAIR.NamePlaceholder)"
			     :text="keypair.name"
			     v-on:changed="x => keypair.name = x" />

			<section class="panel-switch" :class="{'short':!scrollerAtTop}">
				<figure class="button" v-if="hasEosBlockchain" :class="{'active':dashState === DASH_STATES.ADD_ACCOUNT}"
				        @click="dashState = DASH_STATES.ADD_ACCOUNT">{{locale(langKeys.KEYPAIR.DASHBOARD.STATES.AddAccount)}}</figure>
				<figure class="button" :class="{'active':dashState === DASH_STATES.ACCOUNTS}"
				        @click="dashState = DASH_STATES.ACCOUNTS">{{locale(langKeys.KEYPAIR.DASHBOARD.STATES.LinkedAccounts)}}</figure>
				<figure class="button" :class="{'active':dashState === DASH_STATES.PUBLIC_KEYS}"
				        @click="dashState = DASH_STATES.PUBLIC_KEYS">{{locale(langKeys.KEYPAIR.DASHBOARD.STATES.KeysAndBlockchains)}}</figure>
			</section>

			<!-- ACCOUNTS -->
			<section class="list-container" v-if="dashState === DASH_STATES.ACCOUNTS">
				<!-- Accounts Searchbar -->
				<SearchBar :short="!scrollerAtTop"
				           class="search" :class="{'short':!scrollerAtTop}"
				           :placeholder="locale(langKeys.KEYPAIR.ACCOUNTS.SearchPlaceholder)"
				           v-on:terms="x => searchTerms = x" />

				<!-- Accounts List -->
				<section class="list accounts" :class="{'scrolled':!scrollerAtTop}" @scroll="handleScroll">
					<section class="item" v-for="account in filteredAccounts">
						<KeypairAccount :collapse="filteredAccounts.length > 5" :key="account.unique()" :account="account" v-on:tokens="x => $emit('tokens', x)" />
					</section>
				</section>
			</section>




			<!-- KEYS AND BLOCKCHAINS -->
			<section class="list-container" v-if="dashState === DASH_STATES.PUBLIC_KEYS">
				<section class="list blockchains" :class="{'scrolled':!scrollerAtTop}" @scroll="handleScroll">
					<KeypairBlockchains :key="keypair.unique()" :keypair="keypair" />
				</section>
			</section>




			<!-- ADD / CREATE EOSIO ACCOUNT -->
			<section class="list-container" style="overflow:auto;" v-if="dashState === DASH_STATES.ADD_ACCOUNT">

				<section style="padding-bottom:20px;">

					<section class="action-box top-pad">
						<label>{{locale(langKeys.KEYPAIR.DASHBOARD.ADD_ACCOUNT.LinkEosAccountLabel)}}</label>
						<p>{{locale(langKeys.KEYPAIR.DASHBOARD.ADD_ACCOUNT.LinkEosAccountDescription)}}</p>
						<br>
						<br>

						<section class="key-val">
							<section class="split-inputs">
								<sel style="flex:1; margin-left:0;" :label="locale(langKeys.KEYPAIR.DASHBOARD.ADD_ACCOUNT.AccountNetworkLabel)"
								     :selected="manualAccountNetwork"
								     :options="eosNetworks"
								     :parser="network => network.name"
								     v-on:changed="x => manualAccountNetwork = x"></sel>

								<cin style="margin-bottom:0; flex:1;"
								     :text="newAccountName"
								     v-on:changed="x => newAccountName = x"
								     placeholder="your.account@owner"
								     :label="locale(langKeys.GENERIC.AccountName)" />

								<btn :disabled="invalidNewAccountName" :text="locale(langKeys.GENERIC.Add)" style="margin-top:20px; flex:0.2;"
								     red="1" v-on:clicked="manuallyAddAccount" />
							</section>
						</section>
					</section>

					<section class="action-box top-pad" v-if="canCreateAccounts">
						<label>{{locale(langKeys.KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountLabel)}}</label>
						<p>{{locale(langKeys.KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountDescription)}}</p>
						<btn :text="locale(langKeys.KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountButton)" v-on:clicked="$emit('createeos')" />
					</section>
				</section>

			</section>




		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchBar from '../../reusable/SearchBar';
	import KeypairAccount from './existing/KeypairAccount';
	import KeypairBlockchains from '../../../components/panels/keypair/existing/KeypairBlockchains';

	import KeyPairService from "../../../services/KeyPairService";
	import ResourceService from "../../../services/ResourceService";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import {Blockchains} from "../../../models/Blockchains";
	import AccountService from "../../../services/AccountService";
	import Account from "../../../models/Account";
	import PluginRepository from "../../../plugins/PluginRepository";
	import BalanceService from "../../../services/BalanceService";
	import * as Actions from "../../../store/constants";

	let saveTimeout;

	const DASH_STATES = {
		ADD_ACCOUNT:'addAccount',
		ACCOUNTS:'accounts',
		PUBLIC_KEYS:'publicKeys',
	};

	export default {
		props:['keypair'],
		components:{
			SearchBar,
			KeypairAccount,
			KeypairBlockchains,
		},

		data () {return {
			scrollerAtTop:true,
			dashState:DASH_STATES.ACCOUNTS,
			DASH_STATES,

			searchTerms:'',
			manualAccountNetwork:null,

			newAccountName:'',
		}},

		computed:{
			...mapGetters([
				'keypairs',
				'accounts',
				'networks',
			]),
			eosNetworks(){
				return this.networks.filter(x => x.blockchain === Blockchains.EOSIO)
			},
			hasEosBlockchain(){
				return this.keypair.blockchains.includes(Blockchains.EOSIO);
			},
			filteredAccounts(){
				return this.keypair.accounts(true)
					.filter(x => x.name.toLowerCase().indexOf(this.searchTerms) > -1)
					.sort((a,b) => {
						return b.tokenCount() - a.tokenCount()
					})
			},
			nameError(){
				if(!this.keypair.name.trim().length) return this.locale(this.langKeys.KEYPAIR.DASHBOARD.ERRORS.InvalidWalletName);
				if(this.keypairs.find(x => x.id !== this.keypair.id && x.name.toLowerCase() === this.keypair.name.toLowerCase())) return this.locale(this.langKeys.KEYPAIR.DASHBOARD.ERRORS.WalletNameExists);
				return false;
			},
			canCreateAccounts(){
				if(!this.keypair.external) return true;
				if(this.accounts.find(x => x.blockchain() === Blockchains.EOSIO && !x.keypair().external)) return true;
				return false;
			},
			invalidNewAccountName(){
				return !PluginRepository.plugin(Blockchains.EOSIO).isValidRecipient(this.newAccountName.split('@')[0]);
			}
		},

		mounted(){
			this.manualAccountNetwork = this.eosNetworks.length ? this.eosNetworks[0] : null;


			if(!this.keypair.accounts().length){
				if(this.keypair.blockchains.includes(Blockchains.EOSIO)){
					this.dashState = DASH_STATES.ADD_ACCOUNT;
				}
			}
		},

		methods:{
			handleScroll(e){
				this.scrollerAtTop = e.target.scrollTop <= 80;
			},
			async manuallyAddAccount(){
				const [name, auth] = this.newAccountName.trim().toLowerCase().split('@');
				const account = Account.fromJson({
					keypairUnique:this.keypair.id,
					networkUnique:this.manualAccountNetwork.unique(),
					publicKey:this.keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key,
					name,
					authority:auth ? auth : 'active',
				});

				await AccountService.addAccount(account);
				this.dashState = DASH_STATES.ACCOUNTS;
				BalanceService.loadBalancesFor(account);
				this[Actions.ADD_RESOURCES]({acc:account.identifiable(), res:await ResourceService.getResourcesFor(account)});
			},

			...mapActions([
				Actions.ADD_RESOURCES
			])
		},

		watch:{
			['dashState'](){
				setTimeout(() => {
					this.scrollerAtTop = true;
				}, 200);
			},
			['keypair.name'](){
				clearTimeout(saveTimeout);
				if(!this.keypair) return;
				saveTimeout = setTimeout(async () => {
					if(this.nameError) return;
					await KeyPairService.updateKeyPair(this.keypair);
				}, 500);
			},
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.panel-switch {
		margin-top:0px;
	}

	.panel-container {
		position:fixed;
		top:170px;
		left:0;
		right:0;
		bottom:0;
		display: flex;
		flex-direction: column;
	}

	.list-container {
		flex: 1;
		display:flex;
		flex-direction: column;
		position: relative;
		margin-left:-70px;
		margin-right:-70px;
		margin-bottom:-40px;
		padding-left:70px;
		padding-right:55px;

		@media (min-width:1280px){
			padding:0;
		}

		.search {
			margin-left:-30px;
			border-bottom:0 solid rgba(0,0,0,0);
			transition: border-bottom 0.3s ease;

			&.short {
				border-bottom:1px solid rgba(0,0,0,0.05);
			}

			@media (min-width:1280px){
				padding:0;
			}
		}
	}

	.list {
		position:absolute;
		bottom:0;
		left:0;
		right:0;
		overflow-y:scroll;
		padding-left:70px;
		padding-right:55px;
		padding-bottom:50px;
		transition: top 0.4s ease, padding-top 0.2s ease;
		overflow-x:hidden;

		&.blockchains {
			top:0;
		}

		&.accounts {
			top:60px;

			@media (min-width:1280px){
				padding:0 10px;
				padding-bottom:50px;
			}

			.item {
				flex:1;
				margin-bottom:20px;
				border:1px solid #dfe0e1;
				border-radius:2px;
			}
		}

		&.scrolled {
			top:40px;
			padding-top:80px;
		}
	}

</style>