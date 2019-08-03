<template>
	<section class="pop-in">
		<Terms v-on:next="returnResult(true)" v-on:back="returnResult(false)" />
	</section>
</template>

<script>
	import {mapActions} from 'vuex';
	import * as Actions from '../../../store/constants';
	import Terms from "../../login/Terms";

	export default {
		components: {Terms},
		props:['popin'],
		methods:{
			returnResult(bool){
				this.popin.data.callback(bool);
				this[Actions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},

	}
</script>

<style scoped lang="scss">

</style>