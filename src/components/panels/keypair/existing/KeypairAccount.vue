<template>
	<section>
		<section class="basics" v-if="account">
			<section class="info">
				<figure class="collapser" v-if="accountActions || (account && usesResources)"
				        :class="{'icon-down-open-big':collapsed, 'icon-up-open-big':!collapsed, 'switched':!collapsed}"
				        @click="collapsed = !collapsed"></figure>

				<figure class="network">{{blockchainName(account.blockchain())}} - <b>{{account.network().name}}</b></figure>
				<section class="authorities" v-if="authorities.length">
					<figure class="authority" :class="{'red':authority === 'owner'}" v-for="authority in authorities">{{authority}}</figure>
				</section>
				<figure class="identifier" :class="{'mainnet':isMainnet}" @click="openInExplorer">{{account.sendable()}}</figure>
				<!--<section class="disclaimer less-pad" v-if="!collapsed && authorities.includes('owner') && authorities.includes('active')">-->
					<!--{{locale(langKeys.KEYPAIR.ACCOUNTS.EOSDangerousPermissions)}}-->
					<!--<p>{{locale(langKeys.KEYPAIR.ACCOUNTS.EOSDangerousPermissionsSubtitle)}}</p>-->
				<!--</section>-->
			</section>
			<section class="tokens" @click="$router.push({name:RouteNames.TOKENS, params:{account:account.unique()}})" v-if="account.tokenCount(systemToken)+1 > 0">
				<section class="total-tokens">
					{{locale(langKeys.KEYPAIR.ACCOUNTS.ViewTokens, account.tokenCount(systemToken)+1)}}
					<div class="main-token-balance">{{accountBalance}}</div>
				</section>
				<i class="chevron icon-right-open-big"></i>
			</section>
			<section class="tokens" v-else>
				No Tokens
			</section>
		</section>

		<section class="bottom-collapser" v-if="collapsed && (accountActions || (account && usesResources))" @click="collapsed = !collapsed">
			<span>Show Resources & Actions</span>
		</section>

		<section class="moderations" v-if="!collapsed && account && usesResources">
			<section key="loading" class="loading" v-if="!accountResources">
				<figure class="spinner icon-spin4 animate-spin"></figure>
			</section>
			<section key="resources" v-if="accountResources">
				<section class="moderation" v-for="resource in accountResources">
					<figure class="name">{{resource.name}} <b class="info">{{resource.text ? resource.text : parseFloat(resource.percentage).toFixed(2) + '%'}}</b></figure>
					<figure class="percentage-bar">
						<figure class="bar" :class="{'red':resource.percentage > 80}" :style="{'width':resource.percentage + '%'}"></figure>
					</figure>
					<figure class="action" v-if="account.authority !== 'watch'">
						<btn v-if="resource.actionable"
						     v-on:clicked="() => moderateResource(resource)"
						     small="1" :text="resource.actionText"></btn>
					</figure>
				</section>
			</section>
			<section class="actions" v-if="accountActions">
				<btn small="1" :key="action.id" v-for="action in accountActions" :text="action.title" v-on:clicked="action.onclick" />
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from "../../../../store/constants";
	import {Blockchains} from "../../../../models/Blockchains";
	import ResourceService from "../../../../services/ResourceService";
	import ElectronHelpers from "../../../../util/ElectronHelpers";
	import PluginRepository from "../../../../plugins/PluginRepository";
	import BalanceService from "../../../../services/BalanceService";

	export default {
		props:['account', 'collapse'],

		data(){return {
			Blockchains,
			usesResources:false,
			isMainnet:false,
			collapsed:true,
		}},

		mounted(){
			if(this.collapse !== null) this.collapsed = this.collapse;
			this.usesResources = ResourceService.usesResources(this.account);
			this.setMainnet();
		},

		computed:{
			...mapState([
				'resources',
				'balances',
			]),
			...mapGetters([
				'accounts',
				'explorers'
			]),
			authorities(){
				return this.account.authorities()
					.map(x => x.authority)
			},
			accountResources(){
				const resource = this.resources[this.account.identifiable()];
				return resource ? resource : null;
			},
			accountActions(){
				const plugin = PluginRepository.plugin(this.account.blockchain());
				const hasActions = plugin.hasAccountActions();
				if(!hasActions) return null;
				return plugin.accountActions(this.account);
			},
			systemToken(){
				return this.account.network().systemToken()
			},
			accountBalance(){
				const plugin = PluginRepository.plugin(this.account.blockchain());
				const systemToken = this.account.network().systemToken();
				let result = `${this.account.tokenBalance(systemToken)} `;
				if(plugin.hasUntouchableTokens()){
					let untouchable = this.account.tokens().find(x => !!x.unusable);
					if(untouchable) {
						untouchable = untouchable.clone();
						result += `(+${this.formatNumber(untouchable.amount)}) `;
					}
				}
				return `${result} ${systemToken.symbol}`
			}
		},
		methods:{
			async setMainnet(){
				this.isMainnet = PluginRepository.plugin(this.account.blockchain()).isEndorsedNetwork(this.account.network())
			},
			async moderateResource(resource){
				if(await ResourceService.moderateResource(resource, this.account)){
					this[Actions.ADD_RESOURCES]({acc:this.account.identifiable(), res:await ResourceService.getResourcesFor(this.account)})
					await BalanceService.loadBalancesFor(this.account);
				}
			},
			async openInExplorer(){
				if(this.isMainnet) {
					const blockchain = this.account.blockchain();
					const url = this.explorers[blockchain].parsed().account(this.account.sendable());
					ElectronHelpers.openLinkInBrowser(url)
				}
			},

			...mapActions([
				Actions.ADD_RESOURCES
			])
		},
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../../styles/variables";



	.basics {
		padding:20px;
		display:flex;
		flex-direction: row;
		justify-content: space-between;

		.info {
			flex:1;
			padding-right:20px;

			.disclaimer {
				margin-top:20px;
				width:auto;
				display:table;
				margin-bottom:0;
			}

			.collapser {
				display:inline-block;
				width:12px;
				height:12px;
				font-size: 12px;
				margin-right:10px;
				cursor: pointer;

				&.switched {
					animation: pump 0.5s ease;

					@keyframes pump {
						0%, 100% {
							transform:scale(1);
						}
						50% {
							transform:scale(2) translateX(-1px);
						}
					}
				}
			}

			.network {
				font-size: 14px;
				color: $mid-dark-grey;
				display:inline-block;

				b {
					color:$primary;
				}
			}

			.identifier {
				margin-top:14px;
				font-size: 22px;
				display:table;

				&.mainnet {
					cursor: pointer;

					&:hover {
						text-decoration: underline;
					}
				}
			}

			.authorities {
				margin-left:10px;
				display:inline-block;

				.authority {
					font-size: 14px;
					font-weight: bold;
					padding:2px 4px;
					border:1px solid $primary;
					color:$primary;
					border-radius:4px;
					display:inline-block;
					margin-right:3px;

					&.red {
						border:1px solid $red;
						background:$red;
						color:#fff;
					}
				}
			}
		}

		.tokens {
			display:flex;
			justify-content: center;
			align-items: center;
			color:$primary;
			font-weight: bold;
			cursor: pointer;

			&:hover {
				i {
					animation: bounce 0.7s infinite;
				}
			}

			.total-tokens {
				display:flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-end;
				margin-right:10px;

				.main-token-balance {
					margin-top:5px;
					font-size: 14px;
					font-weight: normal;
					display:block;
				}

				i {
					margin-left:5px;
				}

				@keyframes bounce {
					0%, 100% {
						transform:translateX(0px);
					}

					50% {
						transform:translateX(4px);

					}
				}
			}
		}

	}

	.bottom-collapser {
		cursor: pointer;
		padding:5px;
		background:#f4f5f5;
		border-top:1px solid rgba(0,0,0,0.05);
		display:flex;
		justify-content: center;
		align-items: center;
		font-size: 11px;
		font-weight: bold;
		background:$primary;
		background-image: $blue-grad;
		color:#fff;
		border-bottom-left-radius:2px;
		border-bottom-right-radius:2px;
	}

	.moderations {
		padding:20px;
		background:#f4f5f5;

		.loading {
			padding:20px;
			display:flex;
			justify-content: center;
			align-items: center;
			color:$primary;
		}

		.moderation {
			display:flex;
			flex-direction: row;
			align-items: center;
			min-height:32px;

			&:not(:last-child){
				margin-bottom:5px;
			}

			.name {
				font-size: 14px;

				.info {
					font-size:9px;
					padding:3px;
					border:1px solid rgba(0,0,0,0.3);
					border-radius:4px;
					vertical-align: middle;
					margin-left:5px;
				}
			}

			.action {
				button {
					min-width:75px;
				}

				span {
					text-align:center;
					font-size: 11px;
					font-weight: bold;
					color:$mid-dark-grey;
					max-width:150px;
					min-width:75px;
					display:inline-block;
					padding-right:1px;
				}
			}
		}
	}

	.actions {
		margin-top:10px;
		padding-top:10px;
		border-top:1px solid rgba(0,0,0,0.1);

		button {
			&:not(:first-child){
				margin-left:5px;
			}
		}
	}

</style>