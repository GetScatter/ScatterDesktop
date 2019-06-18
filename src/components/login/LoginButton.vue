<template>
	<section class="button" :class="{'primary':primary, 'on-white':onWhite}">
		<figure class="title">{{title}}</figure>
		<figure class="description">{{description}}</figure>
	</section>
</template>

<script>
	export default {
		props:['primary', 'title', 'description', 'onWhite']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.button {
		height:80px;
		width:320px;
		display:flex;
		flex-direction: column;
		padding:0 20px;
		align-items: center;
		justify-content: center;
		border-radius:$radius;
		cursor: pointer;

		.title {
			font-size:$medium;
			font-weight: bold;
		}

		.description {
			font-size: $small;
		}

		&.primary {
			color: $blue;
			background: $white;
		}

		&:not(.primary){
			color: $white;
			background:transparent;
			border:1px solid $lightgrey;
		}

		&:not(:first-child){
			margin-top:10px;
		}

		&.on-white {
			&.primary {
				color: $white;
				background: $blue;
			}

			&:not(.primary){
				color: $blue;
				background:transparent;
				border:1px solid $lightgrey;
			}
		}
	}
</style>