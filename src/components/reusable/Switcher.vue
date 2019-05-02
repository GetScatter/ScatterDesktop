<template>
	<section class="switch" :class="{'disabled':disabled, 'off':!state}" @click="toggle">
		<figure class="dot"></figure>
	</section>
</template>

<script>
	export default {
		props:['state', 'disabled'],
		methods: {
			toggle(){
				if(this.disabled) return;
				this.$emit('switched', !this.state);
			}
		},
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	$switchheight:28px;

	.switch {
		width:calc(#{$switchheight} * 1.8);
		height:28px;
		border:1px solid rgba(0,0,0,0.1);
		border-radius:50px;
		padding:2px;
		cursor: pointer;
		opacity:1;
		transition: all 0.3s ease;
		transition-property: opacity;
		background:$blue;

		&.disabled {
			opacity:0.2;
			cursor: not-allowed;
		}

		.dot {
			width:calc(#{$switchheight} - 6px);
			height:calc(#{$switchheight} - 6px);
			margin-left:calc(#{$switchheight} - 7px);
			border-radius:50%;
			background:$white;

			transition: all 0.3s ease;
			transition-property: margin-left, background;
		}

		&.off {
			background:rgba(0,0,0,0.03);

			.dot {
				margin-left:1px;
				background: $lightgrey;
			}
		}
	}
</style>