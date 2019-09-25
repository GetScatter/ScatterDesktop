import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

Vue.use(Vuex);

export const state = {

};

export const getters = {


};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})
