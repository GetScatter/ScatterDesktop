<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="panel-container limited">
			<section class="head">
				<figure class="icon icon-flow-tree"></figure>
				<figure class="title">Proxy Votes</figure>
				<p>{{account.sendable()}}</p>
				<br>
				<section class="disclaimer less-pad red">
					Proxying your votes allows someone else to vote for Block Producers for you.
					<p>
						We will automatically re-proxy for you periodically without notification to keep your vote weight up.
						<b style="text-decoration: underline;">By accepting the initial transaction you are accepting all of those transactions too.</b>
					</p>
				</section>
			</section>

			<section class="list">
				<FlatList label="Proxies" :selected="selectedProxy" :items="proxyList" v-on:selected="x => selectedProxy = x.id" />
			</section>

		</section>
		<section class="action-bar short bottom centered">
			<btn :disabled="!selectedProxy" text="Set Proxy" blue="1" v-on:clicked="setProxy" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../fullscreen-popins.scss';
	import PasswordService from "../../../services/PasswordService";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import {Blockchains} from "../../../models/Blockchains";
	import PluginRepository from "../../../plugins/PluginRepository";
	import FlatList from '../../reusable/FlatList';
	import ProxyService from "../../../services/ProxyService";
	import ObjectHelpers from "../../../util/ObjectHelpers";

	export default {
		props:['popin'],
		components:{
			FlatList
		},
		data () {return {
			proxies:{},
			selectedProxy:null,
		}},
		mounted(){
			setTimeout(async () => {
				this.proxies = await ProxyService.getProxyList();
			})
		},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'keypairs',
				'accounts',
			]),
			account(){
				return this.accounts.find(x => x.unique() === this.popin.data.props.account.unique());
			},
			proxyList(){
				if(!this.proxies.hasOwnProperty(this.blockchainName(Blockchains.EOSIO))) return [];
				return ObjectHelpers.shuffle(this.proxies[this.blockchainName(Blockchains.EOSIO)].map(proxy => ({
					id:proxy.account,
					title:proxy.name,
					description:proxy.description,
				})));
			},
		},
		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			setProxy(){
				this.returnResult(this.selectedProxy)
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 250px);
	}

	.list {
		max-width:700px;
		width:100%;
		text-align:left;

	}

</style>
