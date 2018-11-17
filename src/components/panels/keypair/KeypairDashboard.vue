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
				<figure class="button" :class="{'active':dashState === DASH_STATES.ACCOUNTS}" @click="dashState = DASH_STATES.ACCOUNTS">Accounts</figure>
				<figure class="button" :class="{'active':dashState === DASH_STATES.PUBLIC_KEYS}" @click="dashState = DASH_STATES.PUBLIC_KEYS">Keys and Blockchains</figure>
			</section>

			<!-- ACCOUNTS -->
			<section class="list-container" key="accounts" v-if="dashState === DASH_STATES.ACCOUNTS">
				<!-- Accounts Searchbar -->
				<SearchBar :short="!scrollerAtTop"
				           class="search" :class="{'short':!scrollerAtTop}"
				           :placeholder="locale(langKeys.KEYPAIR.ACCOUNTS.SearchPlaceholder)"
				           v-on:terms="x => searchTerms = x" />

				<!-- Accounts List -->
				<section class="list accounts" :class="{'scrolled':!scrollerAtTop}" @scroll="handleScroll">
					<section class="item" v-for="account in filteredAccounts">
						<KeypairAccount :key="account.unique()" :account="account" v-on:tokens="x => $emit('tokens', x)" />
					</section>

					<section class="action-box" v-if="hasEosBlockchain">
						<section class="key-val">
							<figure>{{locale(langKeys.KEYPAIR.ACCOUNTS.AddAccountLabel)}}</figure>
							<figure>{{locale(langKeys.KEYPAIR.ACCOUNTS.AddAccountDescription)}}</figure>

							<br>
							<br>
							<section class="split-inputs">
								<sel style="flex:1; margin-left:0;" label="Network to add account to"
								     :selected="manualAccountNetwork"
								     :options="eosNetworks"
								     :parser="network => network.name"
								     v-on:changed="x => manualAccountNetwork = x"></sel>

								<btn :text="locale(langKeys.KEYPAIR.ACCOUNTS.AddAccountButton)" style="margin-top:20px; flex:0.2;"
								     red="1" v-on:clicked="manuallyAddAccount" />
							</section>
						</section>
					</section>
				</section>
			</section>

			<!-- KEYS AND BLOCKCHAINS -->
			<section class="list-container" key="keys" v-if="dashState === DASH_STATES.PUBLIC_KEYS">
				<section class="list blockchains" :class="{'scrolled':!scrollerAtTop}" @scroll="handleScroll">
					<KeypairBlockchains :key="keypair.unique()" :keypair="keypair" />
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

	let saveTimeout;

	const DASH_STATES = {
		ACCOUNTS:'accounts',
		PUBLIC_KEYS:'publicKeys',
	};

	export default {
		props:['keypair'],

		data () {return {
			scrollerAtTop:true,
			dashState:DASH_STATES.ACCOUNTS,
			DASH_STATES,

			searchTerms:'',
			manualAccountNetwork:null,
		}},

		components:{
			SearchBar,
			KeypairAccount,
			KeypairBlockchains
		},

		computed:{
			...mapGetters([
				'keypairs',
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
					.filter(x => x.name.toLowerCase().match(this.searchTerms))
			},
			nameError(){
				if(!this.keypair.name.trim().length) return 'Enter a name for this Vault Entry';
				if(this.keypairs.find(x => x.id !== this.keypair.id && x.name.toLowerCase() === this.keypair.name.toLowerCase())) return 'A Vault Entry with this name already exists.';
				return false;
			}
		},

		mounted(){
			this.manualAccountNetwork = this.eosNetworks.length ? this.eosNetworks[0] : null;
		},

		methods:{
			handleScroll(e){
				this.scrollerAtTop = e.target.scrollTop <= 80;
			},
			manuallyAddAccount(){
				PopupService.push(Popup.textPrompt(
					'Enter account name',
					'Enter the name of the account you think should be on this key.',
					'user-add',
					'Done',
					{ placeholder:'someaccount OR someaccount@active' },
					async formatted => {
						if(!formatted || !formatted.length) return;

						const [name, auth] = formatted.trim().toLowerCase().split('@');
						const account = Account.fromJson({
							keypairUnique:this.keypair.id,
							networkUnique:this.manualAccountNetwork.unique(),
							publicKey:this.keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key,
							name,
							authority:auth ? auth : 'active',
						});

						await AccountService.addAccount(account);
				}))
			}
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
	@import "../../../_variables";

	.panel-switch {
		margin-top:-20px;
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