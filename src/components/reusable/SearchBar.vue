<template>
	<section class="search-bar" :class="{'short':short}">
		<figure class="icon icon-search"></figure>
		<input :placeholder="placeholder" v-model="terms" />
	</section>
</template>

<script>

	export default {
		data(){return {
			terms:''
		}},
		watch:{
			['terms'](){
				this.$emit('terms', this.terms.toLowerCase().trim());
			}
		},
		props:['placeholder', 'short']
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../variables";

	.search-bar {
		height:60px;
		position: relative;
		transition: all 0.4s ease;
		transition-property: height;

		.icon {
			position:absolute;
			top:0;
			bottom:0;
			left:30px;
			line-height: 60px;
			color:$placeholder-color;
			font-size: 18px;
			transition: all 0.4s ease;
			transition-property: line-height, font-size;
		}

		$input-size:16px;
		$input-size-short:13px;
		input {
			outline:0;
			border:0;
			height:60px;
			width:100%;
			background:transparent;
			padding:0 30px 0 60px;
			font-size: $input-size;
			cursor: text;
			transition: all 0.4s ease;
			transition-property: height, font-size, padding;

			&::-webkit-input-placeholder {
				font-size: $input-size;
				color:$placeholder-color;
			}
			&::-moz-placeholder {
				font-size: $input-size;
				color:$placeholder-color;
			}
			&:-ms-input-placeholder {
				font-size: $input-size;
				color:$placeholder-color;
			}
			&:-moz-placeholder {
				font-size: $input-size;
				color:$placeholder-color;
			}
		}

		&.short {
			height:40px;

			input {
				height:40px;
				padding-left:50px;

				&::-webkit-input-placeholder {
					font-size: $input-size-short;
				}
				&::-moz-placeholder {
					font-size: $input-size-short;
				}
				&:-ms-input-placeholder {
					font-size: $input-size-short;
				}
				&:-moz-placeholder {
					font-size: $input-size-short;
				}
			}

			.icon {
				line-height: 40px;
				font-size: $input-size-short;
			}
		}
	}

</style>