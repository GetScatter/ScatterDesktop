<template>
	<section class="pop-over">
		<PopInHead title="Select Blockchain" v-on:close="returnResult" />
		<section class="select-blockchain type-selector">
			<section class="types">
				<section class="type" v-for="blockchain in blockchains" @click="returnResult(blockchain)">
					<figure class="type-icon" :class="`token-${blockchain}-${blockchain}`"></figure>
					<figure class="type-text">{{blockchainName(blockchain)}}</figure>
				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';

	export default {
		props:['popin'],
		data () {return {
		}},
		computed:{
			...mapGetters([

			]),
			blockchains(){
				return this.popin.data.props.blockchains;
			}
		},
		created(){

		},
		methods:{
			returnResult(blockchain){
				this.popin.data.callback(blockchain);
				this[Actions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.select-blockchain {
		padding:40px;
		text-align:center;
	}

</style>