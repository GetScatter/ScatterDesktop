<template>
	<section>
		<section class="panel-container limited" v-if="!creatingAccount">
			<section class="centered">
				<!--<h1>Your EOS Keys</h1>-->
				<img class="eos-logo" src="../../../assets/create_eos.png" />
				<br>
				<br>
				<section class="disclaimer red">
					<b>{{locale(langKeys.ADD_KEYS.EOS_KEYS.DisclaimerTitle)}}</b>
					<p>{{locale(langKeys.ADD_KEYS.EOS_KEYS.DisclaimerSubtitle)}}</p>
				</section>
				<br>
				<br>
			</section>
			<FullWidthRow :items="keysItems" />
		</section>

		<CreateEosAccount v-if="creatingAccount"
		                  :owner-id="ownerId"
		                  :active-id="activeId"
		                  :active-public-key="activePublicKey"
		                  :owner-public-key="ownerPublicKey" />


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import {Blockchains} from "../../../models/Blockchains";
	import CreateEosAccount from '../../panels/keypair/CreateEosAccount';
	import FullWidthRow from '../../reusable/FullWidthRow';
	import Keypair from "../../../models/Keypair";
	import KeyPairService from "../../../services/KeyPairService";
	import IdGenerator from "../../../util/IdGenerator";
	import ElectronHelpers from "../../../util/ElectronHelpers";
	import Crypto from "../../../util/Crypto";

	export default {
		components:{
			FullWidthRow,
			CreateEosAccount
		},
		data () {return {
			keysItems:[],
			ownerPublicKey:'',
			activePublicKey:'',
			ownerId:null,
			activeId:null,
			copied:{},
			copiedAll:false,
			creatingAccount:false,
		}},

		created(){
			this[Actions.HIDE_BACK_BTN](true);
			setTimeout(async () => {
				const keypairs = [...new Array(2)].map(() => Keypair.placeholder([Blockchains.EOSIO]));
				await Promise.all(keypairs.map(KeyPairService.generateKeyPair));
				await Promise.all(keypairs.map(KeyPairService.makePublicKeys));

				const [active, owner] = keypairs;

				const randomName = IdGenerator.text(5);
				active.name = `EOS-Active-${randomName}`;
				owner.name = `EOS-Owner-${randomName}`;

				// await KeyPairService.saveKeyPair(active);
				// await KeyPairService.saveKeyPair(owner);

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
								name:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CopyButton),
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
								name:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CopyButton),
								handler:() => this.copy('active'),
								important:true
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

				this.copied[keyType] = true;
				if(!this.copiedAll && Object.keys(this.copied).length === 2) {
					this.copiedAll = true;
					this[Actions.HIDE_BACK_BTN](false);
					this.keysItems.push({
						id:'purchase',
						icon:'',
						title:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountTitle),
						description:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountDescription),
						actions:[
							{
								name:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.CreateEosAccountButton),
								handler:() => this.creatingAccount = true
							}
						]
					})
				}

				if(keyType === 'owner'){
					item.actions = [{name:this.locale(this.langKeys.ADD_KEYS.EOS_KEYS.DeleteButton), handler:this.deleteOwner, red:true, important:true}]
				} else {
					item.actions = [{icon:'icon-check', name:'', handler:() => this.copy(keyType), blue:true}];
				}

				let keypair = this.keypairs.find(x => x.id === this[keyType+'Id']);
				keypair.decrypt(this.seed);
				this.copyPrivateKey(keypair.privateKey);
				keypair = null;
			},
			copyPrivateKey(privateKey){
				ElectronHelpers.copy(Crypto.bufferToPrivateKey(privateKey, Blockchains.EOSIO));
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