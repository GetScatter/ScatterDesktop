<template>
	<section class="pop-over confirm">

		<section class="details">
			<Exchange class="icon" />
			<label>Exchanging</label>

			<section class="amounts">
				<figure class="amount">{{order.deposit}} {{symbols.from}}</figure>
				<figure class="arrow bounce-right icon-right-small"></figure>
				<figure class="amount">{{parseFloat(order.expected).toFixed(pair.decimals)}} {{symbols.to}}</figure>
			</section>
			<section class="accounts">
				<figure class="account">{{accounts.from}}</figure>
				<figure class="arrow bounce-right icon-right-small"></figure>
				<figure class="account">{{accounts.to}}</figure>
			</section>
		</section>
		<section class="tail">
			<Button :text="locale(langKeys.GENERIC.Cancel)" @click.native="returnResult(false)" />
			<Button :text="locale(langKeys.GENERIC.Confirm)" blue="1" @click.native="returnResult(true)" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import Exchange from '../../svgs/quick-actions/Exchange'

	export default {
		props:['popin'],
		components:{Exchange},
		data () {return {

		}},
		created(){

		},
		computed:{
			symbols(){ return this.popin.data.props.symbols; },
			accounts(){ return this.popin.data.props.accounts; },
			order(){ return this.popin.data.props.order; },
			pair(){ return this.popin.data.props.pair; },
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