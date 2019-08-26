<template>
	<section class="pop-in import-key">

		<section>


			<!-- SELECT IMPORT TYPE -->
			<section class="select-type" v-if="state === STATES.SELECT_TYPE">
				<section class="head">
					<Key />
					<br>
					<br>
					<figure class="title">Import Keypair</figure>
				</section>
				<br>
				<br>

				<section class="type-selector">
					<section class="types">
						<section class="type" v-for="type in importTypes" @click="type.onClick()">
							<figure class="type-icon" :class="type.icon"></figure>
							<figure class="type-text">{{type.text}}</figure>
						</section>
					</section>
				</section>

			</section>


			<!-- IMPORT KEY -->
			<section v-if="state === STATES.IMPORT_KEY">
				<ImportPrivateKey v-if="importType === IMPORT_TYPES.TEXT" return-only="1" v-on:key="x => privateKey = x" />
				<ImportHardwareKey v-if="importType === IMPORT_TYPES.HARDWARE" v-on:key="finishImporting" />
				<ImportQRKey v-if="importType === IMPORT_TYPES.QR" v-on:key="finishImporting" />
			</section>


			<!-- SELECT BLOCKCHAIN (optionally required) -->
			<section class="select-type type-selector" v-if="state === STATES.SELECT_BLOCKCHAIN">
				<section class="types">
					<section class="type" v-for="blockchain in blockchains" @click="selectBlockchain(blockchain)">
						<figure class="type-icon" :class="`token-${blockchain}-${blockchain}`"></figure>
						<figure class="type-text">{{blockchainName(blockchain)}}</figure>
					</section>
				</section>
			</section>


			<ActionBar v-if="buttonsLeft.length || buttonsRight.length" :buttons-left="buttonsLeft" :buttons-right="buttonsRight" /> <!--  :buttons-right="[{text:'Save Key', blue:true, click:() => saveKeypair()}]" -->
		</section>




		<!--<ImportPrivateKey />-->
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import ImportPrivateKey from '../../panels/keypair/ImportPrivateKey';
	import ImportHardwareKey from '../../panels/keypair/ImportHardwareKey';
	import KeyPairService from "@walletpack/core/services/secure/KeyPairService";
	import Keypair from "@walletpack/core/models/Keypair";
	import AccountService from "@walletpack/core/services/blockchain/AccountService";
	import BalanceService from "@walletpack/core/services/blockchain/BalanceService";
	import ImportQRKey from "../../panels/keypair/ImportQRKey";
	import Key from '../../../components/svgs/Key'
	import * as UIActions from "../../../store/ui_actions";

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
			ImportQRKey,
			ImportPrivateKey,
			ImportHardwareKey,
			Key
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

			options(){
				return this.popin.data.props.options;
			},

			buttonsLeft(){
				if(!this.options.forSignup) {
					if(this.state === STATES.SELECT_TYPE){
						return [{text:'Cancel', click:() => this.returnResult(null)}];
					} else {
						return [{text:'Back', click:() => this.state = STATES.SELECT_TYPE}];
					}

				} else {
					if(this.state === STATES.SELECT_TYPE) return [];
					return [{text:'Back', click:() => this.state = STATES.SELECT_TYPE}];
				}
			},

			buttonsRight(){
				if(this.options.forSignup) return [{text:'Skip', click:() => this.returnResult(false)}];
				return [];
			},

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
				this.popin.data.callback(this.keypair);
				this[UIActions.RELEASE_POPUP](this.popin);
			},

			selectImportType(type){
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

				this.keypair = keypair;

				const blockchains = KeyPairService.getImportedKeyBlockchains(key);
				if(blockchains.length === 1){
					this.selectBlockchain(blockchains[0]);
				} else {
					this.blockchains = blockchains;
					this.state = STATES.SELECT_BLOCKCHAIN;
					this.setWorkingScreen(false);
				}
			},

			async selectBlockchain(blockchain){
				this.keypair.blockchains = [blockchain];
				await KeyPairService.makePublicKeys(this.keypair);
				if(!this.keypair.publicKeys.find(x => x.blockchain === blockchain)) {
					this.error = 'Invalid Private Key';
					this.setWorkingScreen(false);
					return;
				}
				this.keypair.setName();
				this.finishImporting(this.keypair);
			},

			async finishImporting(keypair){
				await KeyPairService.saveKeyPair(keypair);
				await AccountService.importAllAccounts(keypair, false, keypair.blockchains);
				BalanceService.loadAllBalances(true);
				this.setWorkingScreen(false);
				this.returnResult(keypair);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
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


		}

	}

</style>