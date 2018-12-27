<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel center-fold inner with-action limited">
			<section class="head">
				<figure class="icon icon-attention"></figure>
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.DESTROY.Title)}}</figure>
				<br>
				<section class="disclaimer less-pad red" style="margin-bottom:10px;">
					{{locale(langKeys.POPINS.FULLSCREEN.DESTROY.Disclaimer)}}
				</section>
				<p>
					{{locale(langKeys.POPINS.FULLSCREEN.DESTROY.Desc)}}
				</p>
			</section>

		</section>
		<section class="action-bar short bottom centered">
			<btn :text="locale(langKeys.GENERIC.Confirm)" blue="1" v-on:clicked="destroy" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import SocketService from "../../../services/SocketService";
	import StorageService from "../../../services/StorageService";

	export default {
		props:['popin'],
		data () {return {

		}},
		created(){

		},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'keypairs',
				'accounts',
			]),
		},
		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async destroy(){
				await SocketService.close();

				setTimeout(async () => {
					await StorageService.removeScatter();
					location.reload();
				}, 500);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 250px);
	}

	.auto-vote {
		max-width:600px;
		margin:0 auto;
		display:flex;

		.switch {

		}

		.details {
			padding-left:20px;
		}
	}

	.list {
		max-width:700px;
		width:100%;
		text-align:left;

	}

</style>
