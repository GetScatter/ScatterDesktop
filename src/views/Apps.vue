<template>
	<section class="apps">
		<PanelTabs :tabs="tabs" :state="this.selectedCategory ? this.selectedCategory : state" v-on:selected="setState" />

		<section class="scroller" ref="scroller" v-if="state === STATES.EXPLORE">
			<figure class="blue-bg"></figure>
			<section class="padder">
				<section class="featured" v-if="featuredApps.length > 1">
					<Carousel :slides="featuredApps" />
				</section>

				<section class="categories">

					<section class="category" :class="{'singular':selectedCategory}" v-for="category in categories" v-if="!selectedCategory || selectedCategory === category.type">
						<section class="info" v-if="!selectedCategory">
							<figure class="name">{{category.type}}</figure>
							<figure class="view-all" v-if="category.apps.length > 4" @click="selectCategory(category)">View all {{category.apps.length}} apps <i class="icon-right-open-big"></i></figure>
						</section>

						<section class="apps">
							<router-link :to="{name:RouteNames.APP, params:{applink:app.applink}}" class="app" :key="app.applink" v-for="app in selectedCategory ? category.apps : category.apps.slice(0,10)">
								<figure class="image" :class="{'no-image':!getAppData(app.applink).hasOwnProperty('img')}">
									<img v-if="getAppData(app.applink).hasOwnProperty('img')" :src="getAppData(app.applink).img" />
								</figure>
								<figure class="name">{{app.name}}</figure>
							</router-link>
						</section>

					</section>
				</section>
			</section>
		</section>



		<section v-if="state === STATES.MINE">
			<SearchAndFilter v-on:terms="x => terms = x" :filters="filters" />

			<section class="scroller with-search">
				<section class="linked-apps">
					<section class="app" v-for="app in linkedApps">
						<figure class="image">
							<img v-if="getAppData(app.applink).hasOwnProperty('img')" :src="getAppData(app.applink).img" />
						</figure>
						<section class="info">
							<figure class="name">{{app.name}}</figure>
							<figure class="category">{{app.type}}</figure>
						</section>
						<section class="actions">
							<Button @click.native="$router.push({name:RouteNames.APP, params:{applink:app.applink}})" text="Manage" />
							<Button v-if="canOpenApp(app.applink)" @click.native="openApp(app.applink)" text="Open" blue="1" />
						</section>
					</section>
				</section>
			</section>
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import SingletonService from "../services/utility/SingletonService";
	import PanelTabs from "../components/reusable/PanelTabs";
	import ObjectHelpers from "../util/ObjectHelpers";
	import AppsService from "../services/apps/AppsService";
	import Carousel from "../components/reusable/Carousel";


	const STATES = {
		EXPLORE:'explore',
		MINE:'mine',
	}

	export default {
		components: {Carousel, PanelTabs},
		data () {return {
			state:STATES.EXPLORE,
			STATES,
			selectedCategory:null,
			terms:'',
			typeFilter:null,
		}},
		computed:{
			...mapState([
				'scatter',
				'dappLogos',
				'dappData',
			]),
			...mapGetters([
				'permissions',
				'apps',
			]),
			tabs(){
				let tabs = [
					{name:'Explore', state:STATES.EXPLORE},
				];
				if(this.selectedCategory) tabs.splice(1, 0, { name:this.selectedCategory, state:this.selectedCategory });
				if(this.apps.length) tabs.push({name:'My Apps', state:STATES.MINE});
				return tabs;
			},
			categories(){
				if(!this.dappData) return {};
				return Object.keys(this.dappData).reduce((acc, key) => {
					const item = this.dappData[key];
					if(!acc.find(x => x.type === item.type)) acc.push({type:item.type, apps:[]});
					acc.find(x => x.type === item.type).apps.push(item);
					return acc;
				}, []).map(cat => {
					ObjectHelpers.shuffle(cat.apps);
					if(this.selectedCategory) return cat;
					cat.apps = cat.apps.filter(({applink}) => this.getAppData(applink).hasOwnProperty('img'));
					return cat;
				}).sort((a,b) => {
					return b.apps.length - a.apps.length
				});
			},
			featuredApps(){
				if(!this.categories || !this.categories.length) return [];
				if(!this.selectedCategory) return this.categories[0].apps.filter(app => {
					return this.getAppData(app.applink).hasOwnProperty('img');
				}).slice(0,3);
				return this.categories.find(x => x.type === this.selectedCategory).apps.slice(0,3);
			},
			filters(){
				return [
					{
						selected:this.typeFilter,
						options:[null].concat(this.categories.map(x => x.type)),
						parser:x => x === null ? 'All Categories' : x,
						onSelect:x => this.typeFilter = x,
					}
				]
			},
			linkedApps(){
				return this.apps.map(({origin:applink}) => {
					return this.getAppData(applink);
				}).filter(app => {
					return app.type === this.typeFilter || !this.typeFilter
				}).filter(app => {
					return app.name.toLowerCase().indexOf(this.terms) > -1
				});
			}
		},
		mounted(){
			this.init();
		},
		methods:{
			async init(){
				if(this.$route.query.hasOwnProperty('state')){
					this.state = this.$route.query.state;
				}

				if(this.$route.query.hasOwnProperty('category')){
					this.selectedCategory = this.$route.query.category;
				}

				await SingletonService.init();
				await AppsService.getApps();
			},
			getAppData:AppsService.getAppData,
			setState(state){
				if(state === this.selectedCategory) return;
				this.$router.push({ query: {state} });
				this.state = state;
				this.selectedCategory = null;
				this.scrollToTop();
			},
			selectCategory(category){
				this.$router.push({ query: {category:category.type} });
				this.selectedCategory = category.type;
				this.scrollToTop();
			},
			scrollToTop(){
				this.$nextTick(() => {
					if(!this.$refs.scroller) return;
					this.$refs.scroller.scrollTop = 0;
				})
			}
		},
		created(){
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

	.apps {
		.scroller {
			position: relative;
			height:calc(100vh - 220px);
			overflow-y:scroll;

			&.with-search {
				height:calc(100vh - 290px);
			}

			.blue-bg {
				position: absolute;
				top:0;
				left:0;
				right:0;
				height:70px;
				background:$blue-gradient-completer;
				z-index:1;
			}

			.padder {
				padding:0 40px;
				position: relative;
				z-index:2;
			}

			.featured {

			}

			.categories {
				margin-top:40px;

				.category {
					margin-bottom:40px;

					.info {
						display:flex;
						justify-content: space-between;
						font-size: $medium;
						font-weight: bold;
						margin-bottom:15px;

						.name {
							font-size: 22px;
						}

						.view-all {
							color:$blue;
							cursor: pointer;
						}
					}

					.apps {
						white-space: nowrap;
						overflow-y:auto;
						padding-bottom:20px;

						&:after {
							content: "";
							flex: auto;
						}


						.app {
							display:inline-block;
							width:calc(20% - 15px);
							max-width:200px;

							.image {
								border-radius:20px;
								overflow:hidden;
								position: relative;

								&:after {
									content: "";
									display: block;
									padding-bottom: 100%;
								}

								img {
									position: absolute;
									top:0; bottom:0; left:0; right:0;
									width:100%;
									height:100%;
								}

							}

							.name {
								margin-top:10px;
								text-align:center;
								font-size: $small;
								font-weight: bold;
							}

						}
					}

					&:not(.singular){
						.apps {
							.app {
								margin-right:20px;

								&:last-child {
									margin-right:0;
								}
							}
						}
					}

					&.singular {
						.apps {
							white-space: normal;
							display:flex;
							flex-wrap: wrap;
							justify-content: space-between;

							.app {
								margin-bottom:50px;

								&:last-child {
									margin-left:20px;
								}
							}
						}
					}
				}
			}

			.linked-apps {
				padding:40px;

				.app {
					display:flex;
					align-items: center;

					.image {
						flex:0 0 auto;
						height:90px;
						width:90px;
						border-radius:20px;
						overflow:hidden;

						&.no-image {
							background:rgba(0,0,0,0.02);
						}

						img {
							height:90px;
							width:90px;
						}
					}

					.info {
						flex:1;
						padding:0 20px;

						.name {
							font-size: $medium;
							font-weight: bold;
							color:$blue;
							margin-bottom:5px;
						}

						.category {
							font-size: $small;
						}
					}

					.actions {
						flex:0 0 auto;
					}
				}
			}
		}
	}


</style>
