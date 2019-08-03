import './styles/styles.scss'
import './styles/animations.scss'
import './styles/popins.scss'
import './styles/confirm.scss'
import './styles/blockchain-lists.scss'

// MUST BE LOADED FIRST
import ElectronHelpers from './util/ElectronHelpers';

import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import {RouteNames} from './vue/Routing'
import { QrcodeReader } from 'vue-qrcode-reader'
import WindowService from './services/utility/WindowService';
ElectronHelpers.bindContextMenu();

import MenuBar from './components/MenuBar.vue'
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
import PopOutHead from './components/popouts/PopOutHead.vue'
import SocketService from "./services/utility/SocketService";
import SingletonService from "./services/utility/SingletonService";

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

		const hash = location.hash.replace("#/", '');

		const shared = [
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

		let fragments;
		if(hash === 'popout') fragments = [
			{tag:'PopOutHead', vue:PopOutHead},
		]
		else {
			fragments = [
				// {tag:'slider', vue:SliderComponent},
				{tag:'qr-reader', vue:QrcodeReader},
			]
		}

		const components = shared.concat(fragments);
		const middleware = (to, next, store) => {
			if(hash === 'popout') return next();
			if(Routing.isRestricted(to.name))
				store.getters.unlocked ? next() : next({name:RouteNames.LOGIN});
			else next();
		};

		new VueInitializer(Routing.routes(), components, middleware, async (router, store) => {
			// SocketService.initialize();
		});

		// window.onerror = log => {
		// 	// alert(log);
		// 	console.log('err logged', log);
		// };


		// window.eval = global.eval = () => {
		//     // throw new Error(`Sorry, this app does not support window.eval().`)
		// }
	}

}

new Main();
