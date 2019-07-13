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
		margin-top:-48px;
		padding:0 40px;
		line-height:44px;

		.tab-name {
			cursor: pointer;
			font-size: $large;
		    margin-right: 20px;
			font-weight: bold;
			color:rgba(255,255,255,0.5);
			transition:all 0.1s ease;
			border-bottom: 1px solid rgba(0,0,0,0.12);

			&:hover, &.active {
				color: $mid-light-blue;
			    border-bottom: 4px solid white;
			}
		}
	}
</style>