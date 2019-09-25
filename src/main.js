import './styles/styles.scss'
import './styles/animations.scss'
import './styles/popins.scss'
import './styles/confirm.scss'
import './styles/blockchain-lists.scss'

const {ipcRenderer} = window.require('electron');

import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import {RouteNames} from './vue/Routing'
import { QrcodeReader } from 'vue-qrcode-reader'


import ViewBase from './components/ViewBase.vue'
import WindowService from './services/electron/WindowService';
import * as Actions from "@walletpack/core/store/constants";
// import WalletTalk from "./util/WalletTalk";
import {store} from "./store/store";

// f12 to open console from anywhere.
document.addEventListener("keydown", e => {
	if (e.which === 123) WindowService.openTools();
});

document.onmousedown= e => {
	if( e.which === 2 ) e.preventDefault();
	// TODO: Add CMD click logic prevention
}

class Main {

	constructor(){
		const isPopOut = location.hash.replace("#/", '') === 'popout';

		const components = [
			{tag:'view-base', vue:ViewBase},
		];

		const middleware = (to, next) => {
			if(isPopOut && to.name !== RouteNames.POP_OUT) return next({name:RouteNames.POP_OUT});
			if(!isPopOut && to.name !== RouteNames.SCATTER) return next({name:RouteNames.SCATTER});
			return next();
		};

		// Helpers.initializeCore();

		ipcRenderer.on('loaded', (e,payload) => {
			store.dispatch(Actions.HOLD_SCATTER, payload);
		})
		ipcRenderer.send('load');

		new VueInitializer(Routing.routes(), components, middleware);
		// WalletTalk.setup();
	}

}

new Main();
