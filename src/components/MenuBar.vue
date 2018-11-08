<template>
	<section class="menu-bar">
		<figure class="logo">Scatter</figure>

		<section class="actions" v-if="isWindows">

			<!-- MINIMIZE -->
			<section class="action">
				<figure class="line"></figure>
			</section>

			<!-- EXPAND / CONTRACT -->
			<section class="action">
				<figure class="sqr"></figure>
			</section>

			<!-- QUIT -->
			<section class="action" @click="quit">
				<figure class="x1"></figure>
				<figure class="x2"></figure>
			</section>
		</section>
	</section>
</template>

<script>
	const { remote } = window.require('electron');

	// Now we can address the platform type, for different headers for Win32, Mac, etc.
	const platform = require('electron-platform');

	export default {
		methods:{
			quit(){
				remote.app.quit();
			}
		},
		computed:{
			isWindows(){
				if(platform.isWin32){
					return true;
				}
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import '../_variables.scss';

	.menu-bar {
		-webkit-app-region: drag;
		background:$light-blue;
		background-image: linear-gradient(-180deg, #39ADFF -20%, #62D0FD 100%);
		color:#fff;
		height:80px;
		line-height: 80px;
		width:100%;
		text-align:center;
		z-index: 10;
		position:absolute;
		top:0;
		left:0;
		right:0;

		.logo {
			font-family: 'Grand Hotel', sans-serif;
			font-size: 50px;
			display:inline-block;
			height:80px;
			line-height: 80px;
			padding-top:3px;
		}

		.actions {
			position:absolute;
			right:0;
			top:0;
			height:80px;
			line-height: 80px;
			display:flex;
			justify-content: center;
			align-items: center;
			padding:0 35px;
			-webkit-app-region: no-drag;

			$action:20px;

			.action {
				float:right;
				width:$action;
				height:$action;
				cursor: pointer;
				display: flex;
				flex-direction: column;
				justify-content: center;

				&:not(:first-child){
					margin-left:50px;
				}

				.x1, .x2 {
					width:25px;
					height:2px;
					background:#fff;
					transform-origin: center center;
				}

				.x1 { transform:rotateZ(45deg); }
				.x2 { transform:rotateZ(-45deg); margin-top:-2px; }

				.sqr {
					height:$action;
					border:2px solid #fff;
				}

				.line {
					height:2px;
					background:#fff;
				}
			}
		}
	}


</style>
