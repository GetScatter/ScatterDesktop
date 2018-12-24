<template>
	<section class="token-panel">
		<back-bar style="border-bottom:0;" v-on:back="back" />




	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import SearchBar from '../components/reusable/SearchBar';

	export default {
		components:{
			SearchBar
		},
		data () {return {

		}},
		computed:{
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'accounts',
				'fullTotalBalances',
				'totalBalances',
				'networks',
			]),
		},
		mounted(){

		},
		methods:{
			back(){
				this.$router.back();
			},
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../_variables";


</style>