import * as Actions from '@walletpack/core/store/constants'
import StorageService from '../services/electron/StorageService';
import BackupService from '../services/utility/BackupService';
import Hasher from '@walletpack/core/util/Hasher'
import IdGenerator from '@walletpack/core/util/IdGenerator'
import Scatter from '@walletpack/core/models/Scatter';
import AES from 'aes-oop';
import {RUNNING_TESTS} from "@walletpack/core/util/TestingHelper";
import Seeder from "@walletpack/core/services/secure/Seeder";
import * as UIActions from "./ui_actions";
import PasswordHelpers from "../services/utility/PasswordHelpers";

export const actions = {
    [UIActions.SET_PORTS]:({commit}, x) => commit(UIActions.SET_PORTS, x),
    [UIActions.SET_SIDEBAR]:({commit}, x) => commit(UIActions.SET_SIDEBAR, x),
    [UIActions.SET_APP_REP]:({commit}, x) => commit(UIActions.SET_APP_REP, x),
    [UIActions.SET_ACTION_REP]:({commit}, x) => commit(UIActions.SET_ACTION_REP, x),
    [Actions.SET_PRICE_DATA]:({commit}, x) => commit(Actions.SET_PRICE_DATA, x),
    [UIActions.HIDE_BACK_BTN]:({commit}, x) => commit(UIActions.HIDE_BACK_BTN, x),
    [Actions.ADD_RESOURCES]:({commit}, x) => commit(Actions.ADD_RESOURCES, x),
    [Actions.SET_RESOURCES]:({commit}, x) => commit(Actions.SET_RESOURCES, x),
    [UIActions.SET_PROCESS]:({commit}, x) => commit(UIActions.SET_PROCESS, x),
    [UIActions.RELEASE_PROCESS]:({commit}, x) => commit(UIActions.RELEASE_PROCESS, x),
    [UIActions.SET_WORKING_SCREEN]:({commit}, x) => commit(UIActions.SET_WORKING_SCREEN, x),
    [Actions.SET_DAPP_DATA]:({commit}, x) => commit(Actions.SET_DAPP_DATA, x),
    [Actions.SET_DAPP_LOGO]:({commit}, x) => commit(Actions.SET_DAPP_LOGO, x),
    [UIActions.SET_SEARCH_TERMS]:({commit}, terms) => commit(UIActions.SET_SEARCH_TERMS, terms),
    [Actions.HOLD_SCATTER]:({commit}, scatter) => commit(Actions.SET_SCATTER, scatter),


	[UIActions.SET_SEED]:({commit}, password) => {
		return new Promise(async (resolve, reject) => {
		    console.log('seeting')
			const [mnemonic, seed] = await PasswordHelpers.seedPassword(password, true);
		    console.log('mne', mnemonic, seed);
			resolve(mnemonic);
		})
	},

    [Actions.LOAD_SCATTER]:async ({commit, state, dispatch}, forceLocal = false) => {

        if(!state.scatter) {
            let scatter = StorageService.getScatter();
            if (!scatter) return null;
            return commit(Actions.SET_SCATTER, scatter);
        }

        console.log(await PasswordHelpers.verifyPassword(null, forceLocal));
        if(await PasswordHelpers.verifyPassword(null, forceLocal)){
            const scatter = state.scatter.clone();

            if(!RUNNING_TESTS){
	            await require('@walletpack/core/migrations/migrator').default(scatter, require('../migrations/version'));
            }

            scatter.meta.regenerateVersion();
            await dispatch(Actions.SET_SCATTER, scatter);
        }

        return true;
    },

    [UIActions.CREATE_SCATTER]:({state, commit, dispatch}, password) => {
        return new Promise(async (resolve, reject) => {
            const scatter = await Scatter.create();
            scatter.meta.acceptedTerms = true;

            await StorageService.setSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));

            dispatch(UIActions.SET_SEED, password).then(mnemonic => {
                dispatch(Actions.SET_SCATTER, scatter).then(async _scatter => {
	                await BackupService.setDefaultBackupLocation();
                    resolve();
                })
            })
        })
    },

    [Actions.SET_SCATTER]:async ({commit, state}, scatter) => {
        return new Promise(async resolve => {
            const seed = await Seeder.getSeed();
            const savable = AES.encrypt(scatter.savable(seed), seed);
            StorageService.setLocalScatter(savable);
            StorageService.setScatter(savable).then(() => BackupService.createAutoBackup());
            commit(Actions.SET_SCATTER, scatter);
            resolve(scatter);
        })
    },

    [UIActions.PUSH_POPUP]:({commit}, popup) => commit(UIActions.PUSH_POPUP, popup),
    [UIActions.RELEASE_POPUP]:({commit}, popup) => commit(UIActions.RELEASE_POPUP, popup),
    [UIActions.SET_HARDWARE]:({commit}, hardware) => commit(UIActions.SET_HARDWARE, hardware),
    [UIActions.REMOVE_HARDWARE]:({commit}, key) => commit(UIActions.REMOVE_HARDWARE, key),
    [UIActions.SET_TOKENS]:({commit}, tokens) => commit(UIActions.SET_TOKENS, tokens),
    [Actions.SET_BALANCES]:({commit}, x) => commit(Actions.SET_BALANCES, x),
    [UIActions.SET_FULL_BALANCES]:({commit}, x) => commit(UIActions.SET_FULL_BALANCES, x),
    [Actions.REMOVE_BALANCES]:({commit}, x) => commit(Actions.REMOVE_BALANCES, x),
    [Actions.SET_PRICES]:({commit}, prices) => commit(Actions.SET_PRICES, prices),
    [UIActions.NEW_KEY]:({commit}, x) => commit(UIActions.NEW_KEY, x),
    [UIActions.SET_LANGUAGE]:({commit}, x) => {
	    commit(UIActions.SET_LANGUAGE, x);
	    return StorageService.setTranslation(x);
    },
    [UIActions.LOAD_LANGUAGE]:async ({commit}) => commit(UIActions.SET_LANGUAGE, await StorageService.getTranslation()),
    [Actions.LOAD_HISTORY]:async ({commit}) => commit(Actions.LOAD_HISTORY, await StorageService.getHistory()),
    [Actions.UPDATE_HISTORY]:async ({commit}, x) => {
        await StorageService.updateHistory(x);
	    commit(Actions.LOAD_HISTORY, await StorageService.getHistory())
    },
    [Actions.DELTA_HISTORY]:({commit}, x) => {
        commit(Actions.DELTA_HISTORY, x);
        return StorageService.deltaHistory(x);
    },

};
