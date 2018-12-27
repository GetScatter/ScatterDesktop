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
						<section class="disclaimer less-pad red" style="margin-top:10px;">
							Please note that this is an estimate!
							<p>Token prices could change between now and the time it takes to complete the exchange. You may get slightly more or less than estimated.</p>
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
	import '../../../popins.scss';

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
	@import "../../../variables";

	.full-panel {
		background:$reverse-gradient;
	}

	.action-bar {
		button {
			width:auto;
			min-width:200px;

			&:last-child {
				margin-left:10px;
			}
		}
	}

	.container {
		display:flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.exchange {
		display:flex;
		align-items: center;
		width:450px;

		.icon {
			flex:0 0 auto;
			width:100px;
			height:100px;
			background:#fff;
			border-radius:50%;
			margin-right:30px;
			display:flex;
			justify-content: center;
			align-items: center;
			font-size: 24px;
			align-self: flex-start;
		}

		.info {
			text-align:left;

			.account, .value {
				color:#979aa5;
				font-size: 14px;
			}

			.amount {
				color:#fff;
				font-size: 36px;
				font-weight: bold;

				&.small {
					font-size: 24px;
				}
			}
		}
	}

	.breaker {
		margin:10px 0;
		font-size: 48px;
		color:#999ca7;
		text-align:left;
		width:100%;
		padding-left:17px;

		figure {
			animation: bounce 1s ease infinite;

			@keyframes bounce {
				0%, 100% {
					transform:translateY(-5px);
				}
				50% {
					transform:translateY(5px);
					color: #c8cddb;
				}
			}
		}
	}

</style>
