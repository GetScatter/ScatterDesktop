<template>
	<section class="select-account pop-over">
		<KeysAndAccountList :accounts="filteredAccounts" v-on:account="returnResult" limited-info="1" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import KeysAndAccountList from "../../misc/KeysAndAccountList";
	import SearchAndFilter from "../../reusable/SearchAndFilter";
	import {BlockchainsArray, blockchainName} from '../../../models/Blockchains';

	export default {
		components: {SearchAndFilter, KeysAndAccountList},
		props:['popin'],
		data(){return {
			terms:'',
			blockchainFilter:null,
		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
			filteredAccounts(){
				return this.accounts.reduce((acc,x) => {
					if(!acc.find(a => a.sendable() === x.sendable())) acc.push(x);
					return acc;
				}, []).filter(x => {
					return !this.blockchainFilter || this.blockchainFilter === x.blockchain()
				}).filter(x => {
					return x.sendable().toLowerCase().indexOf(this.terms) > -1
						|| x.authorities().find(a => a.authority.toLowerCase().indexOf(this.terms) > -1)
				}).sort((a,b) => {
					return b.totalFiatBalance() - a.totalFiatBalance();
				})
			},
			filters(){
				return [
					{
						selected:this.blockchainFilter,
						options:[null].concat(BlockchainsArray.map(x => x.value)),
						parser:x => x === null ? 'All Blockchains' : blockchainName(x),
						onSelect:x => this.blockchainFilter = x,
					}
				]
			}
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
		min-width:800px;
	}

</style>