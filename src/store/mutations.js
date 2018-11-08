import * as Mutations from './constants'

export const mutations = {
    [Mutations.SET_SPLASH]:(state, x) => state.splash = x,
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
};