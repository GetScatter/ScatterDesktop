import Account from '../models/Account'
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants'
import {store} from '../store/store'

export default class AccountService {

    static accountsAreImported(keypair){
        return PluginRepository.plugin(keypair.blockchain).accountsAreImported();
    }

    static async getImportableAccounts(keypair, network){
        if(PluginRepository.plugin(keypair.blockchain).accountsAreImported())
            return await PluginRepository.plugin(keypair.blockchain).getImportableAccounts(keypair, network);
    }

    static async addAccountFromKeypair(keypair, network){
        const account = Account.fromJson({
            keypairUnique:keypair.unique(),
            networkUnique:network.unique(),
            publicKey:keypair.publicKey
        });
        const scatter = store.state.scatter.clone();
        scatter.keychain.addAccount(account);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async addAccount(account){
        const scatter = store.state.scatter.clone();
        scatter.keychain.addAccount(account);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async removeAccount(account){
        const scatter = store.state.scatter.clone();
        scatter.keychain.removeAccount(account);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }
}