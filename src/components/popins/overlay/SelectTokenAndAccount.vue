<template>
	<section class="pop-over">
		<PopInHead title="Select Token and Account" v-on:close="returnResult" />
		<Assets as-selector="1" v-on:selected="returnResult" hide-unusable="1" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import Assets from "../../misc/Assets";
	import {BlockchainsArray, blockchainName} from '../../../models/Blockchains';

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
				this[Actions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				Actions.RELEASE_POPUP
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