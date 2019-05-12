<template>
	<!------------------------------------->
	<!------------ APP DETAILS ------------>
	<!------------------------------------->
	<section class="app-details">
		<figure class="logo">
			<Scatter v-if="app.applink === 'Scatter'" />
			<img v-else-if="app.img" :src="app.img" />
			<span v-else>No Image</span>
		</figure>
		<figure class="name"><b>{{app.name}}</b> <span v-if="suffix">{{suffix}}</span></figure>
	</section>
</template>

<script>
	import Scatter from '../svgs/ScatterOutline'
	export default {
		components:{Scatter},
		props:['app', 'suffix']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.app-details {
		text-align:center;
		display:flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		$logo:100px;
		.logo {
			display:flex;
			align-items: center;
			justify-content: center;
			height:$logo;
			width:$logo;
			border-radius:$radius;
			background: $lightergrey;
			border:1px solid $lightgrey;
			padding:5px;
			margin-bottom:20px;

			img {
				height:100%;
				width:100%;
			}

			span {
				font-size: $small;
				font-weight: bold;
				color:$silver;
			}
		}

		.name {
			font-size: $large;
		}
	}
</style>