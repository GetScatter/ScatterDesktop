<template>
	<section>
		<section class="split-inputs">
			<section class="disclaimer less-pad" style="margin-right:20px; flex:0.5; align-self: flex-start;">
				Scan an encrypted Scatter QR code

				<p>
					Once you scan a valid QR code you will be
					taken to the password confirmation screen.
				</p>
			</section>
			<qr-reader style="flex:1;" v-if="!refresh" @decode="qrScanned"></qr-reader>
		</section>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import PopupService from "../../../../services/PopupService";
	import QRService from "../../../../services/QRService";
	import Keypair from "../../../../models/Keypair";
	import KeyPairService from "../../../../services/KeyPairService";
	import {Popup} from "../../../../models/popups/Popup";

	export default {
		data(){return {
			refresh:false
		}},
		computed:{
			...mapGetters([
				'keypairs',
			])
		},
		methods:{
			qrScanned(qr){
				const {data, salt} = JSON.parse(qr);

				PopupService.push(Popup.verifyPassword(async pass => {
					if(!pass) return;

					this.setWorkingScreen(true);

					const privateKey = await QRService.decryptQR(data, salt, pass).catch(() => null);
					if(!privateKey){
						this.refresh = true;
						this.$nextTick(() => this.refresh = false);
						this.setWorkingScreen(false);
						return PopupService.push(Popup.prompt('Decryption Error', 'Are you sure the password for this QR code is correct?'));
					}
					const keypair = Keypair.placeholder();
					keypair.privateKey = privateKey;
					await KeyPairService.makePublicKeys(keypair);
					keypair.hash();

					const existing = this.keypairs.find(x => x.keyHash === keypair.keyHash);
					if(existing){
						this.setWorkingScreen(false);
						return this.$router.push({name: this.RouteNames.KEYPAIR, params: {id: existing.id}});
					}

					setTimeout(() => {
						this.$emit('keypair', keypair);
						this.setWorkingScreen(false);
					}, 1);
				}, true))
			}
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">

	.qrcode-reader {
		width:500px;
		flex:1;
	}

</style>