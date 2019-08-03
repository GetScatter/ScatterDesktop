<template>
	<section class="pop-in">
		<section>
			<section class="head">
				<figure class="icon font icon-globe-1"></figure>
				<figure class="title">Add Custom Network</figure>
			</section>
			<EditNetwork :original="network" v-on:updated="x => network = x" brand-new="1" />


			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Save new network', blue:true, click:() => saveNetwork()}]" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import EditNetwork from "../../misc/EditNetwork";
	import Network from '../../../models/Network'
	import NetworkService from "../../../services/blockchain/NetworkService";

	export default {
		components: {EditNetwork},
		props:['popin'],
		data () {return {
			network:Network.placeholder(),
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
		},
		methods:{
			returnResult(){
				this.popin.data.callback(this.network);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async saveNetwork(){
				this.network.blockchain = this.popin.data.props.blockchain;
				const added = await NetworkService.addNetwork(this.network);
				if(added) this.returnResult();
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