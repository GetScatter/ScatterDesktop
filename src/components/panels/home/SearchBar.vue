<template>
	<section class="search-bar">
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
		props:['placeholder']
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../_variables";

	.search-bar {
		height:60px;
		position: relative;

		.icon {
			position:absolute;
			top:0;
			bottom:0;
			left:30px;
			line-height: 60px;
			color:$placeholder-color;
			font-size: 18px;
		}

		$input-size:16px;
		input {
			outline:0;
			border:0;
			height:60px;
			width:100%;
			background:transparent;
			padding:0 30px 0 60px;
			font-size: $input-size;
			cursor: text;

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
	}

</style>