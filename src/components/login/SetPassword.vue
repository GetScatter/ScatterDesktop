<template>
	<section class="center-panel">
		<h2>Set a strong password</h2>
		<p>
			This is your Scatter's password. Make sure to memorize it or keep it safe.
			<b>Please note that this is not your blockchain account's password, that is your private key.</b>
		</p>

		<br>

		<input class="center" type="password" v-model="password" placeholder="choose a password" />
		<section class="password-strength">
			<figure class="bar" :style="{'width':passwordStrength + '%'}" :class="{'red':passwordStrength < 100}"></figure>
		</section>
		<input class="center" type="password" v-model="confirmation" placeholder="one more time" />

		<ActionBar :buttons-left="[{text:'Back', click:() => $emit('back')}]" :buttons-right="[{text:'Next', blue:true, click:checkPassword}]" />
	</section>
</template>

<script>
	import {mapActions} from 'vuex';
	import * as Actions from '../../store/constants';
	import PasswordService from "../../services/secure/PasswordService";
	import StoreService from "../../services/utility/StoreService";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";

	export default {
		data(){return {
			password:'',
			confirmation:'',
		}},
		computed:{
			passwordStrength(){
				const special = "!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?".split('');
				const p = this.password;
				let points = 0;
				const upper = p.split('').filter(x => x === x.toUpperCase()).length;
				points += upper < 5 ? upper : (5 * 2) + (upper-5);
				const specs = p.split('').filter(x => special.includes(x)).length;
				points += specs < 5 ? specs : (5 * 2) + (specs-5);
				points += p.length;
				const good = 60;
				const percentage = points / good > 1 ? 1 : points / good;
				return (percentage*100).toString();
			},
		},
		methods:{
			async checkPassword(){
				if(!PasswordService.isValidPassword(this.password, this.confirmation)) {
					return false;
				}

				if(this.features.enforcePasswordStrength){
					if(this.passwordStrength < 50) return PopupService.push(Popup.snackbar("Password not strong enough."))
				}

				StoreService.setWorking(true);
				await this[Actions.CREATE_SCATTER](this.password);
				StoreService.setWorking(false);

				this.$emit('next');
			},

			...mapActions([
				Actions.CREATE_SCATTER
			])
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.password-strength {
		width:100%;
		height:14px;
		line-height: 14px;
		margin-top:-4px;
		border-radius:4px;
		border-top-left-radius:0;
		border-top-right-radius:0;
		overflow: hidden;
		background:#ffffff;
		position: relative;
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding:4px;
		.bar {
			background:$secondary;
			height:4px;
			border-radius:20px;
			transition: all 0.5s ease;
			transition-property: width, background;
			&.red {
				background:$red;
			}
		}
	}

</style>