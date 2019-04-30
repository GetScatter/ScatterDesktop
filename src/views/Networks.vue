<template>
	<section class="networks-panel">

		<!-------------------------->
		<!------ BLOCKCHAINS ------->
		<!-------------------------->
		<section class="blockchains">
			<section class="head">
				Blockchains
			</section>
			<section class="scroller">
				<section class="blockchain-list">
					<section class="badge-item hoverable" :class="{'active':selectedBlockchain === blockchain}" v-for="blockchain in blockchains" @click="selectBlockchain(blockchain)">
						<figure class="badge iconed" :class="`token-${blockchain}-${blockchain}`"></figure>
						<section class="details">
							<figure class="title">{{blockchainName(blockchain)}}</figure>
							<figure class="row">
								<figure class="secondary">{{networksFor(blockchain).length}} network{{networksFor(blockchain).length === 1 ? '' : 's'}}</figure>
							</figure>
						</section>
					</section>
				</section>
			</section>
		</section>

		<!-------------------------->
		<!------- NETWORKS --------->
		<!-------------------------->
		<section class="networks">
			<section class="head">
				Networks
			</section>
			<section class="scroller with-tail">
				<section class="network-list">
					<section class="network" v-for="network in visibleNetworks">
						<section class="basics" :class="{'open':expanded && expanded.unique() === network.unique()}">
							<figure class="chevron" @click="toggleExpansion(network)">
								<i class="icon-right-open-big"></i>
							</figure>
							<section class="details" @click="toggleExpansion(network)">
								<figure class="name">{{network.name}}</figure>
								<figure class="host">{{network.host}}</figure>
							</section>
							<section class="actions">
								<figure class="system-token">{{network.systemToken().symbol}}</figure>
								<Switcher class="switch" :state="isEnabled(network)" v-on:switched="toggleNetwork(network)" />
							</section>
						</section>

						<section class="expanded" ref="jsonNetwork" v-if="expandedUnique === network.unique()">
							<pre v-if="!isEnabled(network)">{{networkJson(network)}}</pre>
							<EditNetwork v-else :original="expanded" v-on:updated="x => expanded = x" v-on:save="saveNetwork" />
						</section>
					</section>
				</section>
			</section>
			<section class="tail">
				<Button text="Add custom network" blue="1" />
			</section>
		</section>

	</section>
</template>

<script>
	import {mapState, mapGetters} from 'vuex';
	import {Blockchains, BlockchainsArray} from "../models/Blockchains";
	import {GET} from "../services/apis/BackendApiService";
	import Network from "../models/Network";
	import PluginRepository from '../plugins/PluginRepository'
	import NetworkService from "../services/blockchain/NetworkService";
	import EditNetwork from "../components/misc/EditNetwork";
	import AccountService from "../services/blockchain/AccountService";

	export default {
		components: {EditNetwork},
		data(){return {
			expandedUnique:null,
			expanded:null,
			knownNetworks:[],
			test:false,
			blockchains: BlockchainsArray.map(x => x.value),
			selectedBlockchain:BlockchainsArray[0].value
		}},
		computed:{
			...mapGetters([
				'networks',
			]),
			visibleNetworks(){
				return this.networksFor(this.selectedBlockchain);
			},
		},
		created(){
			this.init();
		},
		methods:{
			async init(){
				this.knownNetworks = await GET(`networks?flat=true`).then(networks => networks.map(x => Network.fromJson(x))).catch(() => []);
			},
			selectBlockchain(blockchain){
				this.selectedBlockchain = blockchain;
				this.expanded = null;
			},
			isEnabled(network){
				return !!this.networks.find(x => x.unique() === network.unique());
			},
			async toggleNetwork(network){
				if(this.isEnabled(network)) await NetworkService.removeNetwork(network);
				else {
					await NetworkService.addNetwork(network);
					AccountService.importAllAccountsForNetwork(network);
				}
			},
			toggleExpansion(network){
				if(this.expanded && this.expanded.unique() === network.unique()) {
					this.expandedUnique = null;
					return this.expanded = null;
				}
				this.expandedUnique = network.unique();
				this.expanded = network.clone();
			},
			networkJson(network){
				const clone = network.clone();
				delete clone.id;
				delete clone.createdAt;
				if(!clone.fromOrigin){
					delete clone.fromOrigin;
				}
				if(clone.token){
					delete clone.token.id;
					delete clone.token.amount;
					delete clone.token.unusable;
					delete clone.token.fromOrigin;
					delete clone.token.createdAt;
				} else {
					delete clone.token;
				}
				return clone;
			},
			networksFor(blockchain){
				const endorsed = (() => {
					const n = PluginRepository.plugin(blockchain).getEndorsedNetwork();
					return this.networks.find(x => x.unique() === n.unique()) ? [] : [n];
				})();
				const savedNetworks = this.networks.filter(x => x.blockchain === blockchain);
				const knownNetworks = this.knownNetworks.filter(x => x.blockchain === blockchain);
				return endorsed.concat(savedNetworks).concat(knownNetworks).reduce((acc,network) => {
					if(!acc.find(x => x.unique() === network.unique())) acc.push(network);
					return acc;
				}, []);
			},
			async saveNetwork(){
				await NetworkService.updateNetwork(this.expanded);
				this.expanded = null;
				this.expandedUnique = null;
			}

		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

	.networks-panel {
		display:flex;
		height: $fullheight;

		.head {
			flex:1;
			display:flex;
			align-items: center;
			padding:0 20px;
			font-size: $medium;
			font-weight: bold;
			height:60px;
			border-bottom:1px solid $border;
		}

		.tail {
			flex:1;
			display:flex;
			align-items: center;
			padding:0 20px;
			height:60px;
			border-top:1px solid $border;

			button {
				width:100%;
			}
		}

		.scroller {
			flex:1;
			height:calc(100vh - 40px - 60px);
			overflow:auto;
			padding:20px;

			&.with-tail {
				height:calc(100vh - 40px - 60px - 60px);
			}
		}

		.blockchains {
			flex:0 0 auto;
			width:250px;
			border-right:1px solid $border;
		}

		.networks {
			flex:1;

			.network-list {
				padding:20px;

				.network {
					margin-bottom:40px;
					display:flex;
					flex-direction: column;

					.expanded {
						pre {
							font-size: $small;
							white-space: pre-wrap;
							padding:20px;
							background:$blue;
							color:$white;
							border-radius:$radius;
						}
					}

					.basics {
						display:flex;
						width:100%;
						align-items: center;

						.chevron{
							padding:0 30px 0 0;
							color:$blue;
							cursor: pointer;

							i {
								display:block;
								transition:all 0.2s ease;
								transition-property: transform;
							}
						}

						&.open {
							.chevron {
								i {
									transform:rotateZ(90deg);
								}
							}
						}

						.details {
							flex:1;
							cursor: pointer;

							.name {
								font-size: $medium;
								font-weight: bold;
							}

							.host {
								font-size: $small;
								margin-top:3px;
								color:$grey;
							}
						}

						.actions {
							display:flex;
							align-items: center;

							.system-token {
								font-size: $small;
								font-weight: bold;
								padding:3px 10px;
								background:$border;
								border-radius:20px;
								margin-right:10px;
							}

							.switch {

							}
						}
					}
				}
			}
		}
	}

</style>