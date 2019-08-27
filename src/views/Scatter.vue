<template>
    <section class="marketplace">
        <webview ref="webview" class="webview" src="http://localhost:8081/" :preload="preload" />
    </section>
</template>

<script>
	import StoreService from "@walletpack/core/services/utility/StoreService";

	const path = require('path');

	import {ipcRenderer, remote} from '../util/ElectronHelpers';
	import * as FileService from '../services/electron/FileService'
	import SocketService from "../services/electron/SocketService";
	import StorageService from "../services/electron/StorageService";
	import WindowService from "../services/electron/WindowService";
	import Scatter from "@walletpack/core/models/Scatter";
	import * as Actions from "@walletpack/core/store/constants";
	import WebViewService from "../services/electron/WebViewService";


    export default {
    	data(){return {
		    ready:false,
            StorageService,
            FileService,
            SocketService,
            WindowService,
        }},
    	computed:{
    	    preload:() => `file://${path.join(remote.app.getAppPath(), 'preload.js')}`,
        },

        mounted(){
            WebViewService.set(this.$refs.webview);

	        ipcRenderer.on('scatter', async (e, payload) => {
	        	const {service, method, data, id} = payload;
	        	console.log('ipc', service, method, data, id);

	        	if(![
	        		'FileService',
                    'SocketService',
                    'StorageService',
                    'WindowService',
                ].includes(service)) return; // console.log('Propagated from embed: ', service, method, data, id);

	        	if(service === 'StorageService'){
	        		// TODO: Clear out keys, and rebind when saving
	        		if(method === 'getScatter'){
				        const scatter = StoreService.get().state.scatter.clone();
	        			return WebViewService.get().send('scatter', {data:StoreService.get().state.scatter.clone(), id})
                    }
	        		if(method === 'setScatter'){
	        			const scatter = Scatter.fromJson(...data);
                        await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	        			return WebViewService.get().send('scatter', {data:StoreService.get().state.scatter.clone(), id})
                    }
                }


	        	const result = await this[service][method](...data);
	        	console.log('result', service, method, result);
		        WebViewService.get().send('scatter', {data:result, id})

	        });

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
