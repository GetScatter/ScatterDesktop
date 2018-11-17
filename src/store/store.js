import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

import {PopupDisplayTypes} from '../models/popups/Popup'
import PluginRepository from '../plugins/PluginRepository'

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

    hardware:null,

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
	networkTokens:state =>  state.scatter.settings.networks.map(x => x.systemToken()),
	blacklistTokens:state =>  state.scatter.settings.blacklistTokens,
	tokens:state =>         state.scatter.settings.tokens,

    // Popups
    popIns:state =>         state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN) || [],
    nextPopIn:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN)[0] || null,
    snackbars:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.SNACKBAR) || [],

    showNotifications:state => state.scatter.settings.showNotifications,


    totalTokenBalance:state => {
        let total = 0;
        Object.keys(state.balances).map(acc => {
            state.balances[acc].map(t => {
                total += parseFloat(t.balance);
            })
        });
        return total;
    },

    allBalances(){
        const totals = {};
        Object.keys(state.balances).map(acc => {
            state.balances[acc].map(t => {
                totals[t.symbol] = (totals[t.symbol] || 0) + parseFloat(t.balance)
            })
        });
        return totals;
    },

    totalBalance:state =>   {
        const displayToken = state.scatter.settings.displayToken;
        const symbol = displayToken ? displayToken.symbol : 'USD';

        const totals = {};
        let total = 0;

        if(!displayToken){
            Object.keys(state.balances).map(acc => {
                state.balances[acc].map(t => {
                    const defaultToken = PluginRepository.plugin(t.blockchain).defaultToken();
                    if(defaultToken.symbol !== t.symbol) return;
                    totals[t.symbol] = (totals[t.symbol] || 0) + parseFloat(t.balance)
                })
            });

            Object.keys(totals).map(key => {
                if(state.prices.hasOwnProperty(key)){
                    total += state.prices[key].price * totals[key];
                }
            });
        }

        else {
            Object.keys(state.balances).map(acc => {
                state.balances[acc].filter(t => t.symbol === displayToken.symbol).map(t => {
                    total += parseFloat(t.balance)
                })
            });
        }

        return [parseFloat(total).toFixed(2).toString(), symbol];
    }
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})
