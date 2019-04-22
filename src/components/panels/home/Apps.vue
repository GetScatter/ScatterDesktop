<template>
	<section class="apps">
		<section class="split-inputs">
			<SearchBar style="flex:1; margin-left:-10px;" :placeholder="locale(langKeys.DASHBOARD.APPS.SearchPlaceholder)" v-on:terms="x => searchTerms = x" />
			<btn v-if="permissions.length" small="1" borderless="1" v-on:clicked="removeAll" :text="locale(langKeys.GENERIC.RemoveAll)" />
			<btn small="1" style="margin-right:30px; font-weight: normal;" v-on:clicked="goToApps" :text="locale(langKeys.GENERIC.Browse)" />
		</section>

		<transition name="slide-right" mode="out-in">

			<!-- HAS APPS -->
			<section key="apps" class="list-container" v-if="permissions.length || searchTerms.length">

				<section class="list">
					<section v-for="(list, i) in [origins, originsFromSearch]">
						<section class="item" v-for="(count, origin) in list" :key="origin">

							<!-- APP ICON -->
							<section class="icon-wrapper" @click="openApp(origin)">
								<figure class="icon">
									<img v-if="getAppData(origin).hasOwnProperty('img')" :src="getAppData(origin).img" />
								</figure>
							</section>

							<!-- APP DETAILS -->
							<section class="details">
								<figure class="title"
								        @click="openApp(origin)"
								        :class="{'has-url':getAppData(origin).url.length}">{{getAppData(origin).name}}</figure>
						        <figure v-if="getAppData(origin).url.length" class="app-type">{{getAppData(origin).type}}</figure>
						        <figure v-else class="app-type">{{locale(langKeys.DASHBOARD.APPS.NoMeta)}}</figure>
							</section>

							<section class="actions">
								<div class="button" v-if="getAppData(origin).url.length">
									<btn :text="locale(langKeys.GENERIC.Open)" v-on:clicked="openApp(origin)" />
								</div>
								<btn v-if="count !== 0" icon="icon-pencil" style="padding:0 7px;" @click.native="goToPermission(origin)" />
								<btn v-if="count !== 0" icon="icon-trash" style="padding:0 7px;" @click.native="removePermissions(origin)" />
							</section>

						</section>
					</section>

				</section>



			</section>

			<!-- DOES NOT HAVE APPS -->
			<section key="empty" class="placeholder" v-else>
				<section style="margin-top:-50px;">
					<img src="../../../assets/rocketship.png" />
					<h5>{{locale(langKeys.DASHBOARD.APPS.NoAppsTitle)}}</h5>
					<p>{{locale(langKeys.DASHBOARD.APPS.NoAppsDescription)}}</p>
				</section>
			</section>
		</transition>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import {BlockchainsArray} from '../../../models/Blockchains';
	import SearchBar from '../../reusable/SearchBar';
	import PermissionService from "../../../services/PermissionService";
	import AppsService from "../../../services/AppsService";
	import ObjectHelpers from "../../../util/ObjectHelpers";

	export default {
		data(){return {
			searchTerms:'',
		}},
		components:{ SearchBar },
		mounted(){
			AppsService.getApps();
		},
		computed:{
			...mapState([
				'scatter',
				'dappLogos',
				'dappData',
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

				return this.search(origins);
			},
			originsFromSearch(){
				if(!this.searchTerms.length) return {};
				const fromGeneralSearch = this.search(this.dappData, true);
				Object.keys(this.origins).map(x => delete fromGeneralSearch[x]);


				return ObjectHelpers.objectTake(fromGeneralSearch, 25);
			}
		},

		methods:{
			search(appkeys, fakeCount = false){
				return Object.keys(appkeys).reduce((acc, origin) => {
					const appdata = this.getAppData(origin);
					const matchesOrigin = origin.toString().toLowerCase().indexOf(this.searchTerms) > -1;
					const matchesType = appdata.type.toLowerCase().indexOf(this.searchTerms) > -1;
					const matchesDescription = appdata.description.toLowerCase().indexOf(this.searchTerms) > -1;
					const matchesBlockchain = appdata.hasOwnProperty('blockchain') ? appdata.blockchain.toLowerCase().indexOf(this.searchTerms) > -1 : false;
					if(matchesOrigin || matchesType || matchesDescription || matchesBlockchain)
						acc[origin] = fakeCount ? 0 : appkeys[origin];
					return acc;
				}, {});
			},
			getAppData:AppsService.getAppData,
			openApp(origin){
				const data = this.getAppData(origin);
				if(data.url.length){
					this.openInBrowser(data.url);
				}
			},
			removePermissions(origin){
				PermissionService.removeAllPermissionsFor(origin);
			},
			removeAll(){
				PermissionService.removeAllPermissions();
			},
			goToPermission(origin){
				this.$router.push({name:this.RouteNames.PERMISSION, params:{origin}})
			},
			...mapActions([
				Actions.SET_DAPP_LOGO,
				Actions.SET_DAPP_DATA,
			])
		}
	}

</script>


<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.breaker {
		margin:20px 0;
		color: $dark-grey;
		font-size: 14px;
	    position: fixed;
	    bottom: 0;
	    z-index: 1000;
	    right: 20px;
	    left: 35%;

		span {
			font-size: 11px;
			font-weight: bold;
			margin-top:5px;
			display:block;
		}
	}

	.apps {
		flex:1;
		position: relative;
		display:flex;
		flex-direction: column;
		overflow:hidden;
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

	.list-container {
		flex:1;
		display:flex;
		flex-direction: column;
		align-items:center;
	}

	.list {
		padding:10px;
		overflow-y: auto;
		width:100%;

		.item {
			padding:10px 20px;
			display:table;
			width:100%;
			margin-bottom:2px;
			text-align:left;
			float:left;
			position:relative;
			background-color:white;
			border:1px solid white;
			transition:all 0.12s ease-in-out;
			border-radius:12px;

			section {
				display:table-cell;
				vertical-align:middle;
			}

			&:hover {
				background:$lighter-grey;
			}

			.actions {
				text-align:right;

				button {
					float:right;
					margin-left:6px;
					width:auto;
					opacity:0;
				}
				.button {
					float:right;
					width:auto;
					button {
						opacity:1;
					}
				}
			}

			&:hover {
				.actions button {
					opacity:1;
				}
			}

			@media(min-width:$breakpoint-small-desktop){
				width:50%;
			}

			$icon-bounds:72px;

			.icon-wrapper {
				width:$icon-bounds;
				height:$icon-bounds;
				position: relative;
				border-radius: 60px;
				overflow: hidden;
				cursor: pointer;

				.icon {
					width:$icon-bounds;
					height:$icon-bounds;
					background-color: darken($lighter-grey,2%);
					overflow: hidden;

					img {
						width:100%;
						height:100%;
						border-radius:22px;
					}
				}

			}

			.app-type {
				color:$dark-grey;
				font-size:11px;
				margin-bottom:6px;
			}

			.details {
				padding:0 15px;
				position:relative;

				p {
					margin-bottom:5px;
				}

				.permissions-type {
					
				}

				&:hover .permissions-type {
					
				}

				.title {
					&.has-url {
						cursor: pointer;

						&:hover {
							text-decoration: underline;
						}
					}
				}

				.description {
					margin-top:3px;
					margin-bottom:5px;
					font-size: 9px;
					line-height: 11px;
					color:$dark-grey;
				}

			}

		}
	}

	.action-bar {
		position:relative !important;
	}

</style>