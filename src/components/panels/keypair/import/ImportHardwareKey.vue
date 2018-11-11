<template>
	<section>
		<sel :selected="hardwareType" label="Select a Hardware Wallet"
		     :options="EXT_WALLET_TYPES_ARR" v-on:changed="(x) => hardwareType = x"></sel>

		<br>

		<cin label="Ledger Key/Address Index"></cin>

		<section class="action-bar-holder">
			<section class="action-bar short bottom centered">
				<btn v-on:clicked="importKey" blue="1"
				     style="width:300px;"
				     text="Import Key"></btn>
			</section>
		</section>
	</section>
</template>

<script>
	import ExternalWallet, {EXT_WALLET_TYPES, EXT_WALLET_TYPES_ARR} from '../../../../models/ExternalWallet';

	export default {
		data(){return {
			hardwareType:EXT_WALLET_TYPES.LEDGER,
			EXT_WALLET_TYPES_ARR
		}},

		methods:{
			importKey(){}
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">

	.action-bar-holder {
		position:fixed;
		bottom:0;
		left:0;
		right:0;
	}
	
</style>