<template>
	<section class="action-info" v-if="action">
		<span class="origin">{{origin}}</span><br>
		wants to <b>{{action}}</b>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		props:['origin', 'action']

	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../variables";

	.action-info {
		padding:30px 60px;
		text-align:center;
		font-size: 22px;
		line-height: 24px;
		border-bottom:1px solid #dfe0e1;
		background:rgba(0,0,0,0.02);

		.origin {
			color:$dark-blue;
		}

		b {
			font-weight: 800;
		}
	}

</style>
