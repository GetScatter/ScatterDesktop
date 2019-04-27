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

	import {RouteNames} from "../../vue/Routing";

	export default {

		methods:{
			async go(){
				this.$router.push({name:RouteNames.HOME})
			}
		}
	}
</script>