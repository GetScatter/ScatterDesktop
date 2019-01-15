<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel center-fold inner with-action limited">
			<section class="head">
				<figure class="icon icon-trash"></figure>
				<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.REMOVE_LOCATION.Title)}}</figure>
				<p>{{identity.name}} - {{location.name}}</p>
			</section>

		</section>
		<section class="action-bar short bottom centered">
			<btn :text="locale(langKeys.GENERIC.Remove)"
			     blue="1"
			     v-on:clicked="returnResult(true)" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import {Blockchains} from "../../../models/Blockchains";
	import FlatList from '../../reusable/FlatList';
	import AccountService from "../../../services/AccountService";

	export default {
		props:['popin'],
		components:{
			FlatList
		},
		data () {return {

		}},
		mounted(){

		},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'keypairs',
				'accounts',
			]),
			identity(){
				return this.popin.data.props.identity;
			},
			location(){
				return this.popin.data.props.location;
			},
		},
		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				Actions.RELEASE_POPUP,
				Actions.SET_SCATTER
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
