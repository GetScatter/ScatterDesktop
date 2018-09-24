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
                return AccountService.accountsFrom(plugin, networks, accounts, keypair);
            }));

            const uniques = accounts.map(x => x.unique());
            const accountsToRemove = scatter.keychain.accounts.filter(x => x.keypairUnique === keypair.unique() && !uniques.includes(x.unique()));

            accountsToRemove.map(account => scatter.keychain.removeAccount(account));
            accounts.map(account => scatter.keychain.addAccount(account));

            await store.dispatch(Actions.SET_SCATTER, scatter);
            resolve(true);
        })
    }

    static async importAllAccountsForNetwork(network){
        return new Promise(async resolve => {
            const scatter = store.state.scatter.clone();
            const keypairs = scatter.keychain.keypairs;
            let accounts = [];

            const plugin = PluginRepository.plugin(network.blockchain);

            await Promise.all(keypairs.map(async keypair => {
                return AccountService.accountsFrom(plugin, [network], accounts, keypair);
            }));

            accounts.map(account => scatter.keychain.addAccount(account));
            await store.dispatch(Actions.SET_SCATTER, scatter);
            resolve(true);
        })
    }

    static async accountsFrom(plugin, networks, accounts, keypair){
        return new Promise(async resolve => {
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
                resolve(true);
            } else {
                networks.map(network => {
                    const key = keypair.publicKeys.find(x => x.blockchain === network.blockchain);
                    if(key){
                        accounts.push(Account.fromJson({
                            keypairUnique:keypair.unique(),
                            networkUnique:network.unique(),
                            publicKey:key.key
                        }));
                    }
                });
                resolve(true);
            }
        })
    }
}