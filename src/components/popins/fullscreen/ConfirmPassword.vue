<template>
	<section class="pop-in">
		<!--<back-bar v-on:back="returnResult(null)" />-->
		<section>
			<section class="head">
				<Lock />
				<br>
				<br>
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.CONFIRM_PASS.Title)}}</figure>

				<br>
				<Input  style="width:350px;" big="1"
				        :text="password"
				        v-on:enter="verify"
				        v-on:changed="x => password = x"
				        centered="1" placeholder="Enter you password"
				        type="password" />
			</section>


			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Confirm', red:true, click:() => verify()}]" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import PasswordService from "../../../services/secure/PasswordService";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import Lock from '../../svgs/Lock'

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
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async verify(){
				if(!this.password.length) return;
				if(this.returnOnly) return this.returnResult(this.password);

				const verified = await PasswordService.verifyPassword(this.password);
				if(!verified) PopupService.push(Popup.snackbarBadPassword());
				this.returnResult(verified);
			},

			...mapActions([
				Actions.RELEASE_POPUP
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