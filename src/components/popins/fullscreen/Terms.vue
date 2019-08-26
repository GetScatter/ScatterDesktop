<template>
	<section class="pop-in">
		<Terms v-on:next="returnResult(true)" v-on:back="returnResult(false)" />
	</section>
</template>

<script>
	import {mapActions} from 'vuex';
	import Terms from "../../login/Terms";
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {Terms},
		props:['popin'],
		methods:{
			returnResult(bool){
				this.popin.data.callback(bool);
				this[UIActions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},

	}
</script>

<style scoped lang="scss">

</style>