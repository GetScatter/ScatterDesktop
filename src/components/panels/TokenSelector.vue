<template>
	<section class="panel-container limited">
		<h1>{{title}}</h1>

		<SearchBar style="margin-left:-30px;" :placeholder="locale(langKeys.GENERIC.Search)" v-on:terms="x => searchTerms = x" />

		<section v-for="list in lists">
			<br>
			<label>{{list.title}}</label>
			<section class="tokens">
				<section class="token" v-if="visible(token)" :class="{'active':list.active === token.id}" v-for="token in list.tokens" @click="list.handler(token.id)">
					<figure class="icon">{{token.symbol.length > 4 ? token.symbol[0] : token.symbol}}</figure>
					<section class="data">
						<section>
							<div>{{token.name}}</div>
							<b>{{token.amount}}</b>
							<div style="margin-top:5px;" v-if="token.fiat">{{token.fiat}} {{displayCurrency}}</div>
						</section>
					</section>
				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../store/constants';
	import SearchBar from '../../components/reusable/SearchBar';
	import PriceService from '../../services/PriceService';
	import TokenService from "../../services/TokenService";

	export default {
		props:['title', 'lists'],
		components:{
			SearchBar
		},
		data () {return {
			searchTerms:'',
		}},
		computed:{
			...mapGetters([
				'displayCurrency'
			])
		},
		methods:{
			visible(token){
				if(!this.searchTerms.length) return true;

				if(!isNaN(this.searchTerms.replace(',',''))){
					const terms = parseFloat(this.searchTerms.replace(',',''));
					return parseFloat(token.amount.replace(',','')) > terms ||
						parseFloat(token.fiat || 0) > terms
				}

				return token.name.toLowerCase().indexOf(this.searchTerms) > -1 ||
					(token.token.hasOwnProperty('contract') ? token.token.contract.toLowerCase().indexOf(this.searchTerms) > -1 : false) ||
					token.symbol.toLowerCase().indexOf(this.searchTerms) > -1
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.panel-container {
		overflow-y: auto;
		height: calc(100vh - 170px);
	}

	.tokens {
		display:flex;
		flex-wrap: wrap;

		.token {
			cursor: pointer;
			border-radius:10px;
			border:1px solid $border-standard;
			width:calc(33.3333% - 10px);
			margin-bottom:10px;
			margin-right:10px;
			display:flex;
			align-items: center;
			transition:all 0.05s ease;
			transition-property: border, background, color;

			&:nth-child(3n+3){
				margin-right:0;
			}

			.icon {
				width:60px;
				height:100%;
				display:flex;
				justify-content: center;
				align-items: center;
				border-right:1px solid $border-standard;
				border-top-left-radius:6px;
				border-bottom-left-radius:6px;
				transition:all 0.05s ease;
				transition-property: background, color;
			}

			.data {
				padding:15px 20px;
				display:flex;
				flex-direction: column;
				align-items: center;

				div {
					font-size: 11px;
					margin-bottom:3px;
				}
			}

			&:hover {
				border:1px solid $primary;

				.icon {
					background:$primary;
					color:#fff;
				}
			}

			&.active {
				border:1px solid $primary;
				background:$primary;
				color:#fff;

				.icon {
					background: #484b62;
				}
			}

		}
	}

</style>