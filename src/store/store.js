import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import Scatter from '../models/Scatter';
import PluginRepository from '../plugins/PluginRepository'

import * as HARDWARE_STATES from '../models/hardware/constants';

Vue.use(Vuex);

const state = {
    searchTerms:'',

    seed:'',
    mnemonic:'',

    scatter:null,

    popups:[],

    hardware:null,
};

const getters = {
    // App State
    unlocked:state =>       state.scatter !== null && typeof state.scatter !== 'string' && state.scatter instanceof Scatter && !state.scatter.isEncrypted(),

    // Keychain centric
    identities:state =>     state.scatter.keychain.identities || [],
    keypairs:state =>       state.scatter.keychain.keypairs || [],
    accounts:state =>       state.scatter.keychain.accounts || [],
    permissions:state =>    state.scatter.keychain.permissions || [],
    apps:state =>           state.scatter.keychain.apps || [],
    linkedApps:state =>     state.scatter.keychain.linkedApps || [],

    // Settings
    networks:state =>       state.scatter.settings.networks || [],
    language:state =>       state.scatter.settings.language || [],
    autoBackup:state =>     state.scatter.settings.autoBackup || null,
    backupLocation:state => state.scatter.settings.backupLocation || null,
    explorers:state =>      state.scatter.settings.explorers || PluginRepository.defaultExplorers(),

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