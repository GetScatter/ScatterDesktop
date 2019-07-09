<template>
	<section class="sidebar-container" :class="{'locked':!sidebarLocked}">
		<section class="placeholder"></section>
		<section class="sidebar">
			<figure class="bar-bg"></figure>
			<figure class="category" v-for="category in items">
				<figure class="category-name" v-if="category.name">{{category.name}}</figure>
				<router-link :key="item.name" :to="{name:item.route}" class="item" :class="{'active':$route.name === item.route}" v-for="(item, i) in category.items">
					<i :class="itemIcon(item)"></i>
					<span>{{item.name}}</span>
				</router-link>
			</figure>

			<figure class="lock-sidebar" @click="toggleSidebar">
				<i class="icon-lock"></i>
			</figure>
		</section>
	</section>
</template>

<script>
	import {mapGetters, mapState, mapActions} from 'vuex';
	import * as Actions from '../store/constants'
	import {RouteNames} from "../vue/Routing";

	export default {
		data(){return {

		}},
		computed:{
			...mapState([
				'history',
				'sidebarLocked'
			]),
			...mapGetters([
				'accounts',
			]),

			items(){
				return [
					{
						name:null,
						items:[
							{name:'Dashboard', route:RouteNames.DASHBOARD},
							this.accounts.length ? {name:'Apps', route:RouteNames.HOME} : null,
							{name:'Wallet', route:RouteNames.WALLET},
							this.accounts.length ? {name:'Assets', route:RouteNames.ASSETS} : null,
							// this.accounts.length ? {name:'Marketplace', route:RouteNames.ITEMS} : null,
							{name:'Identities', route:RouteNames.IDENTITIES},
							{name:'Locations', route:RouteNames.LOCATIONS},
							this.accounts.length ? {name:'Reputation', route:RouteNames.RIDL} : null,
							this.features.creditCards ? {name:'Purchase', route:RouteNames.PURCHASE} : null,
						].filter(x => !!x)
					},
					{
						name:'Administrative',
						items:[
							{name:'Contacts', route:RouteNames.CONTACTS},
							this.history.length ? {name:'History', route:RouteNames.HISTORIES} : null,
							{name:'Networks', route:RouteNames.NETWORKS},
							{name:'Settings', route:RouteNames.SETTINGS},
						].filter(x => !!x)
					}
				]
			}
		},
		mounted(){
			this[Actions.SET_SIDEBAR](window.localStorage.getItem('sidebar') === 'true');
		},
		methods:{
			itemIcon(item){
				if(item.name === 'Reputation') return 'sidebar-sidebar_ridl';
				if(item.name === 'Marketplace') return 'sidebar-sidebar_items';
				return `sidebar-sidebar_${item.name.toLowerCase()}`
			},
			toggleSidebar(){
				this[Actions.SET_SIDEBAR](!this.sidebarLocked);
				window.localStorage.setItem('sidebar', this.sidebarLocked);
			},
			...mapActions([
				Actions.SET_SIDEBAR
			])
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	$time:0.2s;
	$closed:64px;
	$open:200px;

	.sidebar-container {
		-webkit-user-select: none !important;
		width:$closed;
		transition:width $time ease; // Matches carousel timeout

		.placeholder {
			width:$closed;
			height:$fullheight;
		}

		.sidebar {
			flex:0 0 auto;
			width:$closed;
			border-right:1px solid $lightgrey;
			border-bottom:1px solid $lightgrey;
			border-left:1px solid $lightgrey;
			padding:20px 0;
			overflow-x:hidden;
			white-space: nowrap;
			position:fixed;
			left:0;
			top:34px;
			bottom:0;
			background:$white;
			z-index:10000;
			box-shadow:0 0 0 transparent, 0 0 0 transparent;

			transition: width $time ease, box-shadow 1.1s ease;

			.bar-bg {
				width:$closed;
				position:absolute;
				left:0;
				top:0;
				bottom:0;
				z-index:-1;
			}

			.lock-sidebar {
				position:absolute;
				bottom:10px;
				left:10px;
				right:10px;
				padding:10px;
				color:$grey;
				cursor: pointer;

				transition:all 0.2s ease;
				transition-property: background, color;

				&:hover {
					background:rgba(0,0,0,0.03);
					color:$silver;
				}
			}

			.item {
				cursor: pointer;
				padding:12px;
				margin:0 12px;
				border-radius:$radius;
				display:flex;
				align-items: center;
				color: $lightgrey;
				transition:all $time ease;
				transition-property: background;

				i {
					padding-right:18px;
					font-size: 24px;
					transition:all $time ease;
					transition-property: color;
					color:$grey;
				}

				span {
					margin-left:5px;
					opacity:0;
					transition:all $time ease;
					transition-property: margin-left, opacity, color;
					font-size: $medium;
				}

				&:hover {
					background:rgba(0,0,0,0.02);
				}

				&:hover, &.active {

					background:$lightestgrey;

					i {
						color:$blue;
					}

					span {
						color:$blue;
					}
				}
			}

			.category-name {
				font-size: $small;
				font-weight: bold;
				text-transform: uppercase;
				padding:0 20px;
				margin-top:40px;
				margin-bottom:10px;
				opacity:0;
				transition:all $time ease;
				transition-property: opacity;
			}


		}

		&:not(.locked){
			.sidebar {
				&:hover {
					width:$open;
					transition: width $time ease, box-shadow 0.3s ease;
					box-shadow:10px 0 30px rgba(0,0,0,0.15), 2px 0 10px $blue-shadow;
					border-right:0;

					.category-name {
						opacity:1;
					}

					.item {
						color:$silver;

						span {
							margin-left:0;
							opacity:1;
						}
					}
				}
			}
		}

		&.locked {
			width:$open;

			.sidebar {
				width:$open;
				transition: width $time ease, box-shadow 0.3s ease;

				.category-name {
					opacity:1;
				}

				.item {
					color:$silver;

					span {
						margin-left:0;
						opacity:1;
					}
				}
			}
		}
	}




</style>