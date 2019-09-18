<template>
	<section class="pop-in">
		<!--<back-bar v-on:back="returnResult(null)" />-->
		<section>
			<section class="head">
				<Lock />
				<br>
				<br>
				<figure class="title">Enter Password</figure>

				<br>
				<Input  style="width:350px;" big="1"
				        :text="password"
				        v-on:enter="verify"
				        v-on:changed="x => password = x"
				        centered="1" placeholder="Enter your password"
				        type="password" />
			</section>


			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Confirm', red:true, click:() => verify()}]" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import '../../../styles/popins.scss';
	import Lock from '../../svgs/Lock'
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components:{Lock},
		props:['popin'],
		data () {return {
			password:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
			returnOnly(){
				return this.popin.data.props.returnOnly;
			}
		},
		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[UIActions.RELEASE_POPUP](this.popin);
			},
			async verify(){
				if(!this.password.length) return;
				this.returnResult(this.password);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.test {
		background:$reverse-gradient;
	}

</style>