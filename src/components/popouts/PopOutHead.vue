<template>
	<section class="pop-out-head">
		<section class="details">
			<figure class="logo">Scatter</figure>
		</section>
		<section class="actions">
			<section class="id-selector" v-if="idSelector && identities.length > 1">
				<i class="icon-user"></i>
				<Select :options="identities" :parser="x => x.name" :selected="identity" v-on:selected="x => $emit('identity', x)" />
			</section>
			<figure v-if="!hideClose" class="close icon-cancel" @click="$emit('closed')"></figure>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import ReputationScore from '../../components/reusable/ReputationScore';

	export default {
		props:['hideClose', 'idSelector', 'identity'],
		components:{
			ReputationScore
		},
		computed:{
			...mapGetters([
				'identities',
			])
		}
	}
</script>

<style lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.pop-out-head {
		-webkit-app-region: drag;
		position: relative;
		z-index: 2;
		flex:0 0 auto;
		height:40px;
		width:100%;
		display:flex;
		justify-content: space-between;
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

		.actions {
			-webkit-app-region: no-drag;
			display:flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;

			.id-selector {
				position: relative;

				> i {
					color:rgba(255,255,255,0.5);
					font-size: 12px;
					position:absolute;
					left:4px;
					top:6px;
					z-index:9999999;
				}

				.select {
					width:200px;
					height:24px;
					padding:0;

					.selected {
						background:$darkblue;
						border:1px solid $darkerblue;
						line-height:21px;
						padding-left:22px;

						.text {
							color:$white;
						}

						.chevron {
							color:$white;
							right:5px;
						}
					}
				}
			}


			.close {
				cursor: pointer;
				text-align:right;
				padding:0 10px;
				font-size: 18px;
				color:rgba(255,255,255,0.4);
				line-height:90px;
				height:90px;

				&:hover {
					color:$white;
				}
			}
		}


	}

</style>
