import Vue from 'vue'
import {mapState, mapActions} from 'vuex';
import VTooltip from 'v-tooltip'
import VueQrcodeReader from 'vue-qrcode-reader'


import VueRouter from 'vue-router'
import {RouteNames, Routing} from './Routing';
const Helpers = require('../util/ElectronHelpers').default;
import features from '../features';

import * as Actions from '@walletpack/core/store/constants'
import {blockchainName, Blockchains} from '@walletpack/core/models/Blockchains'
import {SETTINGS_OPTIONS} from '@walletpack/core/models/Settings'
import StoreService from "@walletpack/core/services/utility/StoreService";
import AppsService from "@walletpack/core/services/apps/AppsService";
import {dateId} from "@walletpack/core/util/DateHelpers";
import PriceService from "@walletpack/core/services/apis/PriceService";
import * as UIActions from "../store/ui_actions";

// TODO:
const LANG_KEYS = {};

Vue.config.productionTip = false

export let router;

/***
 * Sets up an instance of Vue.
 * This is shared between the popup.js and prompt.js scripts.
 */
export default class VueInitializer {

    constructor(routes,
                components,
                middleware = () => {},
                routerCallback = () => {}){

        this.setupVuePlugins();
        this.registerComponents(components);
        router = this.setupRouting(routes, middleware);

        StoreService.get().dispatch(Actions.LOAD_SCATTER).then(async () => {



            Vue.mixin({
                data(){ return {
	                RouteNames,
	                SETTINGS_OPTIONS,
                    langKeys:LANG_KEYS,
	                loadingReputation:false,
	                features,
                    // now:0,
                }},
	            computed:{
		            ...mapState([
		            	'working',
			            'priceData',
		            ])
	            },
                methods: {
	                blockchainName,
	                back(){ this.$router.back(); },
	                locale:(key, args) => {
	                	console.log('getting locale for', key, args);
		                return 'NO LOCALES';
	                },
	                newKeypair(){ this.$router.push({name:RouteNames.NEW_KEYPAIR}); },
	                canOpenApp(applink){
		                const data = AppsService.getAppData(applink);
		                return data.url.length;
	                },
	                fiatSymbol:PriceService.fiatSymbol,
	                getTokensTotaled(){
	                	if(!this.priceData || !this.priceData.hasOwnProperty('yesterday')) return [];
		                let totaled = [];
		                Object.keys(this.priceData.yesterday).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
			                totaled.push({hour, data:this.priceData.yesterday[hour], date:dateId(1)}));
		                Object.keys(this.priceData.today).filter(x => x !== 'latest').sort((a,b) => a - b).map(hour =>
			                totaled.push({hour, data:this.priceData.today[hour], date:dateId()}));
		                totaled = totaled.slice(totaled.length-(totaled.length > 24 ? 24 : totaled.length), totaled.length);
		                return totaled;
	                },
	                openApp(applink){
		                const data = AppsService.getAppData(applink);
		                if(data.url.length) this.openInBrowser(data.url);
	                },
	                openInBrowser(url){
		                Helpers.openLinkInBrowser(url);
                    },
	                setWorkingScreen(bool){ StoreService.get().dispatch(UIActions.SET_WORKING_SCREEN, bool); },
	                copyText(text){ Helpers.copy(text) },
	                publicKeyForKeypair(keypair){
		                if(!keypair) return null;
		                if(!keypair.hasOwnProperty('publicKeys')) return null;
		                return keypair.enabledKey().key;
	                },


                    formatNumber(num, commaOnly = false){
	                	if(!num) return 0;
	                    num = parseFloat(num.toString());
                        const toComma = x => {
                            const [whole, decimal] = x.toString().split('.');
                            return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (decimal ? `.${decimal}` : '').toString();
                        }
                        if(commaOnly) return toComma(num);
                        return (num > 999999999 ? toComma((num/1000000000).toFixed(1)) + ' B' :
	                        num > 999999 ? toComma((num/1000000).toFixed(1)) + ' M' :
		                        num > 999 ? toComma((num/1000).toFixed(1)) + ' K' : num)
                    },
	                formatTime(milliseconds){
	                    const formatTimeNumber = n => {
		                    if(!n) return '00';
		                    if(n.toString().length === 1) n = '0'+n;
		                    if(n.toString().length === 0) n = '00';
		                    return n;
                        };

	                    const seconds = Math.trunc(milliseconds) % 60;
		                const minutes = Math.trunc(milliseconds / 60) % 60;
                        return `${formatTimeNumber(minutes)}:${formatTimeNumber(seconds)}`;
                    },


	                ...mapActions([

	                ])
                }
            })

            this.setupVue(router);

            routerCallback(router, StoreService.get());
        });

        return router;
    }

    setupVuePlugins(){
        Vue.use(VueRouter);
        Vue.use(VTooltip, {
            defaultOffset:5
        });
        Vue.use(VueQrcodeReader);
    }

    registerComponents(components){
        components.map(component => {
            Vue.component(component.tag, component.vue);
        });
    }

    setupRouting(routes, middleware){
        const router = new VueRouter({routes});
        router.beforeEach((to, from, next) => {
	        StoreService.get().dispatch(UIActions.SET_SEARCH_TERMS, '');
            return middleware(to, next, StoreService.get())
        });
        return router;
    }

    setupVue(router){
        const app = new Vue({router, store:StoreService.get()});
        app.$mount('#scatter');

        // This removes the browser console's ability to
        // gain access to vuex store. ( for instance `scatter.__vue__.$store.state` )
	    if(document.getElementById('scatter')) {
		    document.getElementById('scatter').removeAttribute('id')
	    }
    }

}