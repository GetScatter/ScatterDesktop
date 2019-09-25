<template>
	<section class="popout-holder">
		<webview v-if="ready" ref="webview" class="webview" src="http://localhost:8081/#/popout" :preload="preload" />

	</section>
</template>

<script>


	const {ipcRenderer, remote} = window.require('electron');
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
				console.log('this.popOut.id', this.popOut, this.popOut.id);
				this.ready = true;
				this.$nextTick(() => this.setup());
			})
		},
		methods:{
			setup(){
				this.$refs.webview.addEventListener('dom-ready', () => {
					this.$refs.webview.openDevTools();
					this.$refs.webview.send('popout', this.popOut);
				})
			}
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../styles/variables";

	.popout-holder, .webview {
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
