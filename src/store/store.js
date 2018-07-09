import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import Scatter from '../models/Scatter';

Vue.use(Vuex);

const state = {
    seed:'',
    mnemonic:'',

    scatter:null,

    popups:[],
};

const getters = {
    // App State
    unlocked:state =>       state.scatter !== null && typeof state.scatter !== 'string' && state.scatter instanceof Scatter && !state.scatter.isEncrypted(),

    // Keychain centric
    identities:state =>     state.scatter.keychain.identities || [],
    keypairs:state =>       state.scatter.keychain.keypairs || [],
    accounts:state =>       state.scatter.keychain.accounts || [],
    permissions:state =>    state.scatter.keychain.permissions || [],
    linkedApps:state =>     state.scatter.keychain.linkedApps || [],

    // Settings
    networks:state =>       state.scatter.settings.networks || [],
    language:state =>       state.scatter.settings.language || [],
    autoBackup:state =>     state.scatter.settings.autoBackup || null,
    backupLocation:state => state.scatter.settings.backupLocation || null,

    // Popups
    nextPopIn:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN)[0] || null,
    snackbars:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.SNACKBAR) || [],
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})