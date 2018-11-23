<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="panel-container limited">
			<section class="head">
				<figure class="icon icon-flow-tree"></figure>
				<figure class="title">Proxy Votes</figure>
				<p>{{account.sendable()}}</p>
				<br>
				<br>
			</section>

			<section class="auto-vote" v-if="!isHardware">
				<section class="switch" @click="autoVote = !autoVote">
					<figure class="dot" :class="{'disabled':!autoVote}"></figure>
				</section>
				<section class="details">
					<figure class="title">Do you want to automatically re-proxy every 7 days?</figure>
					<p>If you enable this, accepting the initial transaction also accepts all future transactions too.</p>
				</section>
				<br>
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
	import RecurringService from "../../../services/RecurringService";

	export default {
		props:['popin'],
		components:{
			FlatList
		},
		data () {return {
			proxies:{},
			selectedProxy:null,
			autoVote:true,
		}},
		mounted(){
			if(this.isHardware) this.autoVote = false;
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
			isHardware(){
				return !!this.account.keypair().external
			}
		},
		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async setProxy(){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const result = await plugin.proxyVote(this.account, this.selectedProxy, true);
				if(result) {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, result.transaction_id));
					if(this.autoVote) await RecurringService.addProxy(this.account, this.selectedProxy);
					else await RecurringService.removeProxies([this.account]);
				}

				this.returnResult(true)
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

	.auto-vote {
		max-width:600px;
		margin:0 auto;
		display:flex;

		.switch {

		}

		.details {
			padding-left:20px;
		}
	}

</style>
