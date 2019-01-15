<template>
	<section>
		<back-bar v-on:back="returnResult(null)" style="border-bottom:0;" />
		<section class="full-panel center-fold inner with-action">
			<section class="container">
				<section class="exchange">
					<figure class="icon">{{symbols.from.length > 4 ? symbols.from[0] : symbols.from}}</figure>
					<section class="info">
						<figure class="account">{{accounts.from}}</figure>
						<figure class="amount" :class="{'small':order.deposit.toString().length > 10}">{{order.deposit}} {{symbols.from}}</figure>
						<!--<figure class="value">$20.00</figure>-->
					</section>
				</section>
				<figure class="breaker">
					<figure class="icon-down-small"></figure>
				</figure>
				<section class="exchange">
					<figure class="icon">{{symbols.to.length > 4 ? symbols.to[0] : symbols.to}}</figure>
					<section class="info">
						<figure class="amount" :class="{'small':order.expected.toString().length > 10}">{{order.expected}} {{symbols.to}}</figure>
						<figure class="account">{{accounts.to}}</figure>
						<!--<figure class="value">$20.00</figure>-->
						<section class="memo" style="margin-top:10px;">
							{{locale(langKeys.EXCHANGE.DisclaimerTitle)}}
							<p>{{locale(langKeys.EXCHANGE.DisclaimerDescription)}}</p>
						</section>
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
			symbols(){ return this.popin.data.props.symbols; },
			accounts(){ return this.popin.data.props.accounts; },
			order(){ return this.popin.data.props.order; },
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
