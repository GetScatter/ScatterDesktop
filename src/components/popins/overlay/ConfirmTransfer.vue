<template>
	<section class="pop-over confirm">

		<section class="details">
			<img src="../../../assets/icon_send_big.png" class="icon" />
			<label>Transferring</label>

			<figure class="amount">{{token.amount}} {{token.symbol}}</figure>
			<section class="accounts">
				<figure class="account">{{from}}</figure>
				<figure class="arrow bounce-right icon-right-small"></figure>
				<figure class="account">{{to}}</figure>
			</section>
			<figure class="memo" v-if="memo">
				<b>memo</b>
				<span>{{memo}}</span>
			</figure>
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


</style>