import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import PluginRepository from '../plugins/PluginRepository'
import Locale from "../models/Locale";

Vue.use(Vuex);

const state = {
    dappLogos:{},
    dappData:{},
    workingScreen:null,
    processes:[],
    resources:{},
    hideBackButton:false,

    searchTerms:'',

    seed:'',
    mnemonic:'',

    scatter:null,

    popups:[],

    hardware:{},

    balances:{},
    prices:{},

	newKey:false,

	backgroundColor:'rgb(255,255,255)',
	textColor:'rgb(188,188,188)'
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
    language:state =>       {
    	if(!state.scatter || !state.scatter.hasOwnProperty('settings')) return;
    	if(state.scatter.settings.languageJson) return Locale.fromJson(state.scatter.settings.languageJson);
    	return state.scatter.settings.language;
    },
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
	networkTokens:state =>  state.scatter.settings.networks.map(x => {
		const token = x.systemToken();
		token.chainId = x.chainId;
		return token;
	}).reduce((acc, token) => {
		const exists = acc.find(x => x.unique() === token.unique() && x.chainId === token.chainId);
		if(!exists) acc.push(token);
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
                if(!tokens[account.networkUnique].hasOwnProperty(token.uniqueWithChain())) {
	                tokens[account.networkUnique][token.uniqueWithChain()] = token.clone();
	                tokens['totals'][token.uniqueWithChain()] = token.clone();
                } else {
	                tokens[account.networkUnique][token.uniqueWithChain()].add(token.amount);
	                tokens['totals'][token.uniqueWithChain()].add(token.amount);
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
