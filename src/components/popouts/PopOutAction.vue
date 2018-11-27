<template>
	<section class="action-info" v-if="action">
		<figure class="origin" :title="origin">{{origin}}</figure>
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
		padding:40px 60px 30px;
		text-align:center;
		font-size: 22px;
		line-height: 24px;
		background:#fafafa;

		.origin {
			color:$dark-blue;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width:300px;
		}

		b {
			font-weight: 800;
		}
	}

</style>
