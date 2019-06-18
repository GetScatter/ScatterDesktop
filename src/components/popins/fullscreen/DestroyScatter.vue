<template>
	<section class="pop-in">
		<section class="head">
			<figure class="icon font icon-attention"></figure>
			<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.DESTROY.Title)}}</figure>
			<section class="disclaimer">
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.DESTROY.Disclaimer)}}</figure>
				<figure class="description">{{locale(langKeys.POPINS.FULLSCREEN.DESTROY.Desc)}}</figure>
			</section>
		</section>

		<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Destroy Scatter', blue:true, click:() => destroy()}]" />
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import SocketService from "../../../services/utility/SocketService";
	import StorageService from "../../../services/utility/StorageService";
	import ElectronHelpers from "../../../util/ElectronHelpers";

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
					ElectronHelpers.reload()
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
		height: calc(100vh - 240px);
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