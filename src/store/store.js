import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import PluginRepository from '@walletpack/core/plugins/PluginRepository'
import Locale from "@walletpack/core/models/Locale";
import BalanceService from "@walletpack/core/services/blockchain/BalanceService";

Vue.use(Vuex);

export const state = {
    workingScreen:null,
    scatter:null,
    popups:[],
    hardware:{},
};

export const getters = {
    // App State
    unlocked:state =>       state.scatter !== null
                                && typeof state.scatter !== 'string'
                                && typeof state.scatter.keychain !== 'string',

    // Popups
    popIns:state =>         state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN) || [],
    nextPopIn:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN)[0] || null,
    snackbars:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.SNACKBAR) || [],

};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})
