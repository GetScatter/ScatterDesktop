<template>
	<section class="pop-over">

		<!--<section class="confirmation">-->
			<!--<figure class="title">Confirm Transfer</figure>-->
		<!--</section>-->

		<section class="details">
			<Send class="icon" />
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
	import '../../../styles/popins.scss';
	import Send from '../../svgs/quick-actions/Send'

	export default {
		props:['popin'],
		components:{Send},
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

	.pop-over {
		margin:0 auto;
		display:flex;
		flex-direction: column;
		background:transparent;

		.details {
			flex:1;
			padding:45px 60px;
			display:flex;
			flex-direction: column;
			align-items: center;
			background:$blue-gradient;

			text-align:center;
			color:$white;

			.icon {
				width:80px;
				height:80px;

				svg {
					width:80px;
					height:80px;
				}
			}

			label {
				display:inline-block;
				color:$white;
			}

			.amount {
				margin-top:-5px;
				font-size: 24px;
				font-weight: bold;
			}

			.accounts {
				display:flex;
				justify-content: space-between;
				align-items: center;
				margin-top:30px;

				.account {
					min-width:180px;
					padding:10px 25px;
					border-radius:50px;
					background:$lightblue;
					font-size: $medium;
					font-weight: bold;
					box-shadow:0 1px 2px rgba(0,0,0,0.1);
				}

				.arrow {
					font-size: 24px;
					padding:0 10px;
					color:$lighterblue;
				}
			}

			.memo {
				margin-top:30px;
				font-size: $small;

				b {
					display:block;
					font-weight: bold;
					font-size: $tiny;
				}

				span {
					display:block;
					margin-top:5px;
				}

			}
		}

		.tail {
			justify-content: space-between;
			display:flex;
			align-items: center;
			border-top:1px solid $lightgrey;
			padding:10px 10px;
			text-align:center;
			background:$white;
		}
	}


</style>