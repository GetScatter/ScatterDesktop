<template>
	<section class="apps">
		<SearchBar :placeholder="locale(langKeys.DASHBOARD.APPS.SearchPlaceholder)" v-on:terms="x => searchTerms = x" />

		<transition name="slide-right" mode="out-in">


			<!-- HAS APPS -->
			<section key="apps" class="list-container" v-if="permissions.length || searchTerms.length">



				<section class="list">
					<section v-for="(list, i) in [origins, originsFromSearch]">
						<section class="item" v-for="(count, origin) in list">


							<!-- APP ICON -->
							<section class="icon-wrapper" @click="openApp(origin)">
								<figure class="icon">
									<img v-if="getAppData(origin).hasOwnProperty('img')" :src="getAppData(origin).img" />
								</figure>
								<figure class="app-type" v-if="getAppData(origin).type.length">{{getAppData(origin).type}}</figure>
							</section>

							<!-- APP DETAILS -->
							<section class="details">
								<figure class="title"
								        @click="openApp(origin)"
								        :class="{'has-url':getAppData(origin).url.length}">{{getAppData(origin).name}}</figure>

								<p class="description" v-if="getAppData(origin).description.length"><b>{{getAppData(origin).description}}</b></p>

								<p v-if="count === 1">{{locale(langKeys.DASHBOARD.APPS.LinkPermissionOnly)}}</p>
								<p v-if="count > 1">{{locale(langKeys.DASHBOARD.APPS.NPermissions, count)}}</p>
								<p v-if="count === 0">No permissions.</p>

								<section class="actions" v-if="count !== 0">
								<span @click="goToPermission(origin)">
									{{locale(langKeys.DASHBOARD.APPS.EditApp)}}
								</span>
									<span @click="removePermissions(origin)">
									{{locale(langKeys.DASHBOARD.APPS.DeleteApp)}}
								</span>
								</section>
							</section>

							<section class="button" v-if="getAppData(origin).url.length">
								<btn text="Open" v-on:clicked="openApp(origin)" />
							</section>

						</section>

						<figure class="breaker disclaimer less-pad" v-if="i === 0 && Object.keys(originsFromSearch).length">
							Below are apps that you aren't linked with.<br>
							<span>Note that these apps are not added by the Scatter team, but by the apps themselves. The display of any app is not an endorsement of any kind, just a discovery mechanism.</span>
						</figure>
					</section>

				</section>



			</section>

			<!-- DOES NOT HAVE APPS -->
			<section key="empty" class="placeholder" v-else>
				<section>
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
					const matchesOrigin = origin.toString().toLowerCase().match(this.searchTerms);
					const matchesType = appdata.type.toLowerCase().match(this.searchTerms);
					const matchesDescription = appdata.description.toLowerCase().match(this.searchTerms);
					const matchesBlockchain = appdata.hasOwnProperty('blockchain') ? appdata.blockchain.toLowerCase().match(this.searchTerms) : false;
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
	@import "../../../_variables";

	.breaker {
		margin:20px 0;
		width:100%;
		color: $dark-grey;
		font-size: 14px;

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
	}

	.list {
		flex:1;
		padding:10px 30px 30px;
		overflow-y: auto;
		height: 0;
		border-top:2px solid #f4f4f4;

		.item {
			padding:20px 0 5px;
			display:flex;
			flex-direction: row;

			$icon-bounds:70px;

			.icon-wrapper {
				width:$icon-bounds;
				height:$icon-bounds;
				position: relative;
				margin: 0 auto;
				border-radius: 20px;
				overflow: hidden;
				cursor: pointer;

				.icon {
					width:$icon-bounds;
					height:$icon-bounds;
					background-image: url(../../../assets/no_logo.png);
					background-repeat: no-repeat;
					background-size: contain;
					background-position: 50%;
					background-color: #f7f7f7;
					overflow: hidden;

					img {
						width:100%;
						height:100%;
						border-radius:22px;
					}
				}

				.app-type {
					color:#fff;
					position:absolute;
					left:0;
					right:0;
					line-height:9px;
					font-size:9px;
					padding:4px;
					background:$dark-blue;
					text-align:center;
					opacity:0;
					transition:0.12s all ease-in-out;
					visibility: hidden;
					transition-property: top, bottom, opacity, visibility;
					box-shadow:0 -4px 10px rgba(0,0,0,0.2);
				}

				.app-type { bottom:-20px; }
			}

			&:hover {
				.app-type {
					opacity:1;
					visibility: visible;
					bottom:0;
				}
			}



			.details {
				flex:1;
				padding:0 15px;
				width:calc(100% - #{$icon-bounds});

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

				.actions {
					span {
						cursor: pointer;
						font-size: 11px;
						color:$dark-grey;
						text-decoration: underline;
						font-weight: bold;
						margin-right:8px;
						transition: 0.2s ease;
						transition-property: color;

						&:hover {
							color:$dark-blue;
						}
					}
				}
			}

			.button {
				width:100px;
				display:flex;
				justify-content: flex-end;
				align-items: center;

				button {
					width:auto;
				}
			}
		}
	}

	.action-bar {
		position:relative !important;
	}

</style>