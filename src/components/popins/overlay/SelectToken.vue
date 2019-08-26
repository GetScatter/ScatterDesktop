<template>
	<section class="pop-over">
		<PopInHead title="Select Token" v-on:close="returnResult" />
		<section class="select-token">
			<section style="display:flex;" class="scroller">
				<section v-for="category in categories" style="flex:1;">
					<TokenList :key="category.title" :balances="category.tokens" hoverable="1" v-on:token="returnResult" />
				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {blockchainName, BlockchainsArray} from "@walletpack/core/models/Blockchains";
	import TokenList from "../../tokens/TokenList";
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {TokenList},
		props:['popin'],
		data () {return {
			terms:'',
			blockchainFilter:null,
		}},
		computed:{
			...mapGetters([

			]),
			tokens(){
				return this.popin.data.props.tokens;
			},
			categories(){
				if(!this.tokens[0].hasOwnProperty('tokens')) return [{ tokens:this.tokens }]
				return this.tokens;
			},
			filters(){
				return [
					{
						selected:this.blockchainFilter,
						options:[null].concat(BlockchainsArray.map(x => x.value)),
						parser:x => x === null ? 'All Blockchains' : blockchainName(x),
						onSelect:x => this.blockchainFilter = x,
					}
				]
			},
		},
		created(){

		},
		methods:{
			returnResult(token){
				this.popin.data.callback(token);
				this[UIActions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.select-token {
		min-width:600px;

		.scroller {
			min-width:600px;
			height:calc(100vh - 40px - 100px);
			overflow-y: hidden;

			.token-list {
				height:100%;
				width:100%;
				padding:0rem;
				border-radius:0;
				border-right:1px solid $lightgrey;
				    background: white;

				.search-and-filter.full {
					border-radius:0;
					background:blue !important;
				}

				.search-and-filter {
					border-radius:0;
					background:blue;
				}
			}
		}

	}

</style>