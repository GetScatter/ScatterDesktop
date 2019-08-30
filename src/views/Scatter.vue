<template>
	<section class="marketplace">
		<webview ref="webview" class="webview" src="http://localhost:8081/" :preload="preload" />
	</section>
</template>

<script>
	const path = require('path');

	import {ipcRenderer, remote} from '../util/ElectronHelpers';
	import WebViewService from "../services/electron/WebViewService";


	export default {
		computed:{
			preload:() => `file://${path.join(remote.app.getAppPath(), 'preload.js')}`,
		},
		mounted(){
			WebViewService.set(this.$refs.webview);
			WebViewService.get().addEventListener('dom-ready', () => {
				// WebViewService.get().openDevTools();
				// setTimeout(() => {
				//     WebViewService.get().executeJavaScript('window.injector();');
				// }, 1000);

				WebViewService.get().executeJavaScript('window.injector();');
			})

		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

	.marketplace, .webview {
		height:$fullheight;
	}





</style>
