<template>
	<section>
		<cin :type="keyInputType" big="1"
		     :label="locale(langKeys.ADD_KEYS.IMPORT_TEXT.KeyLabel)"
		     :placeholder="locale(langKeys.ADD_KEYS.IMPORT_TEXT.KeyPlaceholder)"
		     :dynamic-button="eyeIcon"
		     v-on:dynamic="toggleKeyInputType"
		     :text="key" v-on:changed="x => key = x" />
	</section>
</template>

<script>

	import KeyPairService from '../../../../services/KeyPairService'
	import Keypair from "../../../../models/Keypair";

	let keyTimeout;

	export default {
		data(){return {
			keyInputType:'password',
			key:''
		}},
		computed:{
			eyeIcon(){
				return 'icon-eye' + (this.keyInputType === 'password' ? '' : '-off')
			}
		},
		methods:{
			toggleKeyInputType(){
				this.keyInputType = this.keyInputType === 'password' ? 'text' : 'password';
			},
			async testKey(){
				this.key = this.key.trim().replace(/\W/g, '');

				const keypair = Keypair.placeholder();
				keypair.privateKey = this.key;

				if(!KeyPairService.isValidPrivateKey(keypair)) return;

				keypair.blockchains = KeyPairService.getImportedKeyBlockchains(this.key);
				await KeyPairService.convertHexPrivateToBuffer(keypair);
				await KeyPairService.makePublicKeys(keypair);
				keypair.hash();

				this.$emit('keypair', keypair);
			}
		},
		watch:{
			['key'](){
				clearTimeout(keyTimeout);
				keyTimeout = setTimeout(async () => {
					this.testKey();
				}, 500);
			},
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>