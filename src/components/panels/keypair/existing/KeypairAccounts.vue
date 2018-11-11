<template>
	<section>
		<section class="basics" v-if="account">
			<section class="info">
				<figure class="network">{{blockchainName(account.blockchain())}} on {{account.network().name}}</figure>
				<figure class="identifier">{{account.sendable()}}</figure>
				<section class="authorities" v-if="authorities.length">
					<figure class="authority" :class="{'red':authority === 'owner'}" v-for="authority in authorities">{{authority}}</figure>
				</section>
			</section>
			<section class="tokens">
				View 4 tokens <i class="icon-right-open-big"></i>
			</section>
		</section>

		<section class="moderations" v-if="account && account.blockchain() === Blockchains.EOSIO">
			<section class="moderation" v-for="percentage in [2, 50, 88]">
				<figure class="name">CPU</figure>
				<figure class="percentage-bar">
					<figure class="bar" :style="{'width':percentage + '%'}"></figure>
				</figure>
				<figure class="action">
					<btn small="1" text="Manage"></btn>
				</figure>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {Blockchains} from "../../../../models/Blockchains";

	export default {
		data(){return {
			Blockchains,
		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
			authorities(){
				if(!this.account.authority.length) return [];
				return this.accounts.filter(x => x.sendable() === this.account.sendable() && x.network().unique() === this.account.network().unique())
					.map(x => x.authority)
			},
		},
		props:['account'],
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../../_variables";



	.basics {
		padding:20px;
		display:flex;
		flex-direction: row;
		justify-content: space-between;

		.info {
			flex:1;

			.network {
				font-size: 11px;
				color: $mid-dark-grey;
			}

			.identifier {
				margin-top:5px;
				font-size: 20px;
				font-weight: 300;
			}

			.authorities {
				margin-top:5px;

				.authority {
					font-size: 9px;
					font-weight: bold;
					padding:2px 4px;
					border:1px solid $dark-blue;
					color:$dark-blue;
					border-radius:4px;
					display:inline-block;
					margin-right:3px;

					&.red {
						border:1px solid $red;
						background:$red;
						color:#fff;
					}
				}
			}
		}

		.tokens {
			display:flex;
			align-items: center;
			color:$dark-blue;
			font-weight: bold;
			cursor: pointer;

			i {
				margin-left:5px;
			}

			&:hover {
				i {
					animation: bounce 0.7s infinite;
				}
			}

			@keyframes bounce {
				0%, 100% {
					transform:translateX(0px);
				}

				50% {
					transform:translateX(4px);

				}
			}
		}

	}

	.moderations {
		padding:20px;
		background:#f4f5f5;

		.moderation {
			display:flex;
			flex-direction: row;
			align-items: center;

			&:not(:last-child){
				margin-bottom:5px;
			}

			.name {
				font-size: 14px;
			}

			.action {

			}
		}
	}

</style>