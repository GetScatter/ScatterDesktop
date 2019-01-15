<template>
	<section>
		<section class="item" v-for="blockchain in availableBlockchains">

			<section class="switch" :class="{'disabled':isRefreshing || isHardware}" @click="addOrRemoveBlockchain(blockchain)">
				<figure class="dot" :class="{'disabled':!keypair.blockchains.includes(blockchain)}"></figure>
			</section>

			<section class="info">
				<figure class="blockchain">{{blockchainName(blockchain)}}</figure>
				<figure class="key">{{keypair.publicKeys.find(x => x.blockchain === blockchain).key}}</figure>
			</section>

			<btn small="1"
			     v-on:clicked="copyPublicKey(keypair.publicKeys.find(x => x.blockchain === blockchain).key)"
			     :text="locale(langKeys.GENERIC.Copy)"></btn>

		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {Blockchains} from "../../../../models/Blockchains";
	import KeyPairService from "../../../../services/KeyPairService";
	import PriceService from "../../../../services/PriceService";
	import Process from "../../../../models/Process";
	import ElectronHelpers from "../../../../util/ElectronHelpers";
	import BalanceService from "../../../../services/BalanceService";
	import PopupService from "../../../../services/PopupService";
	import {Popup} from "../../../../models/popups/Popup";

	export default {
		data(){return {
			Blockchains
		}},
		computed:{
			isRefreshing(){
				return Process.isProcessRunning(this.keypair.unique());
			},
			availableBlockchains(){
				if(this.keypair.external){
					return this.keypair.external.interface.availableBlockchains()
						.filter(blockchain => this.keypair.publicKeys.find(x => x.blockchain === blockchain));
				} else return Blockchains;
			},
			isHardware(){
				return !!this.keypair.external;
			}
		},
		methods:{
			async addOrRemoveBlockchain(blockchain){
				if(this.isHardware) return;
				if(this.isRefreshing) return;

				const removing = this.keypair.blockchains.includes(blockchain);
				if(removing) PopupService.push(Popup.unlinkBlockchain(this.keypair, blockchain));
				else {
					await KeyPairService.addOrRemoveBlockchain(this.keypair, blockchain);
					await Promise.all(this.keypair.accounts(true).map(account => {
						return BalanceService.loadBalancesFor(account);
					}))
				}
			},
			copyPublicKey(key){
				ElectronHelpers.copy(key);
			}
		},
		props:['keypair'],
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../../styles/variables";


	.item {
		flex: 1;
		display: flex;
		flex-direction: row;
		padding:20px 0;
		position: relative;
		align-items: center;

		&:not(:last-child){
			&:after {
				content:'';
				display:block;
				position:absolute;
				bottom:0;
				left:-70px;
				right:-70px;
				border-bottom:1px solid rgba(0,0,0,0.07);
			}
		}

		.info {
			flex: 1;
			padding:0 40px;

			.blockchain {
				font-size: 11px;
				font-weight: bold;
				color:$mid-dark-grey;
				margin-bottom:5px;
			}

			.key {
				font-size: 11px;
			}
		}
	}



</style>