<template>
	<section class="pop-out-head">
		<figure class="logo">Scatter</figure>
		<figure v-if="!hideClose" class="close icon-cancel" @click="$emit('closed')"></figure>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		props:['hideClose']
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.pop-out-head {
		-webkit-app-region: drag;
		flex:0 0 auto;
		height:79px;
		width:100%;
		display:flex;
		align-items: center;
		padding:0 0 0 30px;
		border-bottom:1px solid #dfe0e1;

		.logo {
			-webkit-app-region: drag;
			flex:2;
			font-family: 'Grand Hotel', sans-serif;
			font-size: 30px;
			color:$primary;
		}

		.close {
			-webkit-app-region: no-drag;
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

</style>
