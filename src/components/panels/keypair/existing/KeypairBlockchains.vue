<template>
	<section>
		<section class="item" v-for="blockchain in Blockchains">
			<section class="switch" :class="{'disabled':isRefreshing}" @click="addOrRemoveBlockchain(blockchain)">
				<figure class="dot" :class="{'disabled':!keypair.blockchains.includes(blockchain)}"></figure>
			</section>

			<section class="info">
				<figure class="blockchain">{{blockchainName(blockchain)}}</figure>
				<figure class="key">{{keypair.publicKeys.find(x => x.blockchain === blockchain).key}}</figure>
			</section>
			<btn small="1" text="Copy"></btn>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {Blockchains} from "../../../../models/Blockchains";
	import KeyPairService from "../../../../services/KeyPairService";
	import PriceService from "../../../../services/PriceService";
	import Process from "../../../../models/Process";

	export default {
		data(){return {
			Blockchains
		}},
		computed:{
			isRefreshing(){
				return Process.isProcessRunning(this.keypair.unique());
			}
		},
		methods:{
			async addOrRemoveBlockchain(blockchain){
				if(this.isRefreshing) return;
				await KeyPairService.addOrRemoveBlockchain(this.keypair, blockchain);
				await PriceService.getBalances();
			},
		},
		props:['keypair'],
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../../_variables";


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

		.switch {
			width:50px;
			height:34px;
			border:1px solid rgba(0,0,0,0.1);
			background:rgba(0,0,0,0.03);
			border-radius:50px;
			padding:2px;
			cursor: pointer;
			opacity:1;
			transition: all 0.2s ease;
			transition-property: opacity;

			&.disabled {
				opacity:0.2;
				cursor: not-allowed;
			}

			.dot {
				width:28px;
				height:28px;
				margin-left:0;
				border-radius:50%;
				background:$light-blue;
				background-image: linear-gradient(-180deg, #62D0FD -20%, #39ADFF 100%);

				transition: all 0.3s ease;
				transition-property: margin-left, background;

				&.disabled {
					margin-left:15px;
					background:$light-blue;
					background-image: linear-gradient(-180deg, $red -20%, #e23b3b 100%);
				}
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
				font-size: 14px;
			}
		}
	}



</style>