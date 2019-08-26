<template>
	<section class="select-from-list pop-over">
		<PopInHead :title="title" v-on:close="returnResult" />
		<SearchAndFilter full-search="1" v-on:terms="x => terms = x" />
		<section class="list">

			<figure class="item" v-for="item in filteredList" @click="returnResult(item)">
				<figure class="title">{{item.title}}</figure>
				<figure class="description">{{item.description}}</figure>
			</figure>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchAndFilter from "../../reusable/SearchAndFilter";
	import {BlockchainsArray, blockchainName} from '@walletpack/core/models/Blockchains';
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {SearchAndFilter},
		props:['popin'],
		data(){return {
			terms:'',
		}},
		computed:{
			title(){
				return this.popin.data.props.title;
			},
			filteredList(){
				return this.popin.data.props.list.filter(x => x.title.toLowerCase().trim().indexOf(this.terms) > -1);
			},
		},
		methods:{
			returnResult(value){
				this.popin.data.callback(value);
				this[UIActions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		}

	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.select-from-list {
		min-width:400px;
		max-width:600px;
		height:500px;

		.list {
			background:$lightergrey;
			height:calc(500px - 40px - 70px);
			overflow-y: auto;
			padding:20px;

			.item {
				background:$white;
				border:1px solid $lightgrey;
				padding:10px;
				margin-bottom:10px;
				border-radius:$radius;
				cursor: pointer;

				.title {
					font-size: $large;
					font-weight: bold;
				}

				.description {
					margin-top:10px;
					font-size: $small;
				}

				&:hover {
					border:1px solid $blue;

					.title {
						color:$blue;
					}
				}
			}
		}
	}

</style>