import Account from '../models/Account'
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants'

export default class AccountService {

    static accountsAreImported(keypair){
        return PluginRepository.plugin(keypair.blockchain).accountsAreImported();
    }

    static async getImportableAccounts(keypair, network){
        if(PluginRepository.plugin(keypair.blockchain).accountsAreImported())
            return await PluginRepository.plugin(keypair.blockchain).getImportableAccounts(keypair, network);
    }

    static async addAccountFromKeypair(keypair, network, context){
        const account = Account.fromJson({
            keypairUnique:keypair.unique(),
            networkUnique:network.unique(),
            publicKey:keypair.publicKey
        });
        const scatter = context.scatter.clone();
        scatter.keychain.addAccount(account);
        return context[Actions.SET_SCATTER](scatter);
    }

    static async addAccount(account, context){
        const scatter = context.scatter.clone();
        scatter.keychain.addAccount(account);
        return context[Actions.SET_SCATTER](scatter);
    }

    static async removeAccount(account, context){
        const scatter = context.scatter.clone();
        scatter.keychain.removeAccount(account);
        return context[Actions.SET_SCATTER](scatter);
    }
}