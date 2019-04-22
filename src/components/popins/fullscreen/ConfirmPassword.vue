<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel inner with-action center-fold limited">
			<section>
				<section class="head">
					<figure class="icon icon-lock"></figure>
					<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.CONFIRM_PASS.Title)}}</figure>

					<br>
					<br>
					<cin style="width:350px;" big="1"
					     :text="password"
					     v-on:enter="verify"
					     v-on:changed="x => password = x"
					     type="password"
					     :label="locale(langKeys.POPINS.FULLSCREEN.CONFIRM_PASS.Label)" />
				</section>
			</section>

			<section class="action-bar short bottom centered">
				<btn :disabled="password.trim().length === 0"
					 :text="locale(langKeys.GENERIC.Confirm)"
					 blue="1" v-on:clicked="verify" />
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import PasswordService from "../../../services/PasswordService";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";

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
