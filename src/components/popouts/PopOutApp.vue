<template>
	<!------------------------------------->
	<!------------ APP DETAILS ------------>
	<!------------------------------------->
	<section class="app-details">
		<figure class="logo" v-if="!untrusted" :class="{'border':app.applink !== 'Scatter' && !app.img}">
			<Scatter v-if="app.applink === 'Scatter'" />
			<img v-else-if="app.img" :src="app.img" />
			<span v-else>No Image</span>
		</figure>
		<figure class="logo scam" v-else>
			<i class="icon-attention"></i>
		</figure>
		<section v-if="ridlEnabled && app.applink !== 'Scatter'">
			<figure class="reputation" v-if="appReputation === false"><i class="icon-spin4 animate-spin"></i> loading reputation</figure>
			<section v-else>
				<figure class="reputation" v-if="unknownReputation">Unknown Reputation</figure>
				<figure class="reputation trusted" v-if="trusted">Trustworthy</figure>
				<figure class="reputation untrusted" v-if="untrusted">Known Scam</figure>
			</section>
		</section>

		<figure class="name"><b>{{app.name}}</b> <span v-if="suffix">{{suffix}}</span></figure>
	</section>
</template>

<script>
	import {mapState, mapGetters} from 'vuex';
	import Scatter from '../svgs/ScatterOutline'

	export default {
		components:{Scatter},
		props:['app', 'suffix'],
		computed:{
			...mapState([
				'appReputation'
			]),
			...mapGetters([
				'ridlEnabled',
			]),
			unknownReputation(){
				return this.appReputation === undefined;
			},
			trusted(){
				return this.appReputation && parseFloat(this.appReputation.decimal) > 0
			},
			untrusted(){
				return this.appReputation && parseFloat(this.appReputation.decimal) < 0
			}
		},
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.reputation {
		padding:5px 12px;
		border-radius:40px;
		font-size: $small;
		margin-bottom:10px;
		margin-top:-5px;
		font-weight: bold;
		background:$lightergrey;
		color:$grey;

		&.trusted {
			background:$darkgreen;
			color:$white;
		}

		&.untrusted {
			background:$red;
			color:$white;
		}
	}

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
			padding:5px;
			margin-bottom:20px;

			&.border {
				background: $lightergrey;
				border:1px solid $lightgrey;
			}

			img {
				height:100%;
				width:100%;
			}

			span {
				font-size: $small;
				font-weight: bold;
				color:$silver;
			}

			&.scam {
				font-size: 48px;
				border-radius:50%;
				color:$red;
				background: $lightergrey;
				border:1px solid $lightgrey;

				animation: pulsate 0.5s ease infinite;
			}
		}

		.name {
			font-size: $large;
		}
	}
</style>