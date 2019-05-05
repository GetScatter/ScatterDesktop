<template>
	<section class="pop-in import-key">

		<section>
			<!--<section class="head">-->
				<!--<figure class="icon font icon-key"></figure>-->
				<!--<figure class="title">Import Keypair</figure>-->
			<!--</section>-->
			<!--<br>-->
			<!--<br>-->


			<!-- SELECT IMPORT TYPE -->
			<section class="select-type" v-if="state === STATES.SELECT_TYPE">

				<section class="import-types">
					<section class="import-type" v-for="type in importTypes" @click="type.onClick()">
						<figure class="type-icon" :class="type.icon"></figure>
						<figure class="type-text">{{type.text}}</figure>
					</section>
				</section>

			</section>


			<!-- IMPORT KEY -->
			<section v-if="state === STATES.IMPORT_KEY">
				<ImportPrivateKey v-if="importType === IMPORT_TYPES.TEXT" return-only="1" v-on:key="x => privateKey = x" />
				<ImportHardwareKey v-if="importType === IMPORT_TYPES.HARDWARE" v-on:key="finishImporting" />
			</section>


			<!-- SELECT BLOCKCHAIN (optionally required) -->
			<section class="select-type" v-if="state === STATES.SELECT_BLOCKCHAIN">
				<section class="import-types">
					<section class="import-type" v-for="blockchain in blockchains" @click="selectBlockchain(blockchain)">
						<figure class="type-icon" :class="`token-${blockchain}-${blockchain}`"></figure>
						<figure class="type-text">{{blockchainName(blockchain)}}</figure>
					</section>
				</section>
			</section>


			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" /> <!--  :buttons-right="[{text:'Save Key', blue:true, click:() => saveKeypair()}]" -->
		</section>




		<!--<ImportPrivateKey />-->
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import ImportPrivateKey from '../../panels/keypair/ImportPrivateKey';
	import ImportHardwareKey from '../../panels/keypair/ImportHardwareKey';
	import KeyPairService from "../../../services/secure/KeyPairService";
	import Keypair from "../../../models/Keypair";
	import AccountService from "../../../services/blockchain/AccountService";

	const STATES = {
		SELECT_TYPE:'selectType',
		IMPORT_KEY:'importKey',
		SELECT_BLOCKCHAIN:'selectBlockchain',
	};

	const IMPORT_TYPES = {
		TEXT:'text',
		HARDWARE:'hardware',
		QR:'qr',
	}

	export default {
		props:['popin'],
		components:{
			ImportPrivateKey,
			ImportHardwareKey
		},
		data(){return {
			STATES,
			state:STATES.SELECT_TYPE,

			IMPORT_TYPES,
			importType:null,

			privateKey:'',
			blockchains:[],
			keypair:null,
		}},
		computed:{
			...mapGetters([
				'keypairs'
			]),

			importTypes(){
				return [
					{
						icon:'icon-pencil',
						text:'Text',
						onClick:() => { this.selectImportType(IMPORT_TYPES.TEXT); },
					},
					{
						icon:'icon-microchip',
						text:'Hardware',
						onClick:() => { this.selectImportType(IMPORT_TYPES.HARDWARE); },
					},
					{
						icon:'icon-qrcode',
						text:'QR Code',
						onClick:() => { this.selectImportType(IMPORT_TYPES.QR); },
					}
				]
			}
		},
		methods:{
			saveKeypair(){},
			returnResult(){
				this.popin.data.callback(this.contact);
				this[Actions.RELEASE_POPUP](this.popin);
			},

			selectImportType(type){
				console.log(STATES.IMPORT_KEY);
				this.state = STATES.IMPORT_KEY;
				this.importType = type;
			},

			async testKey(){
				const reset = () => this.setWorkingScreen(false);

				this.keypair = null;
				this.setWorkingScreen(true);
				this.error = null;
				if(!this.privateKey || !this.privateKey.trim().length) return reset();
				const key = this.privateKey.trim().replace(/\W/g, '').replace('0x', '');
				const keypair = Keypair.placeholder();
				keypair.privateKey = key;
				if(!KeyPairService.isValidPrivateKey(keypair)) {
					this.error = 'Invalid Private Key';
					return reset();
				}

				// Buffer conversion
				await KeyPairService.convertHexPrivateToBuffer(keypair);
				keypair.hash();

				// Check duplicates
				const existing = this.keypairs.find(x => x.keyHash === keypair.keyHash);
				if(existing){
					// TODO: Back to key
					console.error('Keypair already exists');
					return reset();
				}

				this.keypair = keypair;

				const blockchains = KeyPairService.getImportedKeyBlockchains(key);
				console.log('blockchains', blockchains);
				if(blockchains.length === 1){
					this.selectBlockchain(blockchains[0]);
				} else {
					this.blockchains = blockchains;
					this.state = STATES.SELECT_BLOCKCHAIN;
					this.setWorkingScreen(false);
				}

				//
			},

			async selectBlockchain(blockchain){
				this.keypair.blockchains = [blockchain];
				await KeyPairService.makePublicKeys(this.keypair);
				this.finishImporting(this.keypair);
			},

			async finishImporting(keypair){
				await KeyPairService.saveKeyPair(keypair);
				await AccountService.importAllAccounts(keypair);
				this.setWorkingScreen(false);
				this.returnResult(keypair);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
		watch:{
			['privateKey'](){
				this.testKey();
			}
		}

	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.import-key {


		.select-type {

			.import-types {
				display:flex;
			}

			.import-type {
				width:160px;
				border-radius:$radius;
				display: flex;
				flex-direction: column;
				margin:0 20px;
				cursor: pointer;
				border:1px solid $lightgrey;
				padding:30px 0;

				.type-icon {
					font-size: 64px;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.type-text {
					margin-top:20px;
					font-size: $large;
					font-weight: bold;
				}

				&:hover {
					background:$blue;
					color:$white;
				}
			}
		}

	}

</style>