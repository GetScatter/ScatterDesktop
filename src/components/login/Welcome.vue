<template>
	<section class="center-panel">
		<h2>Welcome to the future</h2>
		<p>
			Your Scatter is set up and ready to use.
		</p>

		<br>

		<Button text="Start using Scatter" @click.native="go" />
	</section>
</template>

<script>
	import {mapActions, mapState} from 'vuex';
	import * as Actions from '../../store/constants'
	import {RouteNames} from "../../vue/Routing";

	export default {
		computed:{
			...mapState([
				'scatter'
			]),
		},
		methods:{
			async go(){
				const scatter = this.scatter.clone();
				scatter.onboarded = true;
				this[Actions.SET_SCATTER](scatter);
				this.$router.push({name:RouteNames.HOME})
			},
			...mapActions([
				Actions.SET_SCATTER
			])
		}
	}
</script>