<template>
	<section class="apps">
		<transition name="slide-left" mode="out-in">


			<!-- HAS APPS -->
			<section key="apps" class="list-container" v-if="permissions.length">
				<SearchBar placeholder="Search Apps" v-on:terms="x => searchTerms = x" />
				<section class="list">
					<section class="item" v-for="(count, origin) in origins">

						<!-- APP ICON -->
						<section class="icon-wrapper" @click="openApp(origin)">
							<figure class="icon">
								<img v-if="originLogo(origin)" :src="originLogo(origin)" />
							</figure>
							<figure class="app-type" v-if="getAppData(origin).type.length">{{getAppData(origin).type}}</figure>
						</section>

						<!-- APP DETAILS -->
						<section class="details">
							<figure class="title"
							        @click="openApp(origin)"
							        :class="{'has-url':getAppData(origin).url.length}">{{getAppData(origin).name}}</figure>

							<p class="description" v-if="getAppData(origin).description.length"><b>{{getAppData(origin).description}}</b></p>

							<p v-if="count === 1">Link permission only</p>
							<p v-if="count > 1">{{count}} Permissions</p>

							<section class="actions">
								<span>Edit</span>
								<span @click="removePermissions(origin)">Delete</span>
							</section>
						</section>

					</section>
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
	import * as Actions from '../../../store/constants';
	import {BlockchainsArray} from '../../../models/Blockchains';
	import SearchBar from './SearchBar';
	import PermissionService from "../../../services/PermissionService";

	export default {
		data(){return {
			searchTerms:'',
		}},
		components:{ SearchBar },
		mounted(){
			fetch(`https://rawgit.com/GetScatter/ScatterApps/master/apps.json?rand=${Math.random() * 10000 + 1}`).then(res => res.json()).then(res => {
				let allApps = [];
				BlockchainsArray.map(({value}) => {
					allApps = allApps.concat(res[this.blockchainName(value)]);
				});
				allApps = allApps.reduce((acc,x) => {
					acc[x.applink] = x;
					return acc;
				});
				this[Actions.SET_DAPP_DATA](allApps);
			});
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

				return Object.keys(origins).reduce((acc, origin) => {
					if(origin.toString().toLowerCase().indexOf(this.searchTerms.toLowerCase()) !== -1)
						acc[origin] = origins[origin];

					return acc;
				}, {});
			}

		},
		methods:{
			getAppData(origin){
				const emptyResult = {
					type:'',
					name:origin,
					description:'',
					logo:'',
					url:'',
				};

				const found = this.dappData[origin];
				if(!found) return emptyResult;

				if(!this.dappLogos.hasOwnProperty(origin)){
					this[Actions.SET_DAPP_LOGO]({origin, logo:null});
					const logo = `https://rawgit.com/GetScatter/ScatterApps/master/logos/${found.applink}.svg`;
					fetch(logo).then(res => {
						this[Actions.SET_DAPP_LOGO]({origin, logo:res.status === 200 ? logo : null});
						this.$forceUpdate();
					})
				}

				const maxDescriptionLength = 70;
				if(found.description.length > maxDescriptionLength){
					found.description = `${found.description.substr(0,70)}${found.description.length > 70 ? '...':''}`
				}

				return found;
			},
			originLogo(origin){
				return this.dappLogos[origin];
			},
			openApp(origin){
				const data = this.getAppData(origin);
				if(data.url.length){
					this.openInBrowser(data.url);
				}
			},
			removePermissions(origin){
				PermissionService.removeAllPermissionsFor(origin);
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
		}
	}

	.action-bar {
		position:relative !important;
	}

</style>