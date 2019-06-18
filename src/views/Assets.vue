<template>
	<section>
		<Assets />
	</section>
</template>

<script>
	import {mapState, mapGetters} from 'vuex';
	import TokenList from "../components/tokens/TokenList";
	import TokenGraph from "../components/tokens/TokenGraph";
	import Assets from "../components/misc/Assets";

	export default {
		components: {Assets},

	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.assets {
		height:$quickheightnobuffer;
	}


</style>