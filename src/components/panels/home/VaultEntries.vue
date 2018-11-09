<template>
	<section class="vault">
		<SearchBar placeholder="Search Keys" v-on:terms="x => searchTerms = x" />
		<section class="list">
			<section class="item" v-for="keypair in vaultEntries">
				<section class="details">
					<figure class="title">{{keypair.name}}</figure>
					<p>{{keypair.accounts().length}} linked accounts</p>
				</section>
				<figure class="chevron icon-right-open-big"></figure>

			</section>
		</section>
		<section class="action-bar short bottom centered">
			<btn blue="1" text="Add Keys" v-on:clicked="newKeypair"></btn>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchBar from './SearchBar';

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

		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../_variables";

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
				color:$dark-blue;
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