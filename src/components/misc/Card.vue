<template>
	<section class="card" @click="$emit('clicked', card)">
		<section class="head">
			<CreditCardIcon class="symbol" />
		</section>

		<Button v-if="!asSelector" class="delete" icon="icon-trash" />
		<Button v-if="asSelector" class="delete" icon="icon-dot-3" />

		<section class="info">
			<figure class="card-name">{{card.name}}</figure>
			<figure class="card-number">
				<span v-for="i in [1,1,1]">XXXX</span>
				<span>{{card.lastFour}}</span>
			</figure>
			<section class="expiration">
				<figure class="valid-until">VALID<br/>UNTIL</figure>
				<figure class="date">{{card.expiration}}</figure>
			</section>
			<section class="identity">
				<!--<figure class="id-name">{{card.identity().name}}</figure>-->
				<figure class="full-name">{{card.identity().fullname()}}</figure>
			</section>
		</section>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import CreditCardIcon from '../../components/svgs/CreditCard';

	export default {
		props:['card', 'asSelector'],
		components:{CreditCardIcon},
		computed:{
			...mapGetters([

			]),
		},
		methods:{

		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.card {
		position: relative;
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
		display:flex;
		flex-direction: column;
		justify-content: space-between;

		.head {
			flex:1;

			.symbol {
				margin-top:-5px;
				height:30px;
			}
		}

		.info {
			display:flex;
			flex-direction: column;
			justify-content: center;

			.card-name {
				margin-top:5px;
				font-size: 18px;
				font-weight: bold;
				&.small {
					font-size: $medium;
				}
			}

			.card-number {
				margin-top:2px;
				font-weight: bold;
				font-size: $medium;

				span {
					padding:0 5px;

					&:first-child {
						padding-left:0;
					}

					&:not(:last-child){
						color:$grey;
					}
				}
			}

			.expiration {
				display:flex;
				margin-top:10px;

				.valid-until {
					font-size: $tiny;
					font-weight: bold;
				}
				.date {
					font-weight: bold;
					font-size: $large;
					padding-left:10px;
				}
			}

			.identity {
				margin-top:25px;


				.id-name {
					font-size: $tiny;
					font-weight: bold;
				}

				.full-name {
					margin-top:3px;
					font-size: $small;
					font-weight: bold;
				}
			}
		}

		.delete {
			position:absolute;
			top:10px;
			right:10px;
			text-align:right;
		}

		&:hover {
			box-shadow:0 8px 18px $blue-shadow;
		}
	}
</style>