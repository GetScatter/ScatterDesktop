<template>
	<section class="prompt pop-over">

		<PopInHead :title="locale(langKeys.POPINS.OVERLAY.ConfirmPin)" v-on:close="returnResult" />

		<section class="panel" style="padding:20px;">
			<section class="split-inputs">
				<Input style="margin-bottom:0; flex:3;"
				     placeholder="****"
				     :text="text"
				     type="password"
				     v-on:changed="x => text = x" />

				<Button style="margin-bottom:0; flex:1.5;" :class="{'wiggle':error}"
				     :red="error"
				     :text="locale(langKeys.GENERIC.Confirm)"
				     @click.native="validatePIN" />
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import Hasher from "../../../util/Hasher";

	export default {
		props:['popin'],
		data(){return {
			text:'',
			error:false,
		}},
		computed:{
			...mapState([
				'scatter',
			])
		},
		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			validatePIN(){
				if(!this.text.length) return;
				if(this.scatter.pin === Hasher.unsaltedQuickHash(this.text)) return this.returnResult(true);

				this.error = true;
				setTimeout(() => {
					this.error = false;
				}, 700);
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