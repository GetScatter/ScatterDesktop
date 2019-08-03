<template>
	<section>
		<section class="edit-network" v-if="network">

			<section class="panel-switch" v-if="canEditOrShowToken">
				<figure class="button" :class="{'active':state === STATES.NETWORK}" @click="state = STATES.NETWORK">
					Network
				</figure>
				<figure class="button" :class="{'active':state === STATES.TOKEN}" @click="state = STATES.TOKEN">
					System Token
				</figure>
			</section>

			<figure style="height:20px;" v-if="!canEditOrShowToken"></figure>


			<section v-if="state === STATES.NETWORK">
				<Input label="Name"
				       v-if="isNew"
				       placeholder="Add a memorable name"
				       :text="network.name"
				       v-on:changed="x => network.name = x" />

				<section class="split-inputs">
					<Input style="flex:2; margin-bottom:0;" label="Host"
					       placeholder="127.0.0.1"
					       :text="network.host"
					       v-on:changed="x => network.host = x" />

					<section style="flex:1;">
						<label>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.ProtocolLabel)}}</label>
						<Select style="flex:1; margin-top:12px;" bordered="1"
						        :selected="network.protocol"
						        :options="['http', 'https']"
						        v-on:selected="x => network.protocol = x" />
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

				<section style="text-align:right" v-if="!brandNew">
					<Button text="Update network details" blue="1" @click.native="$emit('save')" />
				</section>
			</section>

			<section v-if="state === STATES.TOKEN">
				<section style="margin-top:10px; text-align:left;" v-if="network && (isNew || network.token)">
					<section class="custom-token-info" v-if="isNew">
						<section style="padding-right:50px;">
							<label>Network System Token</label>
							<p>Some networks use a custom system token instead of the default system token (like ETH, EOS, or TRX).</p>
						</section>
						<Switcher style="flex:0 0 auto;" :state="network.token" v-on:switched="useCustomToken" />
					</section>

					<section v-if="canEditOrShowToken">
						<section class="split-inputs" v-if="network.token">
							<Input style="flex:1; margin-bottom:0;"
							       :placeholder="contractPlaceholder"
							       :text="network.token.contract"
							       :disabled="!isNew"
							       v-on:changed="x => network.token.contract = x"
							       :label="locale(langKeys.GENERIC.Contract)" />
							<Input style="flex:0.5; margin-bottom:0;" placeholder="XXX"
							       :label="locale(langKeys.GENERIC.Symbol)"
							       :text="network.token.symbol"
							       :disabled="!isNew"
							       v-on:changed="x => network.token.symbol = x" />
							<Input style="flex:0.5; margin-bottom:0;" placeholder="4" type="number"
							       :label="locale(langKeys.GENERIC.Decimals)"
							       :disabled="!isNew"
							       :text="network.token.decimals" v-on:changed="x => network.token.decimals = x" />
						</section>
					</section>
				</section>
			</section>


		</section>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import Token from "../../models/Token";
	import PluginRepository from '../../plugins/PluginRepository'
	import Network from "../../models/Network";

	const STATES = {
		NETWORK:'network',
		TOKEN:'token',
	}

	export default {
		props:['original', 'brandNew'],
		data(){return {
			state:STATES.NETWORK,
			STATES,

			network:null
		}},
		mounted(){
			this.network = this.original ? this.original.clone() : Network.placeholder();
		},
		computed:{
			...mapGetters([
				'networks',
			]),
			isNew(){
				if(!this.network) return false;
				if(this.brandNew) return true;
				return !this.networks.find(x => x.id === this.network.id);
			},
			contractPlaceholder(){
				return PluginRepository.plugin(this.network.token.blockchain).contractPlaceholder();
			},
			canEditOrShowToken(){
				return this.isNew || this.network.token;
			}
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
		padding:0 20px 20px;
		border-radius:$radius;
		margin-top:20px;
		width:100%;
		max-width:500px;

		.select {
			text-align:left;
		}

		.custom-token-info {
			display:flex;
			flex-direction: row;
			align-items: center;
			margin-bottom:20px;
		}
	}


</style>