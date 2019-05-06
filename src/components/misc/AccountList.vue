<template>
	<section class="accounts-list">
		<section class="account" v-for="account in accounts" @click="$emit('account', account)">
			<section class="head">
				<figure class="network">{{account.network().name}}</figure>
				<figure class="danger" v-if="!limitedInfo && account.hasDangerousAuthority()">Owner imported <i class="icon-attention"></i></figure>
			</section>

			<section class="info">
				<figure class="symbol" :class="`token-${account.blockchain()}-${account.blockchain()}`"></figure>
				<figure class="account-name" :class="{'small':account.sendable().length > 12}">{{account.sendable()}}</figure>
				<figure class="keypair-name">{{account.keypair().name}}</figure>
			</section>

			<section class="tail">
				<section class="resources" v-if="usesResources(account) && !limitedInfo">
					<section class="resource" v-for="i in [1,1,1]">
						<figure class="icon-check"></figure>
						<figure class="type">CPU</figure>
					</section>
				</section>
				<figure v-else class="dummy"></figure>

				<section class="tokens" :class="{'full-width':limitedInfo}">
					<figure class="balance">${{account.totalFiatBalance()}}</figure>
					<figure class="count">in {{account.tokens().length}} tokens</figure>
				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import PluginRepository from "../../plugins/PluginRepository";

	export default {
		props:['accounts', 'limitedInfo'],
		computed:{

		},
		methods:{
			usesResources(account){
				return PluginRepository.plugin(account.blockchain()).usesResources()
			}
		}

	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.accounts-list {
		padding:40px 40px 20px 40px;
		display:flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-content: flex-start;

		.account {
			cursor: pointer;
			width:calc(50% - 10px);
			border-radius:10px;
			box-shadow:0 1px 3px $blue-shadow;
			border:1px solid rgba(0,0,0,0.05);
			padding:15px;
			margin-bottom:20px;
			height:200px;
			background:$white;

			@media (min-width:$breakpoint-large-desktop){
				width:calc(25% - 10px);
			}

			transition:all 0.2s ease;
			transition-property: box-shadow;

			.head {
				font-size: $small;
				display:flex;
				justify-content: space-between;

				.danger {
					color:$red;
					font-weight: bold;

					i {
						display:inline-block;
						animation: pulsate 1s ease infinite;
					}
				}
			}

			.info {
				display:flex;
				flex-direction: column;
				justify-content: center;
				text-align:center;
				height:122px;

				.symbol {
					font-size: 48px;
				}

				.account-name {
					margin-top:5px;
					font-size: 18px;
					font-weight: bold;

					&.small {
						font-size: $medium;
					}
				}

				.keypair-name {
					font-size: $tiny;
					font-weight: bold;
					margin-top:2px;
				}
			}

			.tail {
				display:flex;
				justify-content: space-between;
				align-items: flex-end;
				height:36px;

				.resources {
					display:flex;

					.resource {
						padding-right:10px;

						.icon {
							color:$blue;
							margin-bottom:2px;
						}

						.type {
							font-size: $small;
						}
					}
				}

				.dummy {}

				.tokens {
					text-align:right;

					.balance {
						font-size: $medium;
						font-weight: bold;
						margin-bottom:2px;
					}

					.count {
						font-size: $small;
					}

					&.full-width {
						width:100%;
					}
				}
			}

			&:hover {
				box-shadow:0 8px 18px $blue-shadow;
			}
		}

	}
</style>