import * as Mutations from './constants'
import Vue from 'vue';

export const mutations = {
    [Mutations.SET_APP_REP]:(state, x) => state.appReputation = x,
    [Mutations.SET_ACTION_REP]:(state, {app, rep}) => Vue.set(state.actionReputations, app, rep),
    [Mutations.SET_PRICE_DATA]:(state, x) => state.priceData = x,
    [Mutations.HIDE_BACK_BTN]:(state, x) => state.hideBackButton = x,
    [Mutations.SET_WORKING_SCREEN]:(state, x) => state.workingScreen = x,
    [Mutations.SET_SEARCH_TERMS]:(state, terms) => state.searchTerms = terms,
    [Mutations.SET_MNEMONIC]:(state, mnemonic) => state.mnemonic = mnemonic,
    [Mutations.SET_SCATTER]:(state, scatter) => state.scatter = scatter,
    [Mutations.PUSH_POPUP]:(state, popup) => state.popups.push(popup),
    [Mutations.RELEASE_POPUP]:(state, popup) => state.popups = state.popups.filter(p => p.id !== popup.id),
    [Mutations.SET_TOKENS]:(state, tokens) => state.tokens = tokens,
    [Mutations.SET_PRICES]:(state, prices) => state.prices = prices,
    [Mutations.SET_DAPP_LOGO]:(state, {origin, logo}) => Vue.set(state.dappLogos, origin, logo),
    [Mutations.SET_DAPP_DATA]:(state, data) => state.dappData = data,
	[Mutations.RELEASE_PROCESS]:(state, p) => state.processes = state.processes.filter(x => x.id !== p.id),

	[Mutations.SET_PROCESS]:(state, p) => {
        const process = state.processes.find(x => x.id === p.id);
        if(!process) return state.processes.push(p);
        else process.progress = p.progress;
	},
	[Mutations.SET_RESOURCES]:(state, x) => state.resources = x,
	[Mutations.ADD_RESOURCES]:(state, x) => {
    	Vue.set(state.resources, x.acc, x.res);
	},
	[Mutations.SET_BALANCES]:(state, x) => {
		Vue.set(state.balances, x.account, x.balances)
	},
	[Mutations.SET_FULL_BALANCES]:(state, x) => state.balances = x,
	[Mutations.REMOVE_BALANCES]:(state, accountKeys) => {
		accountKeys.map(key => {
			Vue.delete(state.balances, key);
		})
	},
	[Mutations.SET_HARDWARE]:(state, hardware) => Vue.set(state.hardware, hardware.name, hardware.transport),
	[Mutations.REMOVE_HARDWARE]:(state, key) => Vue.delete(state.hardware, key),
	[Mutations.NEW_KEY]:(state, x) => state.newKey = x,
	[Mutations.SET_LANGUAGE]:(state, x) => Vue.set(state.language, 'json', x),
	[Mutations.LOAD_HISTORY]:(state, x) => state.history = x,
	[Mutations.DELTA_HISTORY]:(state, x) => {
    	if(x === null) state.history = [];
    	else {
    		if(state.history.find(h => h.id === x.id)) state.history = state.history.filter(h => h.id !== x.id);
    		else state.history.unshift(x);
		}
	},
};