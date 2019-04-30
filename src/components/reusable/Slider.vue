<template>
	<section class="percentage-bar">
		<figure class="bar instant" :class="{'red':isRed}" :style="{'width':percentage + '%'}"></figure>
		<input type="range" :class="{'red':isRed}" :step="step ? step : 1" :min="min" :max="max" v-model="val">
	</section>
</template>

<script>
	export default {
		props:['min', 'max', 'value', 'step', 'red'],
		data(){return {
			val:0,
		}},
		mounted(){
			this.val = this.value;
		},
		computed:{
			percentage(){
				if(this.min === this.max) return 100;
				if(this.val < 0) return ((Math.abs(this.val)/Math.abs(this.min))*100);
				return (this.val/this.max)*100;
			},
			isRed(){
				if(this.min === this.max) return true;
				if(this.val < 0) return Math.abs(this.val) > Math.abs(this.min) - Math.abs(this.min)/6;
				return this.val > this.max - this.max/6
			}
		},
		watch:{
			val(){
				this.$emit('changed', this.val);
			},
			value(){
				this.val = this.value;
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.percentage-bar {
		width: 100%;
		margin:20px 0 0;
		position: relative;


		input {
			-webkit-appearance: none;  /* Override default CSS styles */
			appearance: none;
			cursor: pointer;
			width: 100%;
			background: transparent;
			height:14px;
			outline: none;
			border-radius:50px;
			position:absolute;
			top:0;
			bottom:0;
			left:0;
			right:0;


			$slider-button:24px;

			&::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				width: $slider-button;
				height: $slider-button;
				background: $secondary;
				cursor: pointer;
				margin-top:-2px;

				border:3px solid #fff;
				box-shadow:0 2px 10px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.2);
				border-radius:50px;
				padding:3px;

				transition:all 0.2s ease;
				transition-property: background;

			}

			&::-moz-range-thumb {
				-webkit-appearance: none;
				appearance: none;
				width: $slider-button;
				height: $slider-button;
				background: $secondary;
				cursor: pointer;
				margin-top:-2px;

				border:3px solid #fff;
				box-shadow:0 2px 10px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.2);
				border-radius:50px;
				padding:3px;

				transition:all 0.2s ease;
				transition-property: background;
			}

			&.red {
				&::-webkit-slider-thumb {
					background: $red;
				}

				&::-moz-range-thumb {
					background: $red;
				}
			}
		}

	}
</style>