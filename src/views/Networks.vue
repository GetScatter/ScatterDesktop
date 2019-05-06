<template>
	<section class="blockchain-list-container">

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
		<section class="list-container">
			<section class="head">
				Networks
			</section>
			<section class="scroller with-tail">
				<section class="item-list">
					<section class="item" v-for="network in visibleNetworks">
						<section class="basics" :class="{'open':expanded && expanded.unique() === network.unique()}">
							<figure class="chevron" @click="toggleExpansion(network)">
								<i class="icon-right-open-big"></i>
							</figure>
							<section class="details" @click="toggleExpansion(network)">
								<figure class="name">{{network.name}}</figure>
								<figure class="text">{{network.host}}</figure>
								<figure class="connection-error" v-if="cantReach(network)">
									<i class="icon-attention"></i> Connection error!
								</figure>
							</section>
							<section class="actions">
								<figure class="system-token">{{network.systemToken().symbol}}</figure>
								<Switcher v-if="!isCustom(network)" class="switch" :state="isEnabled(network)" v-on:switched="toggleNetwork(network)" />
								<Button v-if="isCustom(network)" blue="1" text="Remove" @click.native="toggleNetwork(network)" />
							</section>
						</section>

						<section class="expanded" v-if="expandedUnique === network.unique()">
							<pre v-if="!isEnabled(network)">{{networkJson(network)}}</pre>
							<EditNetwork v-else :original="expanded" v-on:updated="x => expanded = x" v-on:save="saveNetwork" />
						</section>
					</section>
				</section>
			</section>
			<section class="tail">
				<Button @click.native="addCustomNetwork" text="Add custom network" blue="1" />
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
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";

	export default {
		components: {EditNetwork},
		data(){return {
			expandedUnique:null,
			expanded:null,
			knownNetworks:[],
			test:false,
			blockchains: BlockchainsArray.map(x => x.value),
			selectedBlockchain:BlockchainsArray[0].value,
			unreachable:{},
		}},
		computed:{
			...mapGetters([
				'networks',
				'accounts',
			]),
			visibleNetworks(){
				return this.networksFor(this.selectedBlockchain).sort((a,b) => {
					const endorsed = PluginRepository.plugin(this.selectedBlockchain).getEndorsedNetwork();
					const isEndorsed = endorsed.unique() === b.unique() ? 1 : endorsed.unique() === a.unique() ? -1 : 0;
					let byName = a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

					return isEndorsed || byName;
				});
			},
		},
		created(){
			this.init();
		},
		methods:{
			async init(){
				this.setWorkingScreen(true);
				this.knownNetworks = await Promise.race([
					new Promise(resolve => setTimeout(() => resolve([]), 2000)),
					GET(`networks?flat=true`).then(networks => networks.map(x => Network.fromJson(x))).catch(() => [])
				]);
				this.setWorkingScreen(false);
				this.networks.map(async network => {
					await this.checkReachable(network);
				})
			},
			cantReach(network){
				return this.unreachable[network.unique()]
			},
			isCustom(network){
				return !this.networksFor(network.blockchain, false).find(x => x.unique() === network.unique())
			},
			selectBlockchain(blockchain){
				this.selectedBlockchain = blockchain;
				this.expanded = null;
			},
			isEnabled(network){
				return !!this.networks.find(x => x.unique() === network.unique());
			},
			async toggleNetwork(network){
				this.setWorkingScreen(true);
				if(this.isEnabled(network)) await NetworkService.removeNetwork(network);
				else {
					await NetworkService.addNetwork(network);
					await AccountService.importAllAccountsForNetwork(network);
				}
				this.setWorkingScreen(false);
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
			networksFor(blockchain, withSaved = true){
				const endorsed = (() => {
					const n = PluginRepository.plugin(blockchain).getEndorsedNetwork();
					return this.networks.find(x => x.unique() === n.unique()) ? [] : [n];
				})();
				const savedNetworks = withSaved ? this.networks.filter(x => x.blockchain === blockchain) : [];
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
			},
			addCustomNetwork(){
				PopupService.push(Popup.addCustomNetwork(this.selectedBlockchain, async network => {
					if(!network) return;
					this.checkReachable(network);
				}));
			},
			async checkReachable(network){
				const reachable = await PluginRepository.plugin(network.blockchain).checkNetwork(network);
				if(!reachable){
					this.unreachable[network.unique()] = true;
					this.$forceUpdate();
				}
			}

		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";



</style>