<template>
	<section class="import-hardware">
		<section class="split-inputs">
			<Select :selected="hardwareType" bordered="1" style="flex:1;"
			        :label="locale(langKeys.ADD_KEYS.IMPORT_HW.SelectHardwareLabel)"
			        :options="EXT_WALLET_TYPES_ARR"
			        v-on:selected="changeHardwareType" />

			<section v-if="availableBlockchains.length > 1" style="flex:1;">
				<Select :selected="blockchain" bordered="1"
				        :label="locale(langKeys.ADD_KEYS.IMPORT_HW.AvailableBlockchainsLabel)"
				        :parser="x => blockchainName(x)"
				        :options="availableBlockchains"
				        v-on:selected="selectBlockchain" />
			</section>
		</section>

		<br>

		<Input v-if="external && hardwareType === EXT_WALLET_TYPES.LEDGER"
		     :text="external.addressIndex"
		     v-on:changed="x => external.addressIndex = x"
		     type="number"
		     :label="locale(langKeys.ADD_KEYS.IMPORT_HW.IndexLabel)" />

		<section class="key-list">
			<section class="key-row" v-for="item in availableKeys" @click="importKey(item)">
				<figure class="index">{{item.index}}</figure>
				<figure class="key">{{item.key}}</figure>
			</section>
		</section>

		<figure class="loading-keys" v-if="gettingAvailableKeys">
			<i class="icon-spin4 animate-spin"></i>
		</figure>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import ExternalWallet, {EXT_WALLET_TYPES, EXT_WALLET_TYPES_ARR} from '../../../models/hardware/ExternalWallet';
	import {Blockchains, BlockchainsArray} from "../../../models/Blockchains";
	import Keypair from "../../../models/Keypair";
	import KeyPairService from "../../../services/secure/KeyPairService";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import HardwareService from "../../../services/secure/HardwareService";

	let inputTimeout;
	export default {
		data(){return {
			hardwareType:EXT_WALLET_TYPES.LEDGER,
			EXT_WALLET_TYPES,
			EXT_WALLET_TYPES_ARR,
			blockchain:Blockchains.EOSIO,
			external:null,

			gettingAvailableKeys:false,
			availableKeys:[],
		}},

		created(){
			// TODO: ERROR CONNECTING?
			HardwareService.openConnections(true).then(() => {
				this.resetExternal();
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
				this.getKeys();
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
			async getKeys(){
				this.gettingAvailableKeys = true;

				for(let i = 0; i < 3; i++){
					const index = parseInt(this.external.addressIndex) + i;
					const alreadyAdded = this.availableKeys.find(x => x.index === index);
					if(!alreadyAdded){
						const key = await KeyPairService.getHardwareKeyList(this.external, i);
						if(key) this.availableKeys.push({ index, key });
					}


				}

				this.gettingAvailableKeys = false;
			},
			async importKey(item){
				this.setWorkingScreen(true);
				const {index, key} = item;
				const keypair = Keypair.placeholder();
				keypair.external = this.external;
				keypair.blockchains = [this.external.blockchain];

				keypair.external.addressIndex = index;
				keypair.external.publicKey = key;
				keypair.publicKeys.push({blockchain:keypair.external.blockchain, key});

				if(!keypair.isUnique()) {
					this.setWorkingScreen(false);
					return PopupService.push(Popup.snackbar('Keypair already exists'));
				}

				setTimeout(() => {
					this.$emit('key', keypair);
				}, 1);
			}
		},

		watch:{
			['external.addressIndex'](){
				this.external.interface.setAddressIndex(parseInt(this.external.addressIndex));
				clearTimeout(inputTimeout);
				inputTimeout = setTimeout(() => {
					this.getKeys()
				}, 800);
			}
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.import-hardware {
		min-width:500px;
		max-width:600px;

		.loading-keys {
			padding:5px 10px 10px;
		}

		.key-list {
			display:flex;
			flex-direction: column;

			max-height:170px;
			overflow-y: auto;
			padding:0 10px 0 0;

			.key-row {
				display:flex;
				text-align:right;
				font-size: $small;
				align-items: center;
				margin-bottom:5px;
				cursor: pointer;
				padding:5px;
				border-radius:$radius;

				.index {
					padding:5px 10px;
					background:$blue;
					color:$white;
					border-radius:$radius;
					margin-right:10px;
				}

				.key {
					flex:1;
				}

				&:hover {
					background:$lightergrey;
				}
			}
		}
	}

</style>