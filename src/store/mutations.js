import * as Mutations from '@walletpack/core/store/constants'
import Vue from 'vue';
import * as UIActions from "./ui_actions";

export const mutations = {
    // [Mutations.SET_MNEMONIC]:(state, mnemonic) => state.mnemonic = mnemonic,
    [Mutations.SET_SCATTER]:(state, scatter) => state.scatter = scatter,
    [UIActions.PUSH_POPUP]:(state, popup) => state.popups.push(popup),
    [UIActions.RELEASE_POPUP]:(state, popup) => state.popups = state.popups.filter(p => p.id !== popup.id),
	[UIActions.SET_HARDWARE]:(state, hardware) => Vue.set(state.hardware, hardware.name, hardware.transport),
	[UIActions.REMOVE_HARDWARE]:(state, key) => Vue.delete(state.hardware, key),
};