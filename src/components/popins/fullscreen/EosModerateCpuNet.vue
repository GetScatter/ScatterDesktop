<template>
	<section class="pop-in">
		<section>
			<section class="head">
				<figure class="icon font icon-network"></figure>
				<figure class="subtitle">{{account.sendable()}}</figure>
				<figure class="title">CPU & NET</figure>
			</section>

			<section class="panel-switch">
				<figure class="button" :class="{'active':state === STATES.STAKE}" @click="switchState(STATES.STAKE)">
					{{locale(langKeys.POPINS.FULLSCREEN.EOS.MOD_CPUNET.Stake)}}
				</figure>
				<figure class="button" :class="{'active':state === STATES.UNSTAKE}" @click="switchState(STATES.UNSTAKE)">
					{{locale(langKeys.POPINS.FULLSCREEN.EOS.MOD_CPUNET.Unstake)}}
				</figure>
			</section>

			<section class="resource-moderator">
				<section class="split-inputs">
					<section class="split-inputs" style="width:300px;">
						<Input label="CPU"
						       type="number"
						       v-on:changed="x => cpu = x"
						       :text="cpu" />
						<Input label="NET"
						     type="number"
						     v-on:changed="x => net = x"
						     :text="net" />
					</section>

					<section style="flex:1;"></section>

					<section style="width:200px; align-self: flex-end;">
						<Input v-if="state === STATES.STAKE"
						     :label="locale(langKeys.POPINS.FULLSCREEN.EOS.Available, systemToken.symbol)" :disabled="true"
						     :text="parseFloat(balance - cpu - net).toFixed(systemToken.decimals)"
						     v-on:changed="" />

						<Input v-if="state === STATES.UNSTAKE"
						     :label="locale(langKeys.POPINS.FULLSCREEN.EOS.Reclaiming, systemToken.symbol)" :disabled="true"
						     :text="parseFloat(cpu + net).toFixed(systemToken.decimals)"
						     v-on:changed="" />
					</section>

				</section>

				<section v-if="state === STATES.STAKE">
					<section class="split-inputs">
						<figure class="resource">CPU</figure>
						<Slider :min="0" :max="balance - this.net" step="0.0001" :value="cpu" v-on:changed="x => cpu = x" />
					</section>
					<section class="split-inputs">
						<figure class="resource">NET</figure>
						<Slider :min="0" :max="balance - this.cpu" step="0.0001" :value="net" v-on:changed="x => net = x" />
					</section>
				</section>

				<section v-if="state === STATES.UNSTAKE">
					<section class="split-inputs">
						<figure class="resource">CPU</figure>
						<Slider :min="-availableCPU" :max="0" step="0.0001" :value="-cpu" v-on:changed="x => cpu = Math.abs(x)" />
						<figure class="resource">{{parseFloat(availableCPU - cpu).toFixed(this.account.network().systemToken().decimals)}}</figure>
					</section>
					<section class="split-inputs">
						<figure class="resource">NET</figure>
						<Slider :min="-availableNET" :max="0" step="0.0001" :value="-net" v-on:changed="x => net = Math.abs(x)" />
						<figure class="resource">{{parseFloat(availableNET - net).toFixed(this.account.network().systemToken().decimals)}}</figure>
					</section>
				</section>
			</section>


		</section>

		<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:locale(langKeys.GENERIC.Confirm), red:true, click:() => stakeOrUnstake()}]" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import {Blockchains} from "../../../models/Blockchains";
	import PluginRepository from "../../../plugins/PluginRepository";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import HistoricAction from "../../../models/histories/HistoricAction";

	const STATES = {
		STAKE:'stake',
		UNSTAKE:'unstake',
	}

	export default {
		props:['popin'],
		data () {return {
			state:STATES.STAKE,
			STATES,

			balance:0,

			cpu:0,
			net:0,
		}},
		created(){
			this.init()
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

			systemToken(){
				return this.account.network().systemToken();
			},

			availableCPU(){
				if(!this.accountData) return 0;
				if(!this.accountData.self_delegated_bandwidth) return 0;
				return this.accountData.self_delegated_bandwidth.cpu_weight.split(' ')[0];
			},
			availableNET(){
				if(!this.accountData) return 0;
				if(!this.accountData.self_delegated_bandwidth) return 0;
				return this.accountData.self_delegated_bandwidth.net_weight.split(' ')[0];
			},

		},
		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			stakeOrUnstake(){
				if(this.cpu < 0 || this.net < 0) return null;
				if(this.cpu <= 0 && this.net <= 0) return null;

				this.setWorkingScreen(true);

				const cpu = `${parseFloat(this.cpu).toFixed(this.systemToken.decimals)} ${this.systemToken.symbol}`;
				const net = `${parseFloat(this.net).toFixed(this.systemToken.decimals)} ${this.systemToken.symbol}`;

				const isStaking = this.state === STATES.STAKE;
				PluginRepository.plugin(Blockchains.EOSIO).stakeOrUnstake(this.account, cpu, net, this.account.network(), isStaking).then(res => {
					this.setWorkingScreen(false);
					if(!res || !res.hasOwnProperty('transaction_id')) {
						return false;
					}
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, res.transaction_id));
					const history = new HistoricAction(this.account, isStaking ? 'delegatebw' : 'undelegatebw', res.transaction_id);
					this[Actions.DELTA_HISTORY](history);
					this.returnResult(res);
				}).catch(err => {
					this.setWorkingScreen(false);
				})

			},

			async init(){
				this.setWorkingScreen(false);
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const network = this.account.network();
				const token = this.systemToken;
				this.balance = await plugin.balanceFor(this.account, token);

				plugin.accountData(this.account).then(data => {
					this.accountData = data;
				});
			},



			switchState(state){
				this.state = state;
				this.cpu = 0;
				this.net = 0;

			},

			...mapActions([
				Actions.RELEASE_POPUP,
				Actions.DELTA_HISTORY,
			])
		},
		watch:{
			['ram.quantity'](){
				if(!this.ram.quantity.toString().length) this.ram.quantity = 0;
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 240px);
	}

	.resource-moderator {
		.input {
			margin-bottom:0;
		}
	}

	.resource {
		font-size: 11px;
		font-weight: bold;
		color:$mid-dark-grey;
		flex:0 0 auto;
		margin:20px 10px 0;
		max-width:150px;

		&:first-child {
			margin-left:0;
		}

		&:last-child {
			margin-right:0;
			min-width:50px;
			text-align:right;
		}
	}


</style>