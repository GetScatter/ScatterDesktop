<template>
	<section class="pop-in">
		<section>
			<section class="head">
				<figure class="icon font">
					<i class="icon-spin4 animate-spin"></i>
				</figure>
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.CHECK_HARDWARE.Title)}}</figure>
				<p>{{locale(langKeys.POPINS.FULLSCREEN.CHECK_HARDWARE.Desc)}}</p>
			</section>
		</section>
		<!--<ActionBar :buttons-left="[{text:locale(langKeys.GENERIC.Cancel), click:() => returnResult(false)}]" />-->
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import '../../../styles/popins.scss';
	import * as UIActions from "../../../store/ui_actions";

	export default {
		props:['popin'],
		data () {return {
			password:'',
			hadWorkingScreen:false,
		}},
		computed:{
			...mapState([
				'workingScreen',
			]),
			...mapGetters([

			]),
		},
		mounted(){
			if(this.workingScreen){
				this.hadWorkingScreen = true;
				this.setWorkingScreen(false);
			}
		},
		methods:{
			returnResult(x){
				if(this.hadWorkingScreen){
					this.setWorkingScreen(true);
				}
				setTimeout(() => {
					this.popin.data.callback(x);
					this[UIActions.RELEASE_POPUP](this.popin);
				}, 10);
			},
			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";



</style>