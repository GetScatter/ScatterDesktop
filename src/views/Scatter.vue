<template>
	<section class="marketplace">
		<webview ref="webview" class="webview" src="http://localhost:8081/" :preload="preload" />
	</section>
</template>

<script>

	const path = require('path');

	const {ipcRenderer, remote} = window.require('electron');
	import WebHashChecker from "../services/utility/WebHashChecker";


	export default {
		computed:{
			preload:() => `file://${path.join(remote.app.getAppPath(), 'preload.js')}`,
		},
		mounted(){
			console.log('mounted scatter');

			ipcRenderer.on('socketResponse', (event, payload) => {
				console.log('got socket response in scatter desktop', payload);
				this.$refs.webview.send('socketResponse', payload);
			})

			const bindApp = () => {
				console.log('wv?', this.$refs.webview);
				// WebViewService.set('main', this.$refs.webview);
				// console.log('get wv', WebViewService.get('main'));
				this.$refs.webview.addEventListener('dom-ready', () => {
					this.$refs.webview.openDevTools();
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
