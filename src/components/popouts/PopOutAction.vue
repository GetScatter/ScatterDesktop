<template>
	<!------------------------------------->
	<!------------ APP DETAILS ------------>
	<!------------------------------------->
	<section class="app-details">
		<figure class="logo">
			<img v-if="app.img" :src="app.img" />
			<span v-else>No Image</span>
		</figure>
		<figure class="name"><b>{{app.name}}</b></figure>
		<!--<figure class="action">-->
			<!--<span v-if="preAction">{{preAction}}</span> <b>{{action}}</b>-->
		<!--</figure>-->
	</section>
	<!--<section class="action-info" v-if="action">-->
		<!--<figure class="origin" :title="origin">{{origin}}</figure>-->

	<!--</section>-->
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		props:['app', 'action', 'preAction']

	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.app-details {
		padding:60px 60px 30px;

		.action {
			display:inline-block;
			max-height:50px;
			overflow:hidden;
		}
	}

</style>
