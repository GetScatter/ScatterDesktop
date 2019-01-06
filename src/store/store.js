import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import PluginRepository from '../plugins/PluginRepository'
import Locale from "../models/Locale";
import PriceService from "../services/PriceService";
import BalanceService from "../services/BalanceService";

Vue.use(Vuex);

const state = {
    dappLogos:{},
    dappData:{},
    workingScreen:null,
    processes:[],
    resources:{},
    hideBackButton:false,

    searchTerms:'',
    mnemonic:'',

    scatter:null,

    popups:[],

    hardware:{},

    balances:{},
    prices:{},

	newKey:false,

	history:[],
	language:{},
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
    language:state =>       Locale.fromJson(state.language.json),
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
    	return BalanceService.totalBalances(false);
    },

    fullTotalBalances:(state, getters) => {
	    return BalanceService.totalBalances(true);
    },
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})
