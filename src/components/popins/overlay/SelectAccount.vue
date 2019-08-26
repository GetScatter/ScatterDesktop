<template>
	<section class="select-account pop-over">
		<PopInHead title="Select Account" v-on:close="returnResult" />
		<KeysAndAccountList :accounts="validAccounts" v-on:account="returnResult" as-selector="1" no-balances="1" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import KeysAndAccountList from "../../misc/KeysAndAccountList";
	import {BlockchainsArray, blockchainName} from '@walletpack/core/models/Blockchains';
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {KeysAndAccountList},
		props:['popin'],
		data(){return {
			terms:'',
			blockchainFilter:null,
		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
			validAccounts(){
				return this.popin.data.props.validAccounts;
			},
		},
		methods:{
			returnResult(account){
				this.popin.data.callback(account);
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

	.select-account {
		//min-width:800px;
	}
	.keys-and-accounts-list {
		overflow-y: auto;
		height:calc(100vh - 160px);
	}

</style>