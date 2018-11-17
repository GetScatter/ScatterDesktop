<template>
	<section>
		<cin :type="keyInputType" big="1" :error="error"
		     :label="locale(langKeys.ADD_KEYS.IMPORT_TEXT.KeyLabel)"
		     :placeholder="locale(langKeys.ADD_KEYS.IMPORT_TEXT.KeyPlaceholder)"
		     :dynamic-button="eyeIcon"
		     v-on:dynamic="toggleKeyInputType"
		     :text="key" v-on:changed="x => key = x" />
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import KeyPairService from '../../../../services/KeyPairService'
	import Keypair from "../../../../models/Keypair";

	let keyTimeout;

	export default {
		data(){return {
			keyInputType:'password',
			key:'',
			error:null,
		}},
		computed:{
			...mapGetters([
				'keypairs'
			]),
			eyeIcon(){
				return 'icon-eye' + (this.keyInputType === 'password' ? '' : '-off')
			}
		},
		methods:{
			toggleKeyInputType(){
				this.keyInputType = this.keyInputType === 'password' ? 'text' : 'password';
			},
			async testKey(){
				this.error = null;
				this.key = this.key.trim().replace(/\W/g, '');

				const keypair = Keypair.placeholder();
				keypair.privateKey = this.key;

				if(!KeyPairService.isValidPrivateKey(keypair)) return;

				keypair.blockchains = KeyPairService.getImportedKeyBlockchains(this.key);
				await KeyPairService.convertHexPrivateToBuffer(keypair);
				await KeyPairService.makePublicKeys(keypair);
				keypair.hash();

				if(this.keypairs.find(x => x.keyHash === keypair.keyHash))
					return this.error = 'You already have this key imported.';

				setTimeout(() => {
					this.$emit('keypair', keypair);
				}, 1);
			}
		},
		watch:{
			['key'](){
				clearTimeout(keyTimeout);
				keyTimeout = setTimeout(async () => {
					this.testKey();
				}, 200);
			},
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>