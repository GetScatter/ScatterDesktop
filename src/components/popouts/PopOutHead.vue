<template>
	<section class="pop-out-head" :class="{'danger':reputation && reputation.decimal < 0}">
		<section class="details">
			<figure class="logo" v-if="!loadingRep && !reputation">Scatter</figure>
			<figure class="reputation" v-if="reputation">
				<ReputationScore class="score" :class="{'danger':reputation.decimal < 0}" :reputable="reputation" />
				<section class="info">
					<figure class="tag">RIDL Defender</figure>
					<div class="blue" v-if="reputation.decimal > 0">Reported as <b>Trustworthy</b></div>
					<div class="red" v-if="reputation.decimal < 0">Reported as <b>Dangerous</b></div>
				</section>
			</figure>
			<figure v-if="loadingRep">
				<i class="icon-spin4 animate-spin"></i>
			</figure>
		</section>
		<figure v-if="!hideClose" class="close icon-cancel" @click="$emit('closed')"></figure>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import ReputationScore from '../../components/reusable/ReputationScore';

	export default {
		props:['hideClose', 'reputation', 'loadingRep'],
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
		height:79px;
		width:100%;
		display:flex;
		align-items: center;
		padding:0 0 0 30px;
		border-bottom:1px solid #dfe0e1;
		background:white;

		&.danger {
			animation: danger-box 0.5s ease infinite;

			@keyframes danger-box {
				0%, 100% {
					box-shadow:inset 0 0 0 0 transparent;
				}
				90% {
					box-shadow:inset 0 0 0 3px red;
				}
			}
		}

		.details {
			-webkit-app-region: drag;
			flex:2;

			.logo {
				font-family: 'Grand Hotel', sans-serif;
				font-size: 30px;
				color:$primary;
			}

			.reputation {
				display:flex;
				align-items: center;

				.score {


				}

				.info {
					padding-left:20px;

					.tag {
						font-size: 9px;
						font-weight: bold;
						color:$dark-grey;
					}

					div {
						font-size: 14px;

						&.blue { color:$blue; }
						&.red { color:red; }
					}
				}
			}
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
