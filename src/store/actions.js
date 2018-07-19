import * as Actions from './constants'
import StorageService from '../services/StorageService';
import SocketService from '../services/SocketService';
import PasswordService from '../services/PasswordService';
import BackupService from '../services/BackupService';
import PluginRepository from '../plugins/PluginRepository';
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'
import Mnemonic from '../util/Mnemonic'

import Identity from '../models/Identity';
import Scatter from '../models/Scatter';
import AppLink from '../models/AppLink';

import AES from 'aes-oop';
import PopupService from "../services/PopupService";
import {Popup} from '../models/popups/Popup'

export const actions = {
    [Actions.HOLD_SCATTER]:({commit}, scatter) => commit(Actions.SET_SCATTER, scatter),
    [Actions.SET_SEED]:({commit}, password) => {
        return new Promise(async (resolve, reject) => {
            const [mnemonic, seed] = await PasswordService.seedPassword(password);
            resolve(mnemonic);
        })
    },

    [Actions.LOAD_SCATTER]:async ({commit, state}) => {

        if(!state.scatter) {
            let scatter = StorageService.getScatter();
            if (!scatter) return null;
            return commit(Actions.SET_SCATTER, scatter);
        }

        await PasswordService.verifyPassword();
    },

    [Actions.CREATE_SCATTER]:({state, commit, dispatch}, password) => {
        return new Promise(async (resolve, reject) => {
            const scatter = Scatter.placeholder();

            await Promise.all(PluginRepository.signatureProviders().map(async plugin => {
                const network = await plugin.getEndorsedNetwork();
                scatter.settings.networks.push(network);
            }));

            const firstIdentity = Identity.placeholder();
            await firstIdentity.initialize(scatter.hash);

            //TODO: Testing
            firstIdentity.name = 'MyFirstIdentity';
            scatter.keychain.updateOrPushIdentity(firstIdentity);

            const catchAllAppLink = AppLink.defaultAppLink();

            scatter.keychain.linkedApps.push(catchAllAppLink);
            SocketService.initialize();
            SocketService.open(catchAllAppLink);

            await StorageService.setSalt(Hasher.insecureHash(IdGenerator.text(32)));

            dispatch(Actions.SET_SEED, password).then(mnemonic => {
                dispatch(Actions.SET_SCATTER, scatter).then(_scatter => {

                    PopupService.push(Popup.mnemonic(mnemonic));
                    resolve();
                })
            })
        })
    },

    [Actions.SET_SCATTER]:({commit, state}, scatter) => {
        return new Promise(async resolve => {

            await StorageService.setScatter(
                AES.encrypt(
                    scatter.savable(state.seed), state.seed
                )
            );

            await BackupService.createAutoBackup();

            commit(Actions.SET_SCATTER, scatter);
            resolve(scatter);
        })
    },

    [Actions.PUSH_POPUP]:({commit}, popup) => commit(Actions.PUSH_POPUP, popup),
    [Actions.RELEASE_POPUP]:({commit}, popup) => commit(Actions.RELEASE_POPUP, popup),

};
