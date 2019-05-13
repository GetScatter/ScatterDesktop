<template>
	<section class="select-account pop-over">
		<PopInHead title="Select Account" v-on:close="returnResult" />
		<KeysAndAccountList :accounts="validAccounts" v-on:account="returnResult" as-selector="1" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import KeysAndAccountList from "../../misc/KeysAndAccountList";
	import SearchAndFilter from "../../reusable/SearchAndFilter";
	import {BlockchainsArray, blockchainName} from '../../../models/Blockchains';

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

	.select-account {
		//min-width:800px;
	}
	.keys-and-accounts-list {
		overflow-y: auto;
		height:calc(100vh - 160px);
	}

</style>