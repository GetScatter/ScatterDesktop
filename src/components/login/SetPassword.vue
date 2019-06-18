<template>
	<section class="center-panel">
		<Lock />
		<br>
		<br>
		<h2>Set a strong password</h2>
		<p><b>Use a strong password</b>, and then memorize it or keep it safe.</p>

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
	import Lock from '../svgs/Lock'

	export default {
		components:{Lock},
		data(){return {
			password:'',
			confirmation:'',
		}},
		computed:{
			passwordStrength(){
				return PasswordService.passwordStrength(this.password);
			},
		},
		methods:{
			async checkPassword(){
				if(!PasswordService.isValidPassword(this.password, this.confirmation)) return false;

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
			background:$blue;
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