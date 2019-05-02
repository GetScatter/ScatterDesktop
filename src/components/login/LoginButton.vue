<template>
	<section class="button" :class="{'blue':blue}">
		<figure class="title">{{title}}</figure>
		<figure class="description">{{description}}</figure>
	</section>
</template>

<script>
	export default {
		props:['blue', 'title', 'description']
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

		&.blue {
			color: $white;
			background: $blue;
		}

		&:not(.blue){
			color: $blue;
			background:transparent;
			border:1px solid $lightgrey;
		}

		&:not(:first-child){
			margin-top:10px;
		}
	}
</style>