<template>
	<section>
		<section class="edit-network" v-if="network">
			<Input :label="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.HostLabel)"
			       placeholder="127.0.0.1"
			       :text="network.host"
			       v-on:changed="x => network.host = x" />

			<section class="split-inputs">

				<section style="flex:1;">
					<label>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.ProtocolLabel)}}</label>
					<Select style="flex:1; margin-top:5px;" bordered="1"
					        :selected="network.protocol"
					        :options="['http', 'https']"
					        v-on:changed="x => network.protocol = x" />
				</section>

				<Input style="flex:1; margin-bottom:0;"
				       :label="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.PortLabel)"
				       placeholder="443"
				       type="number"
				       :text="network.port > 0 ? network.port : ''"
				       v-on:changed="x => network.port = x" />
			</section>

			<br>

			<Input :label="locale(langKeys.GENERIC.ChainID)"
			       :disabled="!isNew"
			       placeholder="x..."
			       :text="network.chainId"
			       :dynamic-button="!isNew ? null : 'icon-globe-1'"
			       :dynamic-tooltip="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.ChainIdTooltip)"
			       :copy="!isNew"
			       v-on:dynamic="fetchChainId"
			       v-on:changed="x => network.chainId = x" />

			<br>
			<section class="action-box top-pad" style="margin-top:10px;" v-if="network && (isNew || network.token)">
				<label>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenLabel)}}</label>
				<section v-if="isNew">
					<p>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenDescription)}}</p>
					<Switcher :state="network.token" v-on:switched="useCustomToken" />
				</section>
				<section v-else>
					<p>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.UsingCustomSystemToken)}}</p>
				</section>

				<section v-if="network.token">
					<br>
					<Input style="flex:1; margin-bottom:0;"
					       :placeholder="contractPlaceholder"
					       :text="network.token.contract"
					       :disabled="!isNew"
					       v-on:changed="x => network.token.contract = x"
					       :label="locale(langKeys.GENERIC.Contract)" />
					<br>
					<section class="split-inputs">
						<Input :disabled="!isNew" placeholder="XXX"
						       :label="locale(langKeys.GENERIC.Symbol)"
						       :text="network.token.symbol"
						       v-on:changed="x => network.token.symbol = x" />
						<Input :disabled="!isNew" placeholder="4" type="number"
						       :label="locale(langKeys.GENERIC.Decimals)"
						       :text="network.token.decimals" v-on:changed="x => network.token.decimals = x" />
					</section>
				</section>
			</section>


			<section style="text-align:right">
				<Button text="Update Network Settings" blue="1" @click.native="$emit('save')" />
			</section>
		</section>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import Token from "../../models/Token";
	import PluginRepository from '../../plugins/PluginRepository'

	export default {
		props:['original'],
		data(){return {
			network:null
		}},
		mounted(){
			this.network = this.original.clone();
		},
		computed:{
			...mapGetters([
				'networks',
			]),
			isNew(){
				if(!this.network) return false;
				return !this.networks.find(x => x.id === this.network.id);
			},
			contractPlaceholder(){
				return PluginRepository.plugin(this.network.token.blockchain).contractPlaceholder();
			},
		},
		methods:{
			async fetchChainId(){
				this.network.chainId = await PluginRepository.plugin(this.network.blockchain).getChainId(this.network);
			},
			useCustomToken(){
				if(this.network.token) return this.network.token = null;

				const token = Token.placeholder();
				token.blockchain = this.network.blockchain;
				this.network.token = token;
			},
		},
		watch:{
			['network'](){
				this.$emit('updated', this.network);
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";


	.edit-network {
		padding:20px;
		border-radius:$radius;
		border:1px solid $border;
		margin-top:20px;
	}


</style>