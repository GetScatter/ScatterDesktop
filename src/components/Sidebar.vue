<template>
	<section class="sidebar-container">
		<section class="placeholder"></section>
		<section class="sidebar"> <!-- no-collapse -->
			<figure class="bar-bg"></figure>
			<figure class="category" v-for="category in items">
				<figure class="category-name" v-if="category.name">{{category.name}}</figure>
				<router-link @click.native="clearBacks" :key="item.name" :to="{name:item.route}" class="item" :class="{'active':$route.name === item.route}" v-for="(item, i) in category.items">
					<i :class="`sidebar-sidebar_${item.name.toLowerCase()}`"></i>
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
							this.accounts.length ? {name:'Items', route:RouteNames.ITEMS} : null,
							this.accounts.length ? {name:'RIDL', route:RouteNames.RIDL} : null,
							{name:'Identities', route:RouteNames.IDENTITIES},
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
			clearBacks(){
				this.setQuickActionsBack(false);
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	$time:0.12s;
	$closed:64px;
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
		padding:20px 0;
		overflow-x:hidden;
		white-space: nowrap;
		position:fixed;
		left:0;
		top:40px;
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

		.item {
			cursor: pointer;
			height:50px;
			width:100%;
			padding:0 20px;
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

				i {
					color:$blue;
				}

				span {
					font-weight: bold;
					color:$black;
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

		&:not(.no-collapse){
			&:hover {
				transition: width $time ease, box-shadow 0.3s ease;
				box-shadow:10px 0 30px rgba(0,0,0,0.15), 2px 0 10px $blue-shadow;
				border:0;
			}
		}

		&:hover, &.no-collapse {
			width:$open;

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


</style>