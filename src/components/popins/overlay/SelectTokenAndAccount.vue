<template>
	<section class="pop-over">
		<PopInHead title="Select Token and Account" v-on:close="returnResult" />
		<Assets as-selector="1" v-on:selected="returnResult" hide-unusable="1" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import Assets from "../../misc/Assets";
	import {BlockchainsArray, blockchainName} from '@walletpack/core/models/Blockchains';
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {Assets},
		props:['popin'],
		data(){return {

		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
		},
		methods:{
			returnResult(result){
				this.popin.data.callback(result);
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

	.pop-over {
		max-width:900px;
		min-width:700px;
		width:100%;
		margin:0 auto;
	}

	.assets {
		height:calc(100vh - 180px);
	}


</style>