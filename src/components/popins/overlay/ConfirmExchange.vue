<template>
	<section class="pop-over confirm">

		<section class="details">
			<img src="../../../assets/icon_exchange_big.png" class="icon" />
			<label>Exchanging</label>

			<section class="amounts">
				<figure class="amount">{{order.deposit}} {{symbols.from}}</figure>
				<figure class="arrow bounce-right icon-right-small"></figure>
				<figure class="amount">{{parseFloat(order.expected).toFixed(pair.decimals)}} {{symbols.to}}</figure>
			</section>
			<section class="accounts" v-if="accounts.from !== accounts.to">
				<figure class="account">{{accounts.from}}</figure>
				<figure class="arrow bounce-right icon-right-small"></figure>
				<figure class="account">{{accounts.to}}</figure>
			</section>
			<section class="accounts" v-else>
				<figure class="account">{{accounts.from}}</figure>
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
	import * as UIActions from "../../../store/ui_actions";

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
			pair(){ return this.popin.data.props.pair; },
		},
		methods:{
			returnResult(x){
				this.popin.data.callback(x);
				this[UIActions.RELEASE_POPUP](this.popin);
			},
			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">



</style>