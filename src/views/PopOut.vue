<template>
	<section class="marketplace">
		<webview v-if="ready" ref="webview" class="webview" src="http://localhost:8081/#/popout" :preload="preload" />
	</section>
</template>

<script>

	import WebViewService from "../services/electron/WebViewService";

	import {ipcRenderer, remote} from '../util/ElectronHelpers';
	import {mapState} from "vuex";
	const path = require('path');

	export default {
		data () {return {
			ready:false,
			popOut:null,
		}},
		computed:{
			...mapState([
				'scatter'
			]),
			preload:() => `file://${path.join(remote.app.getAppPath(), 'preload.js')}`,
		},
		beforeMount(){
			ipcRenderer.on('ready', (event, popOut) => {
				this.popOut = popOut;
				this.ready = true;
				this.$nextTick(() => this.setup());
			})
		},
		methods:{
			setup(){
				WebViewService.set(this.$refs.webview);
				WebViewService.get().addEventListener('dom-ready', () => {
					// WebViewService.get().openDevTools();
					WebViewService.get().executeJavaScript('window.injector();');
					WebViewService.get().send('popout', this.popOut);
				})
			}
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

	.marketplace, .webview {
		height:100vh;

		&:after {
			content:'';
			display:block;
			position:fixed;
			top:0;
			left:0;
			right:100px;
			height:40px;
			z-index:2;

			-webkit-app-region: drag;
			-webkit-user-select: none !important;

		}
	}

</style>
