<template>
	<section class="cards-list">
		<Card :key="card.id" :card="card" v-for="card in filteredCards" />
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import CreditCard from "@walletpack/core/models/CreditCard";
	import CreditCardIcon from '../../components/svgs/CreditCard';
	import Card from './Card';

	export default {
		components:{Card, CreditCardIcon},
		computed:{
			...mapGetters([
				'identities'
			]),
			filteredCards(){
				return [
					CreditCard.fromJson({
						identityId:this.identities[0].id,
						name:'Test Card',
						lastFour:'1234',
						expiration:'04/20',
						cardHash:'asdljkfasjklhdfhaskljdfhjksalhfdjlhasljfhlhaksdflkj',
						secure:{
							number:'1234123412341234',
							cvx:'1234',
							authTokens:{},
						}
					})
				]
			}
		},
		methods:{

		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.cards-list {
		padding:40px 40px 20px 40px;
		display:flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-content: flex-start;


	}
</style>