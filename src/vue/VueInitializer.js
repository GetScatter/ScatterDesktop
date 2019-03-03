import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueQrcodeReader from 'vue-qrcode-reader'
import VueTour from 'vue-tour'


import VueRouter from 'vue-router'
import {RouteNames, Routing} from './Routing';
import {store} from '../store/store'
import * as Actions from '../store/constants'
import {blockchainName} from '../models/Blockchains'
import {SETTINGS_OPTIONS} from '../models/Settings'
import ElectronHelpers from '../util/ElectronHelpers'
import {localized} from '../localization/locales'
import LANG_KEYS from '../localization/keys'

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

        store.dispatch(Actions.LOAD_SCATTER).then(async () => {



            Vue.mixin({
                data(){ return {
	                RouteNames,
	                SETTINGS_OPTIONS,
                    langKeys:LANG_KEYS,
	                loadingReputation:false,
                    // now:0,
                }},
                mounted(){
                    // setInterval(() => {
                    //     this.now = +new Date();
                    // }, 1000);
                },
                methods: {
	                blockchainName,
	                locale:(key, args) => localized(key, args, store.getters.language),
	                newKeypair(){ this.$router.push({name:RouteNames.NEW_KEYPAIR}); },
	                goToApps(){ this.openInBrowser('https://get-scatter.com/Apps') },
	                openInBrowser(url){ ElectronHelpers.openLinkInBrowser(url); },
	                setWorkingScreen(bool){ store.dispatch(Actions.SET_WORKING_SCREEN, bool); },
	                copyText(text){ ElectronHelpers.copy(text) },



                    formatNumber(num, commaOnly = false){
	                	if(!num) return 0;
                        const toComma = x => {
                            const [whole, decimal] = x.toString().split('.');
                            return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (decimal ? `.${decimal}` : '').toString();
                        }
                        if(commaOnly) return toComma(num);
                        return num > 999999999 ? toComma((num/1000000000).toFixed(1)) + ' B' :
                            num > 999999 ? toComma((num/1000000).toFixed(1)) + ' M' :
                                num > 999 ? toComma((num/1000).toFixed(1)) + ' K' : num
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
                }
            })

            this.setupVue(router);

            routerCallback(router, store);
        });

        return router;
    }

    setupVuePlugins(){
        Vue.use(VueRouter);
        Vue.use(VTooltip, {
            defaultOffset:5
        });
        Vue.use(VueQrcodeReader);
        Vue.use(VueTour);
    }

    registerComponents(components){
        components.map(component => {
            Vue.component(component.tag, component.vue);
        });
    }

    setupRouting(routes, middleware){
        const router = new VueRouter({routes});
        router.beforeEach((to, from, next) => {
            store.dispatch(Actions.SET_SEARCH_TERMS, '');
            return middleware(to, next, store)
        });
        return router;
    }

    setupVue(router){
        const app = new Vue({router, store});
        app.$mount('#scatter');

        // This removes the browser console's ability to
        // gain access to vuex store. ( for instance `scatter.__vue__.$store.state` )
        document.getElementById('scatter').removeAttribute('id')
    }

}