import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import PluginRepository from '../plugins/PluginRepository'
import Token from "../models/Token";

Vue.use(Vuex);

const state = {
    dappLogos:{},
    dappData:{},
    workingScreen:null,
    processes:[],
    resources:[],
    hideBackButton:false,

    searchTerms:'',

    seed:'',
    mnemonic:'',

    scatter:null,

    popups:[],

    hardware:{},

    balances:{},
    prices:{},
};

const getters = {
    // App State
    unlocked:state =>       state.scatter !== null
                                && typeof state.scatter !== 'string'
                                && typeof state.scatter.isEncrypted === 'function'
                                && !state.scatter.isEncrypted(),


    contacts:state =>       state.scatter.contacts || [],

    // Keychain centric
    identity:state =>       state.scatter.keychain.identities[0],
    identities:state =>     state.scatter.keychain.identities || [],
    keypairs:state =>       state.scatter.keychain.keypairs || [],
    accounts:state =>       state.scatter.keychain.accounts || [],
    permissions:state =>    state.scatter.keychain.permissions || [],
    apps:state =>           state.scatter.keychain.apps || [],

    // Settings
    version:state =>        state.scatter.meta.version,
    networks:state =>       state.scatter.settings.networks || [],
    language:state =>       state.scatter && state.scatter.hasOwnProperty('settings') ? state.scatter.settings.language : null,
    autoBackup:state =>     state.scatter.settings.autoBackup || null,
    backupLocation:state => state.scatter.settings.backupLocation || null,
    explorers:state =>      state.scatter.settings.explorers || PluginRepository.defaultExplorers(),
	blacklistTokens:state =>  state.scatter.settings.blacklistTokens,
	balanceFilters:state =>   state.scatter.settings.balanceFilters,
	displayCurrency:state =>   state.scatter.settings.displayCurrency,
	displayToken:state =>   state.scatter.settings.displayToken,
	tokens:state =>         state.scatter.settings.tokens,
    allTokens:(state, getters) =>      getters.networkTokens.concat(getters.tokens),
    mainnetTokensOnly:state =>      state.scatter.settings.showMainnetsOnly,
	networkTokens:state =>  state.scatter.settings.networks.map(x => x.systemToken()).reduce((acc, token) => {
		if(!acc.find(x => x.unique() === token.unique())) acc.push(token);
		return acc;
	}, []),

    // Popups
    popIns:state =>         state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN) || [],
    nextPopIn:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN)[0] || null,
    snackbars:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.SNACKBAR) || [],

    showNotifications:state => state.scatter.settings.showNotifications,

    totalBalances:(state, getters) => {
        const tokens = {};
	    tokens['totals'] = {};

        Object.keys(state.balances).map(async accountUnique => {
            const account = state.scatter.keychain.accounts.find(x => x.identifiable() === accountUnique);
            if(!account) return;


            if(getters.mainnetTokensOnly){
	            if(!PluginRepository.plugin(account.blockchain()).isEndorsedNetwork(account.network()))
	                return;
            }

            if(!tokens.hasOwnProperty(account.networkUnique)){
                tokens[account.networkUnique] = {};
            }

            if(!state.balances[accountUnique]) return;
            state.balances[accountUnique].map(token => {
                if(!tokens[account.networkUnique].hasOwnProperty(token.unique())) {
	                tokens[account.networkUnique][token.unique()] = token.clone();
	                tokens['totals'][token.unique()] = token.clone();
                } else {
	                tokens[account.networkUnique][token.unique()].add(token.amount);
	                tokens['totals'][token.unique()].add(token.amount);
                }
            });
        });

        return tokens;
    },
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})
