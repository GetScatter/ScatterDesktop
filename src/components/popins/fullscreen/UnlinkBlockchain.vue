<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel center-fold inner with-action limited">
			<section class="head">
				<figure class="icon icon-trash"></figure>
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.UNLINK_BLOCKCHAIN.Title)}}</figure>
				<p>{{blockchainName(blockchain)}}</p>

				<br>
				<section class="disclaimer less-pad red">
					{{locale(langKeys.POPINS.FULLSCREEN.UNLINK_BLOCKCHAIN.Disclaimer)}}
				</section>
			</section>

		</section>
		<section class="action-bar short bottom centered">
			<btn :text="locale(langKeys.GENERIC.Confirm)"
				 blue="1" v-on:clicked="unlink" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import {Blockchains} from "../../../models/Blockchains";
	import FlatList from '../../reusable/FlatList';
	import AccountService from "../../../services/AccountService";
	import KeyPairService from "../../../services/KeyPairService";
	import BalanceService from "../../../services/BalanceService";

	export default {
		props:['popin'],
		components:{
			FlatList
		},
		data () {return {
			selectedAuthorities:[],
		}},
		mounted(){

		},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'keypairs',
				'accounts',
			]),
			blockchain(){
				return this.popin.data.props.blockchain;
			},
			keypair(){
				return this.popin.data.props.keypair;
			}
		},
		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async unlink(){
				this.setWorkingScreen(true);
				await KeyPairService.addOrRemoveBlockchain(this.keypair, this.blockchain);
				await Promise.all(this.keypair.accounts(true).map(account => {
					return BalanceService.loadBalancesFor(account);
				}));

				this.setWorkingScreen(false);
				this.returnResult(true);
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
		height: calc(100vh - 240px);
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

	.list {
		max-width:700px;
		width:100%;
		text-align:left;

	}

</style>
