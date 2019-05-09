<template>
	<section class="keys-and-accounts-list">
		<SearchAndFilter :filters="filters" v-on:terms="x => terms = x" />
		<section class="keys-list">
			<section class="keypair" v-for="keypair in filteredKeypairs" :class="{'new':isNew(keypair)}">
				<section class="keypair-info">
					<figure class="blockchain" :class="`token-${keypair.enabledKeys()[0].blockchain}-${keypair.enabledKeys()[0].blockchain}`"></figure>
					<section class="info">
						<figure class="name">{{keypair.name}}</figure>
						<figure class="key">{{keypair.enabledKeys()[0].key}}</figure>
					</section>
					<section class="actions">
						<figure class="action icon-key"></figure>
						<figure class="action icon-dot-3" @click="setActionsMenu(keypair)"></figure>

						<section class="action-menu" :class="{'hidden':actionsMenu !== keypair.id}">
							<figure class="item" @click="copyPublicKey(keypair)">Copy Public Key</figure>
							<figure class="item" @click="removeKeypair(keypair)">Remove Key</figure>
							<figure class="item" :class="{'disabled':refreshingAccounts}" @click="refreshAccountsFor(keypair)">Refresh Accounts</figure>
						</section>
					</section>
				</section>

				<figure class="accounts-label">Linked accounts</figure>

				<section class="accounts-list" v-if="keypair.accounts().length">
					<section class="account" v-for="account in filteredAccounts(keypair)" @click="$emit('account', account)">
						<section class="details">
							<figure class="name">{{account.sendable()}}</figure>
							<figure class="network">{{account.network().name}}</figure>
						</section>
						<section class="tokens">
							<figure class="balance">{{account.totalFiatBalance()}} {{displayCurrency}}</figure>
							<figure class="quantity">in {{account.tokens().length}} tokens</figure>
						</section>
						<section class="actions">
							<figure class="chevron icon-right-open-big"></figure>
						</section>
					</section>
				</section>

				<section class="no-accounts" v-if="!keypair.accounts().length">
					No linked accounts
				</section>
			</section>
		</section>

	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import PluginRepository from "../../plugins/PluginRepository";
	import SearchAndFilter from "../reusable/SearchAndFilter";
	import {blockchainName, BlockchainsArray} from '../../models/Blockchains'
	import ElectronHelpers from "../../util/ElectronHelpers";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";
	import AccountService from "../../services/blockchain/AccountService";

	export default {
		components: {SearchAndFilter},
		data(){return {
			blockchainFilter:null,
			terms:'',
			actionsMenu:null,
			refreshingAccounts:null,
		}},
		computed:{
			...mapGetters([
				'accounts',
				'keypairs',
				'displayCurrency',
			]),

			filters(){
				return [
					{
						selected:this.blockchainFilter,
						options:[null].concat(BlockchainsArray.map(x => x.value)),
						parser:x => x === null ? 'All Blockchains' : blockchainName(x),
						onSelect:x => this.blockchainFilter = x,
					},
				]
			},
			filteredKeypairs(){
				return this.keypairs.filter(x => {
					return !this.blockchainFilter || x.enabledKeys().map(({blockchain}) => blockchain).includes(this.blockchainFilter)
				}).filter(x => {
					return x.accounts().find(account => account.sendable().toLowerCase().indexOf(this.terms) > -1)
						|| x.enabledKeys().some(key => key.key.toLowerCase().indexOf(this.terms) > -1)
				}).sort((a,b) => {
					return b.accounts().length - a.accounts().length;
				})
			},
		},
		methods:{
			filteredAccounts(keypair){
				return keypair.accounts(true)
					.filter(x => x.sendable().indexOf(this.terms) > -1)
					.sort((a,b) => {
						return b.totalFiatBalance() - a.totalFiatBalance();
					})
			},
			isNew(keypair){
				return keypair.createdAt && keypair.createdAt > (+new Date() - (1000 * 30));
			},
			setActionsMenu(keypair){
				this.actionsMenu = this.actionsMenu === keypair.id ? null : keypair.id;
			},
			copyPublicKey(keypair){
				this.actionsMenu = null;
				ElectronHelpers.copy(keypair.enabledKeys()[0].key);
			},
			removeKeypair(keypair){
				this.actionsMenu = null;
				PopupService.push(Popup.removeKeypair(keypair, removed => {}));
			},
			async refreshAccountsFor(keypair){
				if(this.refreshingAccounts) return;
				this.actionsMenu = null;
				this.refreshingAccounts = keypair.unique();
				await AccountService.importAllAccounts(keypair);
				this.refreshingAccounts = false;
			},
		}

	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.keys-list {
		height:calc(100% - 70px);
		overflow-y:auto;
		padding:30px;

		.keypair {
			//padding-bottom:20px;
			margin-bottom:20px;
			border:10px solid $lightergrey;
			padding:10px;
			border-radius:$radius;

			&.new {
				border:10px solid $blue;
			}

			.keypair-info {
				display:flex;
				align-items: center;
				margin-bottom:10px;

				.blockchain {
					font-size: 36px;
					background:$blue;
					color:$white;
					border-radius:$radius;
					height:50px;
					width:50px;
					display:flex;
					justify-content: center;
					align-items: center;
					margin-right:10px;
				}

				.info {
					flex:1;

					.name {
						font-size: $large;
						font-weight: bold;
					}

					.key {
						margin-top:3px;
						font-size: $small;
						font-weight: bold;
						color:$silver;
					}
				}

				.actions {
					display:flex;
					padding-right:10px;
					position: relative;

					.action-menu {
						position:absolute;
						top:40px;
						right:10px;
						border-radius:$radius;
						min-width:150px;
						background:$white;
						border:1px solid $lightgrey;
						box-shadow:0 1px 2px $blue-shadow, 0 4px 12px $blue-shadow;
						padding:5px 0;

						&.hidden {
							display:none;
						}

						.item {
							cursor: pointer;
							font-size: $medium;
							padding:5px 15px;

							&:hover {
								background:rgba(0,0,0,0.02);
							}

							&.disabled {
								opacity:0.2;
							}
						}
					}

					.action {
						padding:10px;
						border-radius:$radius;
						cursor: pointer;

						&:hover {
							background:$lightergrey;
						}
					}
				}
			}

			.accounts-label {
				margin-top:20px;
				font-size: $tiny;
				text-transform: uppercase;
				color:$blue;
				font-weight: bold;
			}

			.no-accounts {
				margin-top:5px;
				font-size: $large;
				color:$silver;
			}

			.accounts-list {
				margin-top:5px;

				.account {
					display:flex;
					align-items: center;
					padding:15px;
					border-radius:$radius;
					border:1px solid $lightgrey;
					cursor: pointer;

					&:not(:last-child){
						margin-bottom:10px;
					}

					.details {
						flex:1;

						.name {
							font-size: $large;
							font-weight: bold;
						}

						.network {
							font-size: $small;
							color:$silver;
						}
					}

					.tokens {
						.balance {
							font-size: $medium;
							font-weight: bold;
						}

						.quantity {
							font-size: $small;
						}
					}

					.actions {
						padding-left:10px;
						color:$blue;
					}

					&:hover {
						border:1px solid $blue;

						.details {
							.name {
								color:$blue;
							}
						}
					}
				}
			}
		}
	}


</style>