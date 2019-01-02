<template>
	<section>
		<section class="full-panel center-fold inner with-action">
			<section class="centered">
				<h1>EOS Key Created</h1>
				<br>
				<img class="eos-logo" src="../../../assets/create_eos.png" />
				<br>
				<br>

				<section style="max-width:500px;">
					You can either click the button below to create an EOS Account on top of the key you just created or click the Back button above
					to go back to the dashboard.
					<br>
					<br>
					<br>
					<btn text="Copy Private Key" style="width:auto;" red="1" v-on:clicked="copyPrivateKey()" />
				</section>
			</section>

			<section class="action-bar short bottom centered" style="border-top:0;">
				<btn :text="locale(langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountButton)" blue="1" v-on:clicked="createAccount()" />
			</section>
			<!--<FullWidthRow :items="keysItems" />-->
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import {Blockchains} from "../../../models/Blockchains";
	import FullWidthRow from '../../reusable/FullWidthRow';
	import Keypair from "../../../models/Keypair";
	import KeyPairService from "../../../services/KeyPairService";
	import IdGenerator from "../../../util/IdGenerator";
	import ElectronHelpers from "../../../util/ElectronHelpers";
	import Crypto from "../../../util/Crypto";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";

	export default {
		components:{
			FullWidthRow,
		},
		data () {return {
			keypair:null,
		}},

		created(){
			setTimeout(async () => {
				const keypair = Keypair.placeholder([Blockchains.EOSIO]);
				await KeyPairService.generateKeyPair(keypair);
				await KeyPairService.makePublicKeys(keypair);
				keypair.name = `EOS-${IdGenerator.text(5)}`;
				await KeyPairService.saveKeyPair(keypair);
				this.$emit('keys', [keypair.id]);
				this.keypair = keypair;
				this.setWorkingScreen(false);
			});
		},

		computed:{
			...mapState([
				'seed',
			]),
			...mapGetters([
				'keypairs',
				'accounts',
				'networks',
			]),
		},

		methods:{
			copyPrivateKey(){
				const privateKey = Crypto.bufferToPrivateKey(this.keypair.privateKey, Blockchains.EOSIO);
				const publicKey = this.keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key;
				ElectronHelpers.copy(`\nPrivate: ${privateKey} \nPublic: ${publicKey}`);
			},
			createAccount(){
				const publicKey = this.keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key;
				PopupService.push(Popup.eosCreateAccount(
					publicKey,
					publicKey,
					this.keypair.id,
					this.keypair.id,
				))
			},

			...mapActions([
				Actions.HIDE_BACK_BTN
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.eos-logo {
		margin-bottom:10px;
	}

	.panel {
		flex:1;
		position: relative;
		display:flex;
		flex-direction: column;

		.padded {
			padding:30px;
		}
	}

	.input-button {
		display:flex;
		flex-direction: row;
		align-items: center;

		section {
			flex:5;
		}

		button {
			flex:1;
			margin-left:10px;
		}
	}


</style>