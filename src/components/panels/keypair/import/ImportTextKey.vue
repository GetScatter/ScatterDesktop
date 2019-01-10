<template>
	<section>
		<cin :type="keyInputType" big="1" :error="keyLengthError || error"
		     :label="locale(langKeys.ADD_KEYS.IMPORT_TEXT.KeyLabel)"
		     :placeholder="locale(langKeys.ADD_KEYS.IMPORT_TEXT.KeyPlaceholder)"
		     :dynamic-button="eyeIcon"
		     v-on:dynamic="toggleKeyInputType" focus="1"
		     :text="key" v-on:changed="x => key = x" />

		<btn :text="locale(langKeys.GENERIC.Import)" @click.native="imported" blue="1" big="1" style="max-width:100%;" />
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
			importing:false,
		}},
		computed:{
			...mapGetters([
				'keypairs'
			]),
			eyeIcon(){
				return 'icon-eye' + (this.keyInputType === 'password' ? '' : '-off')
			},
			keyLengthError(){
				return this.key.length !== 0 && this.key.length <= 50
					? this.locale(this.langKeys.ADD_KEYS.IMPORT_TEXT.ERRORS.InvalidKeyLength, this.key.length)
					: null;
			},
		},
		methods:{
			toggleKeyInputType(){
				this.keyInputType = this.keyInputType === 'password' ? 'text' : 'password';
			},

			async testKey(){
				if(this.importing) return;
				this.importing = true;
				this.error = null;
				const key = this.key.trim().replace(/\W/g, '');

				const keypair = Keypair.placeholder();
				keypair.privateKey = key;

				if(!KeyPairService.isValidPrivateKey(keypair)) return this.importing = false;

				keypair.blockchains = KeyPairService.getImportedKeyBlockchains(key);
				await KeyPairService.convertHexPrivateToBuffer(keypair);
				await KeyPairService.makePublicKeys(keypair);
				keypair.hash();

				const existing = this.keypairs.find(x => x.keyHash === keypair.keyHash);
				if(existing){
					this.importing = false;
					return this.$router.push({name: this.RouteNames.KEYPAIR, params: {id: existing.id}});
				}

				setTimeout(() => {
					this.$emit('keypair', keypair);
					this.importing = false;
				}, 1);
			},

			imported(){
				this.error = 'Invalid Key.'
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