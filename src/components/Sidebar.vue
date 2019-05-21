<template>
	<section class="sidebar-container">
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
		</section>
	</section>
</template>

<script>
	import {mapGetters, mapState} from 'vuex';
	import {RouteNames} from "../vue/Routing";

	export default {
		data(){return {

		}},
		computed:{
			...mapState([
				'history',
			]),
			...mapGetters([
				'accounts',
			]),

			items(){
				return [
					{
						name:null,
						items:[
							{name:'Apps', route:RouteNames.HOME},
							{name:'Wallet', route:RouteNames.WALLET},
							this.accounts.length ? {name:'Assets', route:RouteNames.ASSETS} : null,
							// this.accounts.length ? {name:'Items', route:RouteNames.ITEMS} : null,
							this.accounts.length ? {name:'Reputation', route:RouteNames.RIDL} : null,
							{name:'Identities', route:RouteNames.IDENTITIES},
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
		methods:{
			itemIcon(item){
				if(item.name === 'Reputation') return 'sidebar-sidebar_ridl';
				return `sidebar-sidebar_${item.name.toLowerCase()}`
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	$time:0.2s;
	$closed:200px;
	$open:200px;

	.sidebar-container {
		-webkit-user-select: none !important;
		.placeholder {
			width:$closed;
			height:$fullheight;
		}
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
		top:40px;
		bottom:0;
		background:$white;
		z-index:10000;

		.bar-bg {
			width:$closed;
			position:absolute;
			left:0;
			top:0;
			bottom:0;
			z-index:-1;
		}

		.item {
			cursor: pointer;
			padding:12px 20px;
			display:flex;
			align-items: center;
			color: $silver;
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
				opacity:1;
				transition:all $time ease;
				transition-property: margin-left, opacity, color;
				font-size: $large;
			}

			&:hover, &.active {
				background:lighten($blue, 45%);

				i {
					color:$blue;
				}

				span {
					color:black;
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
		}

		&:hover {
			width:$open;
			// transition: width $time ease, box-shadow 0.3s ease;
			// box-shadow:10px 0 30px rgba(0,0,0,0.15), 2px 0 10px $blue-shadow;
			// border-right:0;

			.category-name {
				opacity:1;
			}

			.item {
				color:$silver;

				span {
					opacity:1;
				}
			}
		}
	}


</style>