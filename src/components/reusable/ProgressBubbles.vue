<template>
	<section class="progress-bubbles">
		<section class="bubbles" :class="{'done':index === total}">
			<figure v-for="i in Array(parseInt(total)).keys()"
			        class="bubble"
			        :class="{'active':i < parseInt(index)}"></figure>

			<figure class="grower" :style="{'width':(index*36)-20+'px'}">
				<i v-if="index === total" class="icon-check"></i>
			</figure>
		</section>
	</section>
</template>

<script>
	export default {
		props:['total', 'index'],
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.progress-bubbles {
		width:100%;
		padding:60px 0;
		position:relative;
		display:flex;
		align-items: center;
		flex-direction: column;

		&:before {
			content:'';
			display:block;
			width:100%;
			background: $lightgrey;
			height:1px;
			position: relative;
			z-index:0;
		}

		.bubbles {
			display:flex;
			margin-top:-8px;
			position: relative;

			.bubble {
				width:16px;
				height:16px;
				border-radius:50%;
				margin:0 10px;
				border:1px solid $lightgrey;
				background: $white;
				transition:all 0.2s ease;
				transition-property: border, background;

				&.active {
					background: $blue;
					border:1px solid $blue;
					animation: popBubble 0.2s ease-out;
				}

				&:first-child {
					margin-left:0;
				}

				&:last-child {
					margin-right:0;
				}

				@keyframes popBubble {
					0% { transform:scale(1); }
					10% { transform:scale(1.5); }
					100% { transform:scale(1); }
				}
			}

			.grower {
				height:16px;
				line-height:15px;
				background: $blue;
				border:1px solid $blue;
				position:absolute;
				z-index:1;
				border-radius:100px;
				transition:all 0.2s ease-out;
				transition-property: width, background, border;
				text-align:center;
				color:$white;
				font-size: 13px;
			}

			&.done {
				.bubble {
					background:$green;
					border:1px solid $green;
				}

				.grower {
					background:$green;
					border:1px solid $green;
				}
			}
		}


	}
</style>