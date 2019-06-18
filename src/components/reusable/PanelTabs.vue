<template>
	<section class="panel-tabs">
		<figure v-for="tab in tabs"
		        :class="{'active':tab.state === state}"
		        @click="$emit('selected', tab.state)"
		        class="tab-name">{{tab.name}}</figure>
	</section>
</template>

<script>
	export default {
		props:['tabs', 'state']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.panel-tabs {
		width:100%;
		display:flex;
		margin-top:-40px;
		padding:0 40px;
		margin-bottom:19px;

		.tab-name {
			cursor: pointer;
			font-size: $large;
			padding-right:20px;
			font-weight: bold;
			color:rgba(255,255,255,0.5);
			transition:all 0.1s ease;
			transition-property: color;

			&:hover, &.active {
				color: $mid-light-blue;
				text-shadow:0 1px 2px rgba(0,0,0,0.1);
			}
		}
	}
</style>