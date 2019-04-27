<template>
	<section class="quick-actions">
		<section class="left">
			<section class="fiat">
				<span class="balance">$1,2345.20</span>
				<Refresh class="refresh" />
			</section>
			<section class="token">
				<i class="symbol token-eos-eos"></i>
				<span class="balance">$1,2345.20</span>
			</section>
		</section>

		<section class="right">
			<section class="action">
				<Receive />
				<span>Receive</span>
			</section>
			<section class="action">
				<Send />
				<span>Send</span>
			</section>
			<section class="action">
				<Exchange />
				<span>Exchange</span>
			</section>
		</section>
	</section>
</template>

<script>
	import Send from './svgs/quick-actions/Send';
	import Refresh from './svgs/quick-actions/Refresh';
	import Exchange from './svgs/quick-actions/Exchange';
	import Receive from './svgs/quick-actions/Receive';

	export default {
		components:{
			Send,
			Refresh,
			Exchange,
			Receive
		}

	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.quick-actions {
		height:180px;
		width:100%;
		background:$blue;
		/* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#007fd7+0,00a8ff+100 */
		background: #007fd7; /* Old browsers */
		background: $blue-gradient;
		padding:40px;

		display:flex;
		color:$white;

		.left { flex:1; }
		.right {
			flex:0 0 auto;
			display:flex;
		}

		.fiat {
			display:flex;
			align-items: center;

			.balance {
				font-size: 24px;
				font-weight: bold;
			}
			.refresh {
				cursor: pointer;
				font-size: 24px;
				margin-left:10px;
			}
		}

		.token {
			display:flex;
			align-items: center;
			margin-top:5px;

			.balance {
				font-size: $small;
				font-weight: bold;
			}
			.symbol {
				cursor: pointer;
				font-size: 24px;
			}
		}

		.action {
			height:55px;
			display:flex;
			flex-direction: column;
			justify-content: center;
			padding:0 20px;
			font-size: $small;
			text-align:center;
			cursor: pointer;

			&:last-child {
				border-left:2px solid rgba(255,255,255,0.2);
				padding-left:30px;
				margin-left:10px;
				padding-right:0;
			}
		}
	}

</style>