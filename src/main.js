import './styles.scss'
import './tour.scss';

import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import {RouteNames} from './vue/Routing'
import { QrcodeReader } from 'vue-qrcode-reader'
import WindowService from './services/WindowService';
import ElectronHelpers from './util/ElectronHelpers';
ElectronHelpers.bindContextMenu();

// Globals
import MenuBar from './components/MenuBar.vue'
import UserBar from './components/UserBar.vue'
import ViewBase from './components/ViewBase.vue'
import Processes from './components/Processes.vue'

// POPUPS
import Popups from './components/Popups.vue'
import PopInHead from './components/popups/fragments/PopInHead.vue'

// POP OUTS
import GetIdentity from './views/popouts/GetIdentity.vue'
import SignatureRequest from './views/popouts/SignatureRequest.vue'
import LinkApp from './views/popouts/LinkApp.vue'
import GetPublicKey from './views/popouts/GetPublicKey.vue'
import TransferRequest from './views/popouts/TransferRequest.vue'

// Reusable components
import InputComponent from './components/reusable/InputComponent.vue'
import ButtonComponent from './components/reusable/ButtonComponent.vue'
import SelectComponent from './components/reusable/SelectComponent.vue'
import SwitchComponent from './components/reusable/SwitchComponent.vue'
import SliderComponent from './components/reusable/SliderComponent.vue'
import PercentageBarComponent from './components/reusable/PercentageBarComponent.vue'
import BackBar from './components/reusable/BackBar.vue'

// f12 to open console from anywhere.
document.addEventListener("keydown", function (e) {
	if (e.which === 123) WindowService.openTools();
});

class Main {

	constructor(){

		const hash = location.hash.replace("#/", '');

		const shared = [
			{tag:'popups', vue:Popups},
			{tag:'pop-in-head', vue:PopInHead},
			{tag:'btn', vue:ButtonComponent},
			{tag:'cin', vue:InputComponent},
			{tag:'sel', vue:SelectComponent},
			{tag:'swch', vue:SwitchComponent},
			{tag:'back-bar', vue:BackBar},

			{tag:'menu-bar', vue:MenuBar},
			{tag:'user-bar', vue:UserBar},
			{tag:'view-base', vue:ViewBase},
			{tag:'processes', vue:Processes},
		];

		let fragments;
		if(hash === 'popout'){
			fragments = [
				{tag:'get-identity', vue:GetIdentity},
				{tag:'signature-request', vue:SignatureRequest},
				{tag:'link-app', vue:LinkApp},
				{tag:'get-public-key', vue:GetPublicKey},
				{tag:'transfer-request', vue:TransferRequest},
			]
		} else {
			fragments = [
				{tag:'p-bar', vue:PercentageBarComponent},
				{tag:'slider', vue:SliderComponent},
				{tag:'qr-reader', vue:QrcodeReader},
			]
		}

		const components = shared.concat(fragments);

		const routes = Routing.routes();

		const middleware = (to, next, store) => {
			if(hash === 'popout') return next();
			if(Routing.isRestricted(to.name))
				store.getters.unlocked ? next() : next({name:RouteNames.LOGIN});
			else next();
		};

		new VueInitializer(routes, components, middleware, async (router, store) => {

		});

		window.onerror = log => {
			alert(log);
			console.log('err logged', log);
		};


		// window.eval = global.eval = () => {
		//     // throw new Error(`Sorry, this app does not support window.eval().`)
		// }
	}

}

new Main();
