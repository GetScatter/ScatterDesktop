<template>
	<section>
		<section class="panel-container limited">
			<section class="centered">
				<!--<h1>Your EOS Keys</h1>-->
				<img class="eos-logo" src="../../../assets/create_eos.png" />
				<br>
				<br>
				<br>
			</section>
			<FullWidthRow :items="keysItems" />
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
			keysItems:[],
			ownerPublicKey:'',
			activePublicKey:'',
			ownerId:null,
			activeId:null,
		}},

		created(){
			// this[Actions.HIDE_BACK_BTN](true);
			setTimeout(async () => {
				const keypairs = [...new Array(2)].map(() => Keypair.placeholder([Blockchains.EOSIO]));
				await Promise.all(keypairs.map(KeyPairService.generateKeyPair));
				await Promise.all(keypairs.map(KeyPairService.makePublicKeys));

				const [active, owner] = keypairs;

				const randomName = IdGenerator.text(5);
				active.name = `EOS-Active-${randomName}`;
				owner.name = `EOS-Owner-${randomName}`;

				await KeyPairService.saveKeyPair(active);
				await KeyPairService.saveKeyPair(owner);

				this.$emit('keys', [active.id, owner.id]);

				this.ownerPublicKey = owner.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key;
				this.activePublicKey = active.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key;
				this.ownerId = owner.id;
				this.activeId = active.id;

				this.keysItems = [
					{
						id:'owner',
						icon:'',
						title:owner.name,
						description:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.OwnerDescription),
						actions:[
							{
								name:this.locale(this.langKeys.GENERIC.Copy),
								handler:() => this.copy('owner'),
								important:true
							}
						]
					},
					{
						id:'active',
						icon:'',
						title:active.name,
						description:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.ActiveDescription),
						actions:[
							{
								name:this.locale(this.langKeys.GENERIC.Copy),
								handler:() => this.copy('active'),
								important:true
							}
						]
					},
					{
						id:'purchase',
						icon:'',
						title:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountTitle),
						description:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountDescription),
						actions:[
							{
								name:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountButton),
								handler:() => {
									PopupService.push(Popup.eosCreateAccount(
										this.activePublicKey,
										this.ownerPublicKey,
										this.activeId,
										this.ownerId,
									))
								}
							}
						]
					}
				];


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
			copy(keyType){
				const item = this.keysItems.find(x => x.id === keyType);
				if(!item) return;

				if(keyType === 'owner'){
					item.actions = [{name:this.locale(this.langKeys.GENERIC.Remove), handler:this.deleteOwner, red:true, important:true}]
				} else {
					item.actions = [{icon:'icon-check', name:'', handler:() => this.copy(keyType), blue:true}];
				}

				let keypair = this.keypairs.find(x => x.id === this[keyType+'Id']);
				keypair.decrypt(this.seed);
				const publicKey = keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key;
				this.copyPrivateKey(keyType, keypair.privateKey, publicKey);
				keypair = null;
			},
			copyPrivateKey(keyType, privateKeyBuffer, publicKey){
				const privateKey = Crypto.bufferToPrivateKey(privateKeyBuffer, Blockchains.EOSIO);
				ElectronHelpers.copy(`${keyType}\nPrivate: ${privateKey} \nPublic: ${publicKey}`);
			},
			async deleteOwner(){
				await KeyPairService.removeKeyPair(this.keypairs.find(x => x.id === this.ownerId));
				this.keysItems = this.keysItems.filter(x => x.id !== 'owner');
			},

			...mapActions([
				Actions.HIDE_BACK_BTN
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../_variables";

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