<template>
	<section class="sidebar"> <!-- no-collapse -->
		<figure class="category" v-for="category in items">
			<figure class="category-name" v-if="category.name">{{category.name}}</figure>
			<router-link :key="item.name" :to="{name:item.route}" class="item" :class="{'active':$route.name === item.route}" v-for="(item, i) in category.items">
				<i :class="`sidebar-sidebar_${item.name.toLowerCase()}`"></i>
				<span>{{item.name}}</span>
			</router-link>
		</figure>
	</section>
</template>

<script>
	import {RouteNames} from "../vue/Routing";

	export default {
		data(){return {

		}},
		computed:{
			items(){
				return [
					{
						name:null,
						items:[
							{name:'Apps', route:RouteNames.HOME},
							{name:'Wallet', route:RouteNames.WALLET},
							{name:'Items', route:RouteNames.ITEMS},
							{name:'Assets', route:RouteNames.HOME},
							{name:'Identities', route:RouteNames.HOME},
							{name:'Contacts', route:RouteNames.HOME},
						]
					},
					{
						name:'Administrative',
						items:[
							{name:'History', route:RouteNames.HOME},
							{name:'Networks', route:RouteNames.HOME},
							{name:'Settings', route:RouteNames.HOME},
						]
					}
				]
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	$time:0.12s;

	.sidebar {
		flex:0 0 auto;
		width:64px;
		height:$fullheight;
		border-right:1px solid $border;
		padding:20px 0;
		transition:all $time ease;
		transition-property: width;
		overflow-x:hidden;
		white-space: nowrap;

		.item {
			cursor: pointer;
			height:50px;
			width:100%;
			padding:0 20px;
			display:flex;
			align-items: center;
			color:$silver;
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
				transition-property: margin-left, opacity;
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

		&:hover, &.no-collapse {
			width:260px;

			.category-name {
				opacity:1;
			}

			.item {
				span {
					margin-left:0;
					opacity:1;
				}
			}
		}
	}


</style>