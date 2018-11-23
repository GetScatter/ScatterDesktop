<template>
	<section>
		<sel :selected="hardwareType" label="Select a Hardware Wallet"
		     :options="EXT_WALLET_TYPES_ARR" v-on:changed="(x) => hardwareType = x"></sel>

		<section v-if="availableBlockchains.length">
			<br>
			<sel :selected="blockchain" label="Available Blockchains"
			     :parser="x => blockchainName(x)"
			     :options="availableBlockchains"
			     v-on:changed="(x) => blockchain = x"></sel>
		</section>


		<br>

		<cin v-if="hardwareType === EXT_WALLET_TYPES.LEDGER" label="Ledger Key/Address Index"></cin>

		<section class="action-bar-holder">
			<section class="action-bar short bottom centered">
				<btn v-on:clicked="importKey" blue="1"
				     style="width:300px;"
				     text="Import Key"></btn>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import ExternalWallet, {EXT_WALLET_TYPES, EXT_WALLET_TYPES_ARR} from '../../../../models/hardware/ExternalWallet';
	import {Blockchains, BlockchainsArray} from "../../../../models/Blockchains";
	import Keypair from "../../../../models/Keypair";
	import KeyPairService from "../../../../services/KeyPairService";
	import PopupService from "../../../../services/PopupService";
	import {Popup} from "../../../../models/popups/Popup";

	export default {
		data(){return {
			hardwareType:EXT_WALLET_TYPES.LEDGER,
			EXT_WALLET_TYPES,
			EXT_WALLET_TYPES_ARR,
			blockchain:Blockchains.EOSIO,
			external:null,
		}},

		created(){
			this.external = new ExternalWallet(this.hardwareType, this.blockchain);
			this.external.interface.open();
		},

		computed:{
			...mapGetters([
				'keypairs'
			]),
			availableBlockchains(){
				if(!this.external) return [];
				if(typeof this.external.interface.availableBlockchains === 'undefined') return [];
				return this.external.interface.availableBlockchains();
			}
		},

		methods:{
			async importKey(){
				const keypair = Keypair.placeholder();
				keypair.external = this.external;
				if(await KeyPairService.loadFromHardware(keypair)) {
					const found = this.keypairs.find(x => x.keyHash === keypair.keyHash);
					if(this.keypairs.find(x => x.keyHash === keypair.keyHash))
						return this.$router.push({name:this.RouteNames.KEYPAIR, params:{id:found.id}});

					setTimeout(() => {
						this.setWorkingScreen(true);
						this.$emit('keypair', keypair);
					}, 1);
				} else {
					const Messages = {
						[EXT_WALLET_TYPES.LEDGER]:`You need to unlock your ledger and open the ${this.blockchainName(this.blockchain)} Ledger App.`,
						[EXT_WALLET_TYPES.LIQUID_EOS]:`You need to unlock your Liquid EOS Hardware Wallet.`
					}
					PopupService.push(Popup.prompt(
						'Hardware Error',
						Messages[this.hardwareType],
						'attention',
						'Okay'
					))
				}
			}
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">

	.action-bar-holder {
		position:fixed;
		bottom:0;
		left:0;
		right:0;
	}
	
</style>