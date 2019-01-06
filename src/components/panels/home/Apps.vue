<template>
	<section class="apps">
		<section class="split-inputs">
			<SearchBar style="flex:1; margin-left:-10px;" :placeholder="locale(langKeys.DASHBOARD.APPS.SearchPlaceholder)" v-on:terms="x => searchTerms = x" />
			<btn small="1" style="margin-right:30px; font-weight: normal;" borderless="1" v-on:clicked="goToApps" text="Browse" />
		</section>

		<transition name="slide-right" mode="out-in">

			<!-- HAS APPS -->
			<section key="apps" class="list-container" v-if="permissions.length || searchTerms.length">

				<section class="list">
					<section v-for="(list, i) in [origins, originsFromSearch]">
						<section class="item" v-for="(count, origin) in list" :key="origin">

							<section class="actions" v-if="count !== 0">
								<span class="icon-edit-wrapper" @click="goToPermission(origin)">
									<i class="icon icon-pencil"></i>
								</span>
								<span class="icon-trash-wrapper" @click="removePermissions(origin)">
									<i class="icon icon-trash"></i>
								</span>
							</section>

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
							</section>

							<section class="button" v-if="getAppData(origin).url.length">
								<btn blue="1" :text="locale(langKeys.GENERIC.Open)" v-on:clicked="openApp(origin)" />
							</section>
							<section class="button" v-else>
								<btn disabled="1" :text="locale(langKeys.DASHBOARD.APPS.NoMeta)" />
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
	}

	.list {
		flex:1;
		padding:10px 30px 30px;
		overflow-y: auto;
		height: 0;

		.item {
			padding:20px 0 5px;
			display:flex;
			flex-direction: column;
			width:25%;
			height:200px;
			margin-bottom:20px;
			text-align:center;
			float:left;
			position:relative;
			background-color:white;
			transition:all 0.12s ease-in-out;
			border-radius:12px;

			&:hover {
				background-color:$lighter-grey;
			}

			&:hover .actions {
				display:block;
				opacity:1;
			} 

			&:hover .button {
				opacity:1;
			} 

			.actions {
				position:absolute;
				top:0;
				left:0;
				right:0;
				display:none;
				opacity:0;
				transition:all 0.12s ease-in-out;

				.icon-edit-wrapper {
					left:20px;
					position:absolute;
				}

				.icon-trash-wrapper {
					right:20px;
					position:absolute;
				}

				span {
					cursor: pointer;
					font-size: 16px;
					color:$dark-grey;
				    padding: 6px;
				    font-weight: normal;
				    text-decoration: none;
				    border-radius: 2px;
				    margin-top: 20px;
					border:1px solid rgba(0,0,0,.2);

					&:hover {
						color:#fff;
						background:$blue-grad;
						border:1px solid transparent;
					}
				}
			}

			@media(max-width:$breakpoint-small-desktop){
				width:33.3333%;
			}

			@media(max-width:$breakpoint-tablet){
				width:50%;
			}

			$icon-bounds:80px;

			.icon-wrapper {
				width:$icon-bounds;
				height:$icon-bounds;
				position: relative;
				margin: 0 auto 10px;
				border-radius: 3px;
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
					line-height:15px;
					font-size:9px;
					padding:4px;
					background:$reverse-gradient;
					text-align:center;
					opacity:0;
					transition:0.12s all ease-in-out;
					visibility: hidden;
					transition-property: top, bottom, opacity, visibility;
					box-shadow:0 -4px 10px rgba(0,0,0,0.2), 0 -1px 1px rgba(0,0,0,0.2);
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

			.button {
				align-items: center;
				transition:all 0.12s ease-in-out;
				opacity:0.14;
				margin-bottom:20px;

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