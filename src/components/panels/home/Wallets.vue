<template>
	<section class="vault">
		<SearchBar style="margin-left:-10px;" :placeholder="locale(langKeys.DASHBOARD.KEYS.SearchPlaceholder)" v-on:terms="x => searchTerms = x" />
		<section class="list wallet-list">
			<section class="item" v-for="keypair in vaultEntries" @click="goToKeypair(keypair.id)">
				<section class="details">
					<figure class="title"><b>{{keypair.name}}</b></figure>
					<p>{{locale(langKeys.DASHBOARD.KEYS.LinkedAccounts, keypair.accounts(true).length)}}</p>
				</section>
				<figure class="chevron icon-right-open-big"></figure>

			</section>
		</section>
		<section class="action-bar short bottom centered">
			<btn blue="1" style="max-width:360px;" :text="locale(langKeys.DASHBOARD.KEYS.AddKeysButton)" v-on:clicked="newKeypair"></btn>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchBar from '../../reusable/SearchBar';
	import {RouteNames} from "../../../vue/Routing";

	export default {
		data(){return {
			searchTerms:'',
		}},
		components:{ SearchBar },
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'keypairs',
			]),
			vaultEntries(){
				return this.keypairs.filter(keypair => {
					return keypair.name.toLowerCase().indexOf(this.searchTerms) > -1
						|| keypair.accounts().some(x => x.name.toLowerCase().indexOf(this.searchTerms) > -1)
						|| keypair.publicKeys.some(x => x.key.toLowerCase().indexOf(this.searchTerms) > -1);
				});
			},
		},
		methods:{
			goToKeypair(id){
				this.$router.push({name:RouteNames.KEYPAIR, params:{id}});
			}
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.vault {
		flex:1;
		position: relative;
		display:flex;
		flex-direction: column;
	}

	.list {
		flex:1;
		padding:10px 30px;
		overflow-y: auto;
		height: 0;

		&.wallet-list {
			background-color:$lighter-grey;
		}

		.item {
			padding:20px 0 0;
			display:flex;
			flex-direction: row;
			cursor: pointer;

			.details {
				width:calc(100% - 20px);
			}

			.chevron {
				display:flex;
				align-items: center;
				font-size: 18px;
				width:20px;
				color:$primary;
			}

			&:hover {
				.chevron {
					animation: bounce 0.7s infinite;
				}
			}

			@keyframes bounce {
				0%, 100% {
					transform:translateX(0px);
				}

				50% {
					transform:translateX(-4px);

				}
			}
		}
	}

	.action-bar {
		position:relative !important;
	}

</style>