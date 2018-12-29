<template>
	<section>
		<back-bar v-on:back="returnResult(null)" style="border-bottom:0;" />
		<section class="full-panel center-fold inner with-action">
			<section class="container">
				<section class="exchange">
					<figure class="icon">{{token.symbol.length > 4 ? token.symbol[0] : token.symbol}}</figure>
					<section class="info">
						<figure class="account">{{from}}</figure>
						<figure class="amount" :class="{'small':token.amount.toString().length > 10}">{{token.amount}} {{token.symbol}}</figure>
						<section class="memo" v-if="memo && memo.length">
							{{memo}}
						</section>
					</section>
				</section>
				<figure class="breaker">
					<figure class="icon-down-small"></figure>
				</figure>
				<section class="exchange">
					<figure class="icon">{{token.symbol.length > 4 ? token.symbol[0] : token.symbol}}</figure>
					<section class="info">
						<figure class="amount" :class="{'small':token.amount.toString().length > 10}">{{token.amount}} {{token.symbol}}</figure>
						<figure class="account">{{to}}</figure>
					</section>
				</section>

			</section>
		</section>
		<section class="action-bar short bottom centered" style="border-top:0;">
			<btn :text="locale(langKeys.GENERIC.Deny)" red="1" v-on:clicked="returnResult(false)" />
			<btn :text="locale(langKeys.GENERIC.Confirm)" blue="1" v-on:clicked="returnResult(true)" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';

	export default {
		props:['popin'],
		data () {return {

		}},
		created(){

		},
		computed:{
			from(){ return this.popin.data.props.from; },
			to(){ return this.popin.data.props.to; },
			token(){ return this.popin.data.props.token; },
			memo(){ return this.popin.data.props.memo; },
		},
		methods:{
			returnResult(x){
				this.popin.data.callback(x);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/confirm";


</style>
