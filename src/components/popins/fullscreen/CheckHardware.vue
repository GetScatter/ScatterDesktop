<template>
	<section>
		<section class="full-panel center-fold limited inner">
			<section>
				<section class="head">
					<figure class="icon icon-spin4 animate-spin"></figure>
					<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.CHECK_HARDWARE.Title)}}</figure>
					<p>{{locale(langKeys.POPINS.FULLSCREEN.CHECK_HARDWARE.Desc)}}</p>
				</section>
			</section>
		</section>
		<section class="action-bar short bottom centered" style="border-top:0;">
			<btn :text="locale(langKeys.GENERIC.Cancel)" v-on:clicked="returnResult(false)" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
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
			returnResult(x){
				this.popin.data.callback(x);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";



</style>
