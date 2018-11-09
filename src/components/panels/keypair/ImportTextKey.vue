<template>
	<section>
		<cin type="password" placeholder="Make sure to enter it correctly." label="Enter a Private Key" :text="key" v-on:changed="x => key = x" />
	</section>
</template>

<script>

	import KeyPairService from '../../../services/KeyPairService'
	import Keypair from "../../../models/Keypair";

	let keyTimeout;

	export default {
		data(){return {
			key:''
		}},
		methods:{
			async testKey(){
				this.key = this.key.trim().replace(/\W/g, '');

				const keypair = Keypair.placeholder();
				keypair.privateKey = this.key;

				if(!KeyPairService.isValidPrivateKey(keypair)) return;


				this.setWorkingScreen('Importing Key');

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