<template>
	<section class="marketplace">
		<webview ref="webview" class="webview" src="http://localhost:8081/" :preload="preload" />
	</section>
</template>

<script>
	import PopupService from "../services/utility/PopupService";

	const path = require('path');

	import {ipcRenderer, remote} from '../util/ElectronHelpers';
	import WebViewService from "../services/electron/WebViewService";
	import {Popup} from "../models/popups/Popup";
	import WebHashChecker from "../services/utility/WebHashChecker";


	export default {
		computed:{
			preload:() => `file://${path.join(remote.app.getAppPath(), 'preload.js')}`,
		},
		mounted(){

			const bindApp = () => {
				WebViewService.set(this.$refs.webview);
				WebViewService.get().addEventListener('dom-ready', () => {
					WebViewService.get().openDevTools();
				})
			}

			bindApp();
			// WebHashChecker.check().then(check => {
			// 	if(typeof check === 'object' && check.hasOwnProperty('error')){
			// 		return PopupService.push(Popup.snackbar(check.error));
			// 	}
			//
			// 	bindApp();
			// })



		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

	.marketplace, .webview {
		height:$fullheight;
	}





</style>
