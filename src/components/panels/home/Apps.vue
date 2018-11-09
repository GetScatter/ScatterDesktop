<template>
	<section class="apps">
		<transition name="slide-left" mode="out-in">

			<!-- HAS APPS -->
			<section key="apps" v-if="origins.length">
				<SearchBar placeholder="Search Keys" v-on:terms="x => searchTerms = x" />
				<section class="list">
					<!--<section class="item" v-for="keypair in vaultEntries">-->
					<!--<section class="details">-->
					<!--<figure class="title">{{keypair.name}}</figure>-->
					<!--<p>{{keypair.accounts().length}} linked accounts</p>-->
					<!--</section>-->
					<!--<figure class="chevron icon-right-open-big"></figure>-->

					<!--</section>-->
				</section>
			</section>

			<!-- DOES NOT HAVE APPS -->
			<section key="empty" class="placeholder" v-else>
				<section>
					<img src="../../../assets/rocketship.png" />
					<h5>No apps connected</h5>
					<p>Apps are at the heart of what makes Scatter awesome. You can explore apps and connect to them below.</p>
				</section>
			</section>
		</transition>
		<section class="action-bar short bottom centered">
			<btn blue="1" text="Explore Apps" v-on:clicked="goToApps"></btn>
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
				'permissions',
			]),
			origins(){
				const origins = {};

				this.permissions.map(p => {
					if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
					else origins[p.origin] += 1;
				});

				return Object.keys(origins).reduce((acc, origin) => {
					if(origin.toString().toLowerCase().indexOf(this.searchTerms.toLowerCase()) !== -1)
						acc[origin] = origins[origin];

					return acc;
				}, {});
			}

		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../_variables";

	.apps {
		flex:1;
		position: relative;
		display:flex;
		flex-direction: column;
	}

	.placeholder {
		flex:1;
		display:flex;
		justify-content: center;
		align-items: center;

		max-width:260px;
		margin:0 auto;
		text-align:center;
	}

	.list {
		flex:1;
		padding:10px 30px;

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