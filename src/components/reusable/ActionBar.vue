<template>
	<section class="action-bar">
		<section class="left">
			<Button v-bind="button" :key="i" v-for="(button,i) in buttonsLeft" />
		</section>
		<section class="right">
			<Button v-bind="button" :key="i" v-for="(button,i) in buttonsRight" />
		</section>
	</section>
</template>

<script>
	export default {
		props:['buttonsLeft', 'buttonsRight']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.action-bar {
		position:fixed;
		bottom:0;
		left:0;
		right:0;
		z-index:2;
		height:70px;
		//box-shadow:0 -2px 30px $blue-shadow;
		border-top:1px solid $lightgrey;
		background:$white;

		display:flex;
		align-items: center;
		padding:0 20px;

		.left {
			flex:1;
			text-align:left;
		}

		.right {
			flex:1;
			text-align:right;
		}
	}

</style>