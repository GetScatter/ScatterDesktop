<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="panel-container limited">
			<section class="head">
				<figure class="icon icon-flow-tree"></figure>
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.Title)}}</figure>
				<p>{{account.sendable()}}</p>
				<br>
				<br>
			</section>

			<section class="auto-vote" v-if="!isHardware">
				<section class="switch" @click="autoVote = !autoVote">
					<figure class="dot" :class="{'disabled':!autoVote}"></figure>
				</section>
				<section class="details">
					<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.ReproxyTitle)}}</figure>
					<p>{{locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.ReproxyDesc)}}</p>
				</section>
				<br>
			</section>

			<br>
			<br>
			<cin style="max-width:650px; width:100%; margin:0 auto;"
			     big="1"
			     :label="locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.Label)"
			     :placeholder="locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.Placeholder)"
			     :text="selectedProxy"
			     v-on:changed="x => selectedProxy = x" />

			<section class="list" v-if="Object.keys(proxies).length">
				<FlatList :label="locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.KnownProxiesLabel)"
				          selected-icon="icon-check"
				          :selected="selectedProxy"
				          :items="proxyList"
				          v-on:selected="x => selectedProxy = x.id" />
			</section>

		</section>
		<section class="action-bar short bottom centered">
			<btn :text="locale(langKeys.POPINS.FULLSCREEN.EOS.PROXY.Button)"
				 blue="1" v-on:clicked="setProxy" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
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
			proxy:'',
		}},
		mounted(){
			if(this.isHardware) this.autoVote = false;
			setTimeout(async () => {
				if(PluginRepository.plugin(Blockchains.EOSIO).isEndorsedNetwork(this.account.network())){
					this.proxies = await ProxyService.getProxyList();
				}

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
				const proxy = this.selectedProxy ? this.selectedProxy : '';
				const result = await plugin.proxyVote(this.account, proxy, true);
				if(result) {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, result.transaction_id));

					if(this.selectedProxy && this.selectedProxy.length){
						if(this.autoVote && this.selectedProxy) await RecurringService.addProxy(this.account, this.selectedProxy);
						else await RecurringService.removeProxies([this.account]);
					} else {
						await RecurringService.removeProxies([this.account])
					}

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
	@import "../../../styles/variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 250px);
	}

	.auto-vote {
		max-width:600px;
		margin:0 auto;
		display:flex;
		justify-content: center;

		.switch {

		}

		.details {
			padding-left:20px;
		}
	}

</style>
