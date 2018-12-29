<template>
	<section>

		<back-bar v-on:back="back"></back-bar>

		<section class="panel-container limited">
			<FullWidthRow :items="histories" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import FullWidthRow from '../components/reusable/FullWidthRow';


	export default {
		components:{
			FullWidthRow,
		},
		data () {return {

		}},
		computed:{
			...mapState([
				'scatter',
				'history',
			]),
			...mapGetters([
				'keypairs',
			]),
			histories(){
				return [
					{title:'Transfer', description:'ramdeathtest -> eosio', actions:[{name:'Redo', handler:() => {}}]},
				];
			},
		},
		mounted(){

		},
		methods:{
			back(){
				this.$router.back();
			},
			...mapActions([
				Actions.NEW_KEY
			])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

</style>
