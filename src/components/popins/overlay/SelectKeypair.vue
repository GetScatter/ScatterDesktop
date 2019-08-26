<template>
	<section class="select-keypair pop-over">
		<PopInHead title="Select Public Key" v-on:close="returnResult" />
		<KeysAndAccountList :keypairs-only="true" :blockchains="blockchains" v-on:keypair="returnResult" as-selector="1" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import KeysAndAccountList from "../../misc/KeysAndAccountList";
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {KeysAndAccountList},
		props:['popin'],
		data(){return {

		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
			blockchains(){
				return this.popin.data.props.blockchains;
			},
		},
		methods:{
			returnResult(keypair){
				this.popin.data.callback(keypair);
				this[UIActions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		}

	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.select-keypair {
		//min-width:800px;
	}
	.keys-and-accounts-list {
		overflow-y: auto;
		height:calc(100vh - 160px);
	}

</style>