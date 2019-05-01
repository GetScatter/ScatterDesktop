<template>
	<section v-if="reputable">
		<section class="reputation" :class="{'red':reputable.decimal < 0, 'small':small}">
			<b>{{reputable.decimal}}</b>
		</section>
	</section>
</template>

<script>

	export default {
		props:['reputable', 'small'],
	}
</script>

<style scoped lang="scss">
	@import "../../styles/_variables.scss";

	.reputation {
		width:40px;
		height:40px;
		font-size: 11px;

		border-radius:50%;
		border-bottom-right-radius:4px;
		border:3px solid $blue-grad;

		display:flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		b {
			font-weight: 800;
		}

		span {
			font-size: 11px;
			margin-top:-5px;
		}

		&.red {
			color:red;
			border:3px solid red;
		}

		&.small {
			width:30px;
			height:30px;
			margin-right:15px;
			font-size: 11px;
			background:#fff;
			border:0;
		}
	}

</style>