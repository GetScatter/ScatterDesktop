import Vue from 'vue'
import {mapState, mapActions} from 'vuex';
import VTooltip from 'v-tooltip'
import VueQrcodeReader from 'vue-qrcode-reader'


import VueRouter from 'vue-router'
import {RouteNames, Routing} from './Routing';
import features from '../features';

import {store} from "../store/store";

Vue.config.productionTip = false

export let router;

/***
 * Sets up an instance of Vue.
 * This is shared between the popup.js and prompt.js scripts.
 */
export default class VueInitializer {

    constructor(routes,
                components,
                middleware = () => {}){

        this.setupVuePlugins();
        this.registerComponents(components);
        router = this.setupRouting(routes, middleware);

	    Vue.mixin({
		    data(){ return {
			    RouteNames,
		    }},
	    })

	    this.setupVue(router);
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
            return middleware(to, next)
        });
        return router;
    }

    setupVue(router){
        const app = new Vue({router, store});
        app.$mount('#scatter');

        // This removes the browser console's ability to
        // gain access to vuex store. ( for instance `scatter.__vue__.$store.state` )
	    if(document.getElementById('scatter')) {
		    document.getElementById('scatter').removeAttribute('id')
	    }
    }

}