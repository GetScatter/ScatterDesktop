import * as Actions from '@walletpack/core/store/constants'
import BackupService from '../services/utility/BackupService';
import Hasher from '@walletpack/core/util/Hasher'
import IdGenerator from '@walletpack/core/util/IdGenerator'
import Scatter from '@walletpack/core/models/Scatter';
import * as UIActions from "./ui_actions";
const {Wallet, Storage} = window.require('electron').remote.getGlobal('appShared');

export const actions = {
    [Actions.HOLD_SCATTER]:({commit}, scatter) => commit(Actions.SET_SCATTER, scatter),

    [UIActions.CREATE_SCATTER]:({state, commit, dispatch}, password) => {
        return new Promise(async (resolve, reject) => {
            const scatter = await Scatter.create();
            scatter.meta.acceptedTerms = true;

            await Storage.setSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));

            await Wallet.unlock(password, true);
	        dispatch(Actions.SET_SCATTER, scatter).then(async _scatter => {
		        await BackupService.setDefaultBackupLocation();
		        resolve();
	        })
        })
    },

    [Actions.SET_SCATTER]:async ({commit, state}, scatter) => {
        return new Promise(async resolve => {
	        await Wallet.updateScatter(scatter);
            commit(Actions.SET_SCATTER, scatter);
            resolve(scatter);
        })
    },

    [UIActions.PUSH_POPUP]:({commit}, popup) => commit(UIActions.PUSH_POPUP, popup),
    [UIActions.RELEASE_POPUP]:({commit}, popup) => commit(UIActions.RELEASE_POPUP, popup),
    [UIActions.SET_HARDWARE]:({commit}, hardware) => commit(UIActions.SET_HARDWARE, hardware),
    [UIActions.REMOVE_HARDWARE]:({commit}, key) => commit(UIActions.REMOVE_HARDWARE, key),
};
