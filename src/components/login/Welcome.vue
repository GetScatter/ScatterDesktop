<template>
	<section class="center-panel">
		<ScatterOutline />
		<br>
		<br>
		<h2>Welcome to the future</h2>
		<p>
			Your Scatter is set up and ready to use.
		</p>

		<br>

		<Button big="1" blue="1" text="Start using Scatter" @click.native="go" />
	</section>
</template>

<script>
	import {mapActions, mapState} from 'vuex';
	import * as Actions from '../../store/constants'
	import {RouteNames} from "../../vue/Routing";
	import ScatterOutline from '../svgs/ScatterOutline'

	export default {
		components:{ScatterOutline},
		computed:{
			...mapState([
				'scatter'
			]),
		},
		methods:{
			async go(){
				const scatter = this.scatter.clone();
				scatter.onboarded = true;
				await this[Actions.SET_SCATTER](scatter);
				this.$router.push({name:RouteNames.HOME})
			},
			...mapActions([
				Actions.SET_SCATTER
			])
		}
	}
</script>