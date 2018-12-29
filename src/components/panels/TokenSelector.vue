<template>
	<section class="panel-container limited">
		<h1>{{title}}</h1>

		<section class="custom" v-if="custom && token">
			<section class="split-inputs">
				<cin style="flex:1; margin-bottom:0;"
					 :placeholder="contractPlaceholder"
					 v-if="token.needsContract()"
					 :label="locale(langKeys.GENERIC.Contract)"
					 :text="token.contract"
					 v-on:changed="x => token.contract = x" />
			</section>
			<br>
			<section class="split-inputs">
				<cin placeholder="XXX"
					 :label="locale(langKeys.GENERIC.Symbol)"
					 :text="token.symbol"
					 v-on:changed="x => token.symbol = x" />

				<cin :placeholder="decimals" type="number"
					 :label="locale(langKeys.GENERIC.Decimals)"
					 :text="token.decimals"
					 v-on:changed="x => token.decimals = x" />

				<btn :text="locale(langKeys.TRANSFER.TOKENS.SaveTokenButton)" v-on:clicked="addToken" />
			</section>
		</section>

		<SearchBar style="margin-left:-30px;" :placeholder="locale(langKeys.GENERIC.Search)" v-on:terms="x => searchTerms = x" />

		<section v-for="list in lists">
			<br>
			<label>{{list.title}}</label>
			<section class="tokens">
				<section class="token" v-if="visible(token)" :class="{'active':list.active === token.id}" v-for="token in list.tokens" @click="list.handler(token.id)">
					<figure class="icon" v-if="!token.token || typeof token.token.symbolClass !== 'function'">{{token.symbol.length > 4 ? token.symbol[0] : token.symbol}}</figure>
					<figure class="icon" v-else :class="[{'small':token.token && token.token.symbol.length >= 4}, token.token.symbolClass()]">
						<span v-if="!token.token.symbolClass()">{{token.token.truncatedSymbol()}}</span>
					</figure>
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
	import Token from "../../models/Token";
	import PluginRepository from "../../plugins/PluginRepository";

	export default {
		props:['title', 'lists', 'custom'],
		components:{
			SearchBar
		},
		data () {return {
			searchTerms:'',
			token:null,
		}},
		computed:{
			...mapGetters([
				'displayCurrency'
			]),
			contractPlaceholder(){
				return PluginRepository.plugin(this.token.blockchain).contractPlaceholder();
			},
			decimals(){
				return PluginRepository.plugin(this.custom.blockchain()).defaultDecimals();
			}
		},
		created(){
			if(this.custom){
				this.token = Token.placeholder();
				this.token.blockchain = this.custom.blockchain();
				this.token.chainId = this.custom.network().chainId;
				this.token.decimals = this.decimals;
			}
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
			},
			async addToken(){
				this.token.name = this.token.symbol;
				if(await TokenService.addToken(this.token)) {
					this.$emit('custom', this.token.clone());
				}
			},
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.panel-container {
		overflow-y: auto;
		height: calc(100vh - 170px);
	}

	.custom {
		padding:20px 20px 5px;
		background:rgba(0,0,0,0.02);
		border:1px solid rgba(0,0,0,0.1);
		border-radius:4px;
		margin-top:10px;
		margin-bottom:30px;
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

				&.token-icon {
					font-size: 36px;
				}
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