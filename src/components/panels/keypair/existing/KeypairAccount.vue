<template>
	<section>
		<section class="basics" v-if="account">
			<section class="info">
				<figure class="network">{{blockchainName(account.blockchain())}} - <b>{{account.network().name}}</b></figure>
				<figure class="identifier" :class="{'mainnet':isMainnet}" @click="openInExplorer">{{account.sendable()}}</figure>
				<section class="authorities" v-if="authorities.length">
					<figure class="authority" :class="{'red':authority === 'owner'}" v-for="authority in authorities">{{authority}}</figure>
				</section>
			</section>
			<section class="tokens" @click="$emit('tokens', account)">
				{{locale(langKeys.KEYPAIR.ACCOUNTS.ViewTokens, tokens)}} <i class="icon-right-open-big"></i>
			</section>
		</section>

		<section class="moderations" v-if="account && usesResources">
			<section key="loading" class="loading" v-if="!accountResources">
				<figure class="spinner icon-spin4 animate-spin"></figure>
			</section>
			<section key="resources" v-if="accountResources">
				<section class="moderation" v-for="resource in accountResources">
					<figure class="name">{{resource.name}}</figure>
					<figure class="percentage-bar">
						<figure class="bar" :class="{'red':resource.percentage > 80}" :style="{'width':resource.percentage + '%'}"></figure>
					</figure>
					<figure class="action">
						<btn v-if="resource.actionable"
						     v-on:clicked="() => moderateResource(resource)"
						     small="1" :text="resource.actionText"></btn>

						<span v-else>{{resource.text}}</span>
					</figure>
				</section>
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

	export default {
		props:['account'],

		data(){return {
			Blockchains,
			usesResources:false,
			isMainnet:false,
		}},

		mounted(){
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
				if(!this.account.authority.length) return [];
				return this.accounts.filter(x => x.sendable() === this.account.sendable() && x.network().unique() === this.account.network().unique())
					.map(x => x.authority)
			},
			accountResources(){
				const resource = this.resources.find(x => x.acc === this.account.identifiable());
				return resource ? resource.res : null;
			},
			tokens(){
				if(!this.balances) return 0;
				if(!this.balances.hasOwnProperty(this.account.identifiable())) return 0;
				if(!this.balances[this.account.identifiable()]) return 0;
				return this.balances[this.account.identifiable()].length;
			}
		},
		methods:{
			async setMainnet(){
				this.isMainnet = PluginRepository.plugin(this.account.blockchain()).isEndorsedNetwork(this.account.network())
			},
			async moderateResource(resource){
				if(await ResourceService.moderateResource(resource, this.account))
					this[Actions.ADD_RESOURCES]({acc:this.account.identifiable(), res:await ResourceService.getResourcesFor(this.account)});
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
	@import "../../../../_variables";



	.basics {
		padding:20px;
		display:flex;
		flex-direction: row;
		justify-content: space-between;

		.info {
			flex:1;

			.network {
				font-size: 11px;
				color: $mid-dark-grey;

				b {
					color:$dark-blue;
				}
			}

			.identifier {
				margin-top:5px;
				font-size: 20px;
				font-weight: 300;
				display:table;

				&.mainnet {
					cursor: pointer;

					&:hover {
						text-decoration: underline;
					}
				}
			}

			.authorities {
				margin-top:5px;

				.authority {
					font-size: 9px;
					font-weight: bold;
					padding:2px 4px;
					border:1px solid $dark-blue;
					color:$dark-blue;
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
			align-items: center;
			color:$dark-blue;
			font-weight: bold;
			cursor: pointer;

			i {
				margin-left:5px;
			}

			&:hover {
				i {
					animation: bounce 0.7s infinite;
				}
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

	.moderations {
		padding:20px;
		background:#f4f5f5;

		.loading {
			padding:20px;
			display:flex;
			justify-content: center;
			align-items: center;
			color:$dark-blue;
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

</style>