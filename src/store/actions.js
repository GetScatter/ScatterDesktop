import * as Actions from './constants'
import StorageService from '../services/utility/StorageService';
import SocketService from '../services/utility/SocketService';
import PasswordService from '../services/secure/PasswordService';
import BackupService from '../services/utility/BackupService';
import PluginRepository from '../plugins/PluginRepository';
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'

import Scatter from '../models/Scatter';

import AES from 'aes-oop';
import PopupService from "../services/utility/PopupService";
import {Popup} from '../models/popups/Popup'
import {RUNNING_TESTS} from "../util/TestingHelper";
import {ipcAsync} from "../util/ElectronHelpers";
import Process from "../models/Process";

export const actions = {
    [Actions.SET_PORTS]:({commit}, x) => commit(Actions.SET_PORTS, x),
    [Actions.SET_SIDEBAR]:({commit}, x) => commit(Actions.SET_SIDEBAR, x),
    [Actions.SET_APP_REP]:({commit}, x) => commit(Actions.SET_APP_REP, x),
    [Actions.SET_ACTION_REP]:({commit}, x) => commit(Actions.SET_ACTION_REP, x),
    [Actions.SET_PRICE_DATA]:({commit}, x) => commit(Actions.SET_PRICE_DATA, x),
    [Actions.SET_QUICK_BACK]:({commit}, x) => commit(Actions.SET_QUICK_BACK, x),
    [Actions.HIDE_BACK_BTN]:({commit}, x) => commit(Actions.HIDE_BACK_BTN, x),
    [Actions.ADD_RESOURCES]:({commit}, x) => commit(Actions.ADD_RESOURCES, x),
    [Actions.SET_RESOURCES]:({commit}, x) => commit(Actions.SET_RESOURCES, x),
    [Actions.SET_PROCESS]:({commit}, x) => commit(Actions.SET_PROCESS, x),
    [Actions.RELEASE_PROCESS]:({commit}, x) => commit(Actions.RELEASE_PROCESS, x),
    [Actions.SET_WORKING_SCREEN]:({commit}, x) => commit(Actions.SET_WORKING_SCREEN, x),
    [Actions.SET_DAPP_DATA]:({commit}, x) => commit(Actions.SET_DAPP_DATA, x),
    [Actions.SET_DAPP_LOGO]:({commit}, x) => commit(Actions.SET_DAPP_LOGO, x),
    [Actions.SET_SEARCH_TERMS]:({commit}, terms) => commit(Actions.SET_SEARCH_TERMS, terms),
    [Actions.HOLD_SCATTER]:({commit}, scatter) => commit(Actions.SET_SCATTER, scatter),
    [Actions.SET_SEED]:({commit}, password) => {
        return new Promise(async (resolve, reject) => {
            const [mnemonic, seed] = await PasswordService.seedPassword(password, true);
            resolve(mnemonic);
        })
    },

    [Actions.LOAD_SCATTER]:async ({commit, state, dispatch}, forceLocal = false) => {

        if(!state.scatter) {
            let scatter = StorageService.getScatter();
            if (!scatter) return null;
            return commit(Actions.SET_SCATTER, scatter);
        }

        if(await PasswordService.verifyPassword(null, forceLocal)){
            const scatter = state.scatter.clone();

            if(!RUNNING_TESTS){
	            await require('../migrations/migrator').default(scatter);
            }

            scatter.meta.regenerateVersion();
            await dispatch(Actions.SET_SCATTER, scatter);
        }

        return true;
    },

    [Actions.CREATE_SCATTER]:({state, commit, dispatch}, password) => {
        return new Promise(async (resolve, reject) => {
            const scatter = await Scatter.create();
            scatter.meta.acceptedTerms = true;

            await StorageService.setSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));

            dispatch(Actions.SET_SEED, password).then(mnemonic => {
                dispatch(Actions.SET_SCATTER, scatter).then(async _scatter => {
	                await BackupService.setDefaultBackupLocation();
                    resolve();
                })
            })
        })
    },

    [Actions.SET_SCATTER]:async ({commit, state}, scatter) => {
        return new Promise(async resolve => {
	        // const process = Process.savingData();

            const seed = await ipcAsync('seed');
            const savable = AES.encrypt(scatter.savable(seed), seed);
            StorageService.setLocalScatter(savable);
	        // process.updateProgress(50);
            StorageService.setScatter(savable).then(() => {
	            BackupService.createAutoBackup()
            });

            commit(Actions.SET_SCATTER, scatter);
            resolve(scatter);
	        // process.updateProgress(100);
        })
    },

    [Actions.PUSH_POPUP]:({commit}, popup) => commit(Actions.PUSH_POPUP, popup),
    [Actions.RELEASE_POPUP]:({commit}, popup) => commit(Actions.RELEASE_POPUP, popup),
    [Actions.SET_HARDWARE]:({commit}, hardware) => commit(Actions.SET_HARDWARE, hardware),
    [Actions.REMOVE_HARDWARE]:({commit}, key) => commit(Actions.REMOVE_HARDWARE, key),
    [Actions.SET_TOKENS]:({commit}, tokens) => commit(Actions.SET_TOKENS, tokens),
    [Actions.SET_BALANCES]:({commit}, x) => commit(Actions.SET_BALANCES, x),
    [Actions.SET_FULL_BALANCES]:({commit}, x) => commit(Actions.SET_FULL_BALANCES, x),
    [Actions.REMOVE_BALANCES]:({commit}, x) => commit(Actions.REMOVE_BALANCES, x),
    [Actions.SET_PRICES]:({commit}, prices) => commit(Actions.SET_PRICES, prices),
    [Actions.NEW_KEY]:({commit}, x) => commit(Actions.NEW_KEY, x),
    [Actions.SET_LANGUAGE]:({commit}, x) => {
	    commit(Actions.SET_LANGUAGE, x);
	    return StorageService.setTranslation(x);
    },
    [Actions.LOAD_LANGUAGE]:async ({commit}) => commit(Actions.SET_LANGUAGE, await StorageService.getTranslation()),
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
