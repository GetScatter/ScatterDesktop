<template>
	<section class="pop-out-head">
		<section class="details">
			<figure class="logo">Scatter</figure>
		</section>
		<figure v-if="!hideClose" class="close icon-cancel" @click="$emit('closed')"></figure>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import ReputationScore from '../../components/reusable/ReputationScore';

	export default {
		props:['hideClose'],
		components:{
			ReputationScore
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.pop-out-head {
		-webkit-app-region: drag;
		flex:0 0 auto;
		height:40px;
		width:100%;
		display:flex;
		align-items: center;
		padding:0 0 0 10px;
		border:1px solid $darkerblue;
		border-bottom:0;
		background:$blue;

		.details {
			-webkit-app-region: drag;
			flex:2;

			.logo {
				font-family: 'Grand Hotel', sans-serif;
				font-size: 24px;
				color: $white;
			}
		}

		.close {
			-webkit-app-region: no-drag;
			cursor: pointer;
			text-align:right;
			line-height:90px;
			height:90px;
			padding:0 10px;
			font-size: 18px;
			color:rgba(255,255,255,0.4);

			&:hover {
				color:$white;
			}
		}
	}

</style>
