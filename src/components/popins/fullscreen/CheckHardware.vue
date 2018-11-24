<template>
	<section>
		<section class="full-panel center-fold limited">
			<section>
				<section class="head">
					<figure class="icon icon-spin4 animate-spin"></figure>
					<figure class="title">Check Hardware</figure>
					<p>You should see a confirmation on your hardware device.</p>

				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../fullscreen-popins.scss';
	export default {
		props:['popin'],
		data () {return {
			password:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
		},
		methods:{

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../variables";



</style>
