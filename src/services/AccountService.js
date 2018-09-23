import Account from '../models/Account'
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants'
import {store} from '../store/store'
import {BlockchainsArray} from '../models/Blockchains'

export default class AccountService {

    static accountsAreImported(keypair){
        return PluginRepository.plugin(keypair.blockchain).accountsAreImported();
    }

    static async getImportableAccounts(keypair, network, blockchain){
        return await PluginRepository.plugin(blockchain).getImportableAccounts(keypair, network);
    }

    static async addAccountFromKeypair(keypair, network){
        const account = Account.fromJson({
            keypairUnique:keypair.unique(),
            networkUnique:network.unique(),
            publicKey:keypair.publicKeys.find(x => x.blockchain === network.blockchain)
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

    static importAllAccounts(keypair){
        return new Promise(async resolve => {
            const scatter = store.state.scatter.clone();
            let accounts = [];

            await Promise.all(BlockchainsArray.map(async ({value}) => {
                const plugin = PluginRepository.plugin(value);
                const networks = scatter.settings.networks.filter(x => x.blockchain === value);

                if(plugin.accountsAreImported()){
                    (await Promise.all(networks.map(async network => {
                        const availableAccounts = await plugin.getImportableAccounts(keypair, network);
                        return await plugin.getImportableAccounts(keypair, network);
                    }))).reduce((acc, arr) => {
                        arr.map(account => {
                            accounts.push(account)
                        });
                        return acc;
                    }, []);
                } else {
                    networks.map(network => {
                        accounts.push(Account.fromJson({
                            keypairUnique:keypair.unique(),
                            networkUnique:network.unique(),
                            publicKey:keypair.publicKeys.find(x => x.blockchain === value).key
                        }));
                    });
                }
            }));

            accounts.map(account => {
                console.log('account', account);
                scatter.keychain.addAccount(account)
            });
            await store.dispatch(Actions.SET_SCATTER, scatter);
            resolve(true);
        })
    }
}