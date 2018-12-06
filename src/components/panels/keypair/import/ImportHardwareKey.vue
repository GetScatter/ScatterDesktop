<template>
	<section>
		<sel :selected="hardwareType"
		     :label="locale(langKeys.ADD_KEYS.IMPORT_HW.SelectHardwareLabel)"
		     :options="EXT_WALLET_TYPES_ARR"
		     v-on:changed="changeHardwareType" />

		<section v-if="availableBlockchains.length > 1">
			<br>
			<sel :selected="blockchain"
			     :label="locale(langKeys.ADD_KEYS.IMPORT_HW.AvailableBlockchainsLabel)"
			     :parser="x => blockchainName(x)"
			     :options="availableBlockchains"
			     v-on:changed="selectBlockchain" />
		</section>


		<br>

		<cin v-if="external && hardwareType === EXT_WALLET_TYPES.LEDGER"
		     big="1"
		     :text="external.addressIndex"
		     v-on:changed="x => external.addressIndex = x"
		     type="number"
		     :label="locale(langKeys.ADD_KEYS.IMPORT_HW.IndexLabel)" />

		<section class="action-bar-holder">
			<section class="action-bar short bottom centered">
				<btn v-on:clicked="importKey" blue="1"
				     :loading="importing"
				     :disabled="importing"
				     style="width:300px;"
				     :text="locale(langKeys.ADD_KEYS.SELECT.ImportButton)" />
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
	import HardwareService from "../../../../services/HardwareService";

	export default {
		data(){return {
			hardwareType:EXT_WALLET_TYPES.LEDGER,
			EXT_WALLET_TYPES,
			EXT_WALLET_TYPES_ARR,
			blockchain:Blockchains.EOSIO,
			external:null,
			importing:false,
		}},

		created(){
			HardwareService.openConnections(true).then(() => {
				this.external = new ExternalWallet(this.hardwareType, this.blockchain);
				this.external.interface.open();
			})

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
			resetExternal(){
				this.external = new ExternalWallet(this.hardwareType, this.blockchain);
				this.external.interface.open();
			},
			selectBlockchain(blockchain){
				this.blockchain = blockchain;
				this.resetExternal();
			},
			changeHardwareType(type){
				this.hardwareType = type;
				this.blockchain = this.availableBlockchains[0];
				this.resetExternal();
			},
			async importKey(){
				this.importing = true;
				const keypair = Keypair.placeholder();
				keypair.external = this.external;
				keypair.blockchains = [this.external.blockchain];
				if(await KeyPairService.loadFromHardware(keypair)) {
					const found = this.keypairs.find(x => x.keyHash === keypair.keyHash);
					if(this.keypairs.find(x => x.keyHash === keypair.keyHash)) {
						this.importing = false;
						return this.$router.push({name: this.RouteNames.KEYPAIR, params: {id: found.id}});
					}

					setTimeout(() => {
						this.importing = false;
						this.setWorkingScreen(true);
						this.$emit('keypair', keypair);
					}, 1);
				} else {
					this.importing = false;
					const Messages = {
						[EXT_WALLET_TYPES.LEDGER]:this.locale(this.langKeys.ADD_KEYS.IMPORT_HW.UnlockLedgerError, this.blockchainName(this.blockchain)),
						[EXT_WALLET_TYPES.LIQUID_EOS]:this.locale(this.langKeys.ADD_KEYS.IMPORT_HW.UnlockedLiquidEOSError)
					}
					PopupService.push(Popup.prompt(
						this.locale(this.langKeys.ADD_KEYS.IMPORT_HW.HardwareError),
						Messages[this.hardwareType]
					))
				}
			}
		},

		watch:{
			['external.addressIndex'](){
				this.external.interface.setAddressIndex(this.external.addressIndex);
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