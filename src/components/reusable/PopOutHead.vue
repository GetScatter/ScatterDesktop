<template>
	<section>
		<section class="pop-out-head">
			<figure class="logo">Scatter</figure>
			<figure class="close icon-cancel" @click="$emit('closed')"></figure>
		</section>

		<section class="action-info" v-if="action">
			<span class="origin">{{origin}}</span><br>
			wants to <b>{{action}}</b>
		</section>
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

	.pop-out-head {
		height:70px;
		width:100%;
		display:flex;
		align-items: center;
		padding:0 0 0 30px;
		border-bottom:1px solid #dfe0e1;

		.logo {
			flex:2;
			font-family: 'Grand Hotel', sans-serif;
			font-size: 30px;
			color:$dark-blue;
		}

		.close {
			cursor: pointer;
			text-align:right;
			line-height:90px;
			height:90px;
			padding:0 30px;
			font-size: 30px;
			color:#cccdce;

			&:hover {
				color:$red;
			}
		}
	}

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
