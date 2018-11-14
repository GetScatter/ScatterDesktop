import * as Mutations from './constants'

export const mutations = {
    [Mutations.HIDE_BACK_BTN]:(state, x) => state.hideBackButton = x,
    [Mutations.SET_WORKING_SCREEN]:(state, x) => state.workingScreen = x,
    [Mutations.SET_SEARCH_TERMS]:(state, terms) => state.searchTerms = terms,
    [Mutations.SET_SEED]:(state, seed) => state.seed = seed,
    [Mutations.SET_MNEMONIC]:(state, mnemonic) => state.mnemonic = mnemonic,
    [Mutations.SET_SCATTER]:(state, scatter) => state.scatter = scatter,
    [Mutations.PUSH_POPUP]:(state, popup) => state.popups.push(popup),
    [Mutations.RELEASE_POPUP]:(state, popup) => state.popups = state.popups.filter(p => p.id !== popup.id),
    [Mutations.SET_HARDWARE]:(state, hardware) => state.hardware = hardware,
    [Mutations.SET_TOKENS]:(state, tokens) => state.tokens = tokens,
    [Mutations.SET_BALANCES]:(state, balances) => state.balances = balances,
    [Mutations.SET_PRICES]:(state, prices) => state.prices = prices,
    [Mutations.SET_DAPP_LOGO]:(state, {origin, logo}) => state.dappLogos[origin] = logo,
    [Mutations.SET_DAPP_DATA]:(state, data) => state.dappData = data,
	[Mutations.RELEASE_PROCESS]:(state, p) => state.processes = state.processes.filter(x => x.id !== p.id),

	[Mutations.SET_PROCESS]:(state, p) => {
        const process = state.processes.find(x => x.id === p.id);
        if(!process) return state.processes.push(p);
        else process.progress = p.progress;
	},
	[Mutations.SET_RESOURCES]:(state, x) => state.resources = x,
	[Mutations.ADD_RESOURCES]:(state, x) => {
        state.resources = state.resources.filter(y => y.acc !== x.acc);
		state.resources.push(x);
	},
};