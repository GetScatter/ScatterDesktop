import './styles/styles.scss'
import './styles/animations.scss'
import './styles/popins.scss'
import './styles/confirm.scss'
import './styles/blockchain-lists.scss'

import Helpers, {ipcRenderer} from './util/ElectronHelpers';

import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import {RouteNames} from './vue/Routing'
import { QrcodeReader } from 'vue-qrcode-reader'


import ViewBase from './components/ViewBase.vue'
import Button from './components/reusable/Button.vue'
import Input from './components/reusable/Input.vue'
import Select from './components/reusable/Select.vue'
import SearchBar from './components/reusable/SearchBar.vue'
import Slider from './components/reusable/Slider.vue'
import PopInHead from './components/reusable/PopInHead.vue'
import Switcher from './components/reusable/Switcher.vue'
import SearchAndFilter from './components/reusable/SearchAndFilter.vue'
import AnimatedNumber from './components/reusable/AnimatedNumber.vue'
import ActionBar from './components/reusable/ActionBar.vue'
import WindowService from './services/electron/WindowService';
import * as Actions from "@walletpack/core/store/constants";
import WalletTalk from "./util/WalletTalk";
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
			{tag:'Button', vue:Button},
			{tag:'Input', vue:Input},
			{tag:'Select', vue:Select},
			{tag:'Slider', vue:Slider},
			{tag:'Switcher', vue:Switcher},
			{tag:'SearchBar', vue:SearchBar},
			{tag:'SearchAndFilter', vue:SearchAndFilter},
			{tag:'ActionBar', vue:ActionBar},
			{tag:'view-base', vue:ViewBase},
			{tag:'PopInHead', vue:PopInHead},
			{tag:'AnimatedNumber', vue:AnimatedNumber},
		];

		const middleware = (to, next) => {
			if(to.name === RouteNames.POP_OUT) return next();

			if(!store.getters.unlocked && to.name !== RouteNames.LOGIN){
				return next({name:RouteNames.LOGIN});
			}

			return next();
		};

		Helpers.initializeCore();

		ipcRenderer.on('loaded', (e,payload) => {
			store.dispatch(Actions.HOLD_SCATTER, payload);
		})
		ipcRenderer.send('load');

		new VueInitializer(Routing.routes(), components, middleware);
		WalletTalk.setup();
	}

}

new Main();
