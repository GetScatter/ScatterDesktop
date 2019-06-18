<template>
	<section class="pop-in">
		<section v-if="identity">
			<section class="head">
				<figure class="icon font icon-key"></figure>
				<figure class="title">Identity Authentication Key</figure>
			</section>

			<section class="key-details">
				<label>Private Key</label>
				<Input :text="privateKey" />
			</section>

			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="buttonsRight" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import KeyPairService from "../../../services/secure/KeyPairService";
	import {Blockchains} from "../../../models/Blockchains";
	import RIDLService from "../../../services/apis/RIDLService";
	import Keypair from "../../../models/Keypair";
	import PluginRepository from "../../../plugins/PluginRepository";

	export default {
		props:['popin'],
		data () {return {
			privateKey:'',
			originalPrivateKey:'',
			identity:null,
		}},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([

			]),
			buttonsRight(){
				return [
					{text:'Generate Random Key', click:() => this.randomKey()},
					{text:'Save New Key', blue:true, click:() => this.saveIdentityPrivateKey()},
				]
			},
		},
		mounted(){
			this.identity = this.popin.data.props.identity.clone();
			KeyPairService.publicToPrivate(this.identity.publicKey).then(key => {
				this.privateKey = key;
				this.originalPrivateKey = key;
			})
		},
		methods:{
			returnResult(){
				this.popin.data.callback(true);
				this[Actions.RELEASE_POPUP](this.popin);
			},

			async randomKey(){
				const keypair = Keypair.placeholder();
				await KeyPairService.generateKeyPair(keypair);
				this.privateKey = await PluginRepository.plugin(Blockchains.EOSIO).bufferToHexPrivate(keypair.privateKey);
			},


			async saveIdentityPrivateKey(){
				if(this.privateKey === this.originalPrivateKey) return this.returnResult(false);

				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				const publicKey = plugin.privateToPublic(this.privateKey);

				// if(this.identity.id === this.identity.ridl){
				// 	if(!await RIDLService.changeKey(this.identity.name, publicKey)) return;
				// } else this.identity.ridl = -1;

				this.identity.privateKey = this.privateKey;
				this.identity.publicKey = publicKey;

				const scatter = this.scatter.clone();
				scatter.keychain.updateOrPushIdentity(this.identity);
				await this[Actions.SET_SCATTER](scatter);

				this.returnResult(true);
			},

			...mapActions([
				Actions.RELEASE_POPUP,
				Actions.SET_SCATTER,
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.key-details {
		width:500px;
		margin-top:40px;
	}


</style>