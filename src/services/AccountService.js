import Account from '../models/Account'
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants'
import {store} from '../store/store'
import {BlockchainsArray} from '../models/Blockchains'
import Process from "../models/Process";

export default class AccountService {

    static accountsAreImported(keypair){
        return PluginRepository.plugin(keypair.blockchain).accountsAreImported();
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

    static async removeAccounts(accounts){
        const scatter = store.state.scatter.clone();
	    accounts.map(account => scatter.keychain.removeAccount(account));
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static importAllAccounts(keypair){
        return new Promise(async resolve => {
            if(Process.isProcessRunning(keypair.unique())) return resolve(false);
	        const process = Process.importAccounts(keypair.unique());
            let scatter = store.state.scatter.clone();
            let accounts = [];

            const blockchains = keypair.blockchains;
            const progressPerBlockchain = 90 / blockchains.length;

            await Promise.all(blockchains.map(async blockchain => {
                const plugin = PluginRepository.plugin(blockchain);
                const networks = scatter.settings.networks.filter(x => x.blockchain === blockchain);
                return AccountService.accountsFrom(plugin, networks, accounts, keypair, process, progressPerBlockchain);
            }));

            const uniques = accounts.map(x => x.unique());
            const accountsToRemove = scatter.keychain.accounts.filter(x => x.keypairUnique === keypair.unique() && !uniques.includes(x.unique()));


            // This method takes a while, re-cloning to make sure we're
            // always up to date before committing the data to storage.
	        scatter = store.state.scatter.clone();
	        
            accountsToRemove.map(account => scatter.keychain.removeAccount(account));
            accounts.map(account => scatter.keychain.addAccount(account));

            await store.dispatch(Actions.SET_SCATTER, scatter);
	        process.updateProgress(100);
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

    static async accountsFrom(plugin, networks, accounts, keypair, process = null, progressPerBlockchain = 0){
        return new Promise(async resolve => {
            if(plugin.accountsAreImported()){
                (await Promise.all(networks.map(async network => {
                    return await plugin.getImportableAccounts(keypair, network, process, progressPerBlockchain);
                }))).reduce((acc, arr) => {
                    arr.map(account => {
                        accounts.push(account)
                    });
                    return acc;
                }, []);
                resolve(true);
            } else {
                networks.map(network => {
	                if(process) process.subTitle = `Importing accounts for ${network.name}`;
                    const key = keypair.publicKeys.find(x => x.blockchain === network.blockchain);
                    if(key){
                        accounts.push(Account.fromJson({
                            keypairUnique:keypair.unique(),
                            networkUnique:network.unique(),
                            publicKey:key.key
                        }));
                    }
	                if(process) process.subTitle = null;
                });
	            if(process) process.updateProgress(progressPerBlockchain);
                resolve(true);
            }
        })
    }
}