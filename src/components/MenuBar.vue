<template>
	<section class="menu-bar">
		<transition name="slide-up" mode="out-in">
			<router-link v-if="loaded && $route.name !== RouteNames.LOGIN" :to="{name:RouteNames.HOME}" class="logo">Scatter</router-link>
		</transition>

		<section class="actions" v-if="isWindows">

			<!-- MINIMIZE -->
			<section class="action" @click="minimize">
				<section class="action-inner">
					<figure class="line"></figure>
				</section>
			</section>

			<!-- EXPAND / CONTRACT -->
			<section class="action" @click="maximize">
				<section class="action-inner">
					<figure class="sqr"></figure>
				</section>
			</section>

			<!-- QUIT -->
			<section class="action" @click="quit">
				<section class="action-inner">
					<figure class="x1"></figure>
					<figure class="x2"></figure>
				</section>
			</section>
		</section>
	</section>
</template>

<script>

	import {remote} from '../util/ElectronHelpers';

	export default {
		data(){return {
			loaded:false,
		}},
		mounted(){
			setTimeout(() => {
				this.loaded = true;
			}, 500);
		},
		methods:{
			quit(){
				remote.app.quit();
			},
			minimize(){
				remote.BrowserWindow.getFocusedWindow().hide();
			},
			maximize(){
				const win = remote.BrowserWindow.getFocusedWindow();
				win.isMaximized() ? win.unmaximize() : win.maximize();
			},
		},
		computed:{
			isWindows(){ return remote.process.platform === 'win32'; },
			isMacOS(){ return remote.process.platform === 'darwin'; },
			isLinux(){ return !this.isWindows && !this.isMacOS; }
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
			font-size: 45px;
			display:inline-block;
			height:80px;
			line-height: 80px;
			padding-top:3px;
			cursor: default;
			-webkit-app-region: drag;
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

			$action:15px;

			.action {
				float:right;
				padding:10px;
				cursor: pointer;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				border-radius:4px;

				&:hover {
					background:rgba(255,255,255,0.1);
				}

				.action-inner {
					width:$action;
					height:$action;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}

				&:not(:first-child){
					margin-left:25px;
				}

				.x1, .x2 {
					width:18px;
					height:2px;
					background:#fff;
					transform-origin: center center;
				}

				.x1 { transform:rotateZ(45deg); }
				.x2 { transform:rotateZ(-45deg); margin-top:-2px; }

				.sqr {
					height:$action;
					width:$action;
					border:2px solid #fff;
				}

				.line {
					height:2px;
					width:$action;
					background:#fff;
				}
			}
		}
	}


</style>
