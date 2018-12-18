import Account from '../models/Account'
import PluginRepository from '../plugins/PluginRepository'
import * as Actions from '../store/constants'
import {store} from '../store/store'
import {BlockchainsArray} from '../models/Blockchains'
import Process from "../models/Process";
import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";

let checkedOrphanedAccounts = false;

export default class AccountService {

    static async addAccount(account){
        const scatter = store.state.scatter.clone();
        scatter.keychain.addAccount(account);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async removeAccounts(accounts){
        const scatter = store.state.scatter.clone();
	    accounts.map(account => scatter.keychain.removeAccount(account));
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async importAllAccounts(keypair, isNewKeypair = false, blockchains = null, networks = null, addOnly = false){
        return new Promise(async resolve => {
            if(Process.isProcessRunning(keypair.unique())) return resolve(false);
	        const process = Process.importAccounts(keypair.unique());
            let scatter = store.state.scatter.clone();
            let accounts = [];

            if(!networks) networks = scatter.settings.networks;
            if(!blockchains) blockchains = keypair.blockchains;
            const progressPerBlockchain = 90 / blockchains.length;

            await Promise.all(blockchains.map(async blockchain => {
                const plugin = PluginRepository.plugin(blockchain);
                const filteredNetworks = networks.filter(x => x.blockchain === blockchain);
                if(isNewKeypair && plugin.accountsAreImported()) return true;
                return AccountService.accountsFrom(plugin, filteredNetworks, accounts, keypair, process, progressPerBlockchain);
            }));

            const uniques = accounts.map(x => x.unique());
            const accountsToRemove = scatter.keychain.accounts.filter(x => x.keypairUnique === keypair.unique() && !uniques.includes(x.unique()) && blockchains.includes(x.blockchain));


            // This method takes a while, re-cloning to make sure we're
            // always up to date before committing the data to storage.
	        scatter = store.state.scatter.clone();
            if(!addOnly) accountsToRemove.map(account => scatter.keychain.removeAccount(account));
            accounts.map(account => scatter.keychain.addAccount(account));

            await store.dispatch(Actions.SET_SCATTER, scatter);
	        process.updateProgress(100);
            resolve(true);
        })
    }

    static async importAllAccountsForNetwork(network){
        return new Promise(async resolve => {
            let scatter = store.state.scatter.clone();
            const blockchain = network.blockchain;
            const keypairs = scatter.keychain.keypairs.filter(x => x.blockchains.includes(blockchain));
            let accounts = [];

            const plugin = PluginRepository.plugin(network.blockchain);

            await Promise.all(keypairs.map(async keypair => {
                return AccountService.accountsFrom(plugin, [network], accounts, keypair);
            }));

	        // This method takes a while, re-cloning to make sure we're
	        // always up to date before committing the data to storage.
	        scatter = store.state.scatter.clone();
            accounts.map(account => scatter.keychain.addAccount(account));
            await store.dispatch(Actions.SET_SCATTER, scatter);
            resolve(true);
        })
    }

	/***
     * Gets accounts from networks
	 * @param plugin - Blockchain plugin
	 * @param networks - Networks to fetch from
	 * @param accounts - (OUT) accounts array to append to
	 * @param keypair - Associated keypair
	 * @param process - Optional process
	 * @param progressModifier
	 * @returns {Promise<*>}
	 */
    static async accountsFrom(plugin, networks, accounts, keypair, process = null, progressModifier = 0){
        return new Promise(async resolve => {
            if(plugin.accountsAreImported()){
                (await Promise.all(networks.map(async network => {
                    return await plugin.getImportableAccounts(keypair, network, process, progressModifier);
                }))).reduce((acc, arr) => {
                    arr.map(account => {
                        accounts.push(account)
                    });
                    return acc;
                }, []);
                resolve(true);
            } else {
                networks.map(network => {
	                if(process) process.setSubTitle(localizedState(LANG_KEYS.PROCESSES.ImportingAccountsFromNetwork, [1,network.name]));
                    const key = keypair.publicKeys.find(x => x.blockchain === network.blockchain);
                    if(key){
                        accounts.push(Account.fromJson({
                            keypairUnique:keypair.unique(),
                            networkUnique:network.unique(),
                            publicKey:key.key
                        }));
                    }
	                if(process) process.setSubTitle(null);
                });
	            if(process) process.updateProgress(progressModifier);
                resolve(true);
            }
        })
    }

    static async incrementAccountLogins(accounts){
        const ids = accounts.map(x => x.unique());
        const scatter = store.state.scatter.clone();
        scatter.keychain.accounts.filter(x => ids.includes(x.unique())).map(x => x.logins++);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async fixOrphanedAccounts(){
        if(checkedOrphanedAccounts) return true;
	    checkedOrphanedAccounts = true;

        const scatter = store.state.scatter.clone();
        const keypairs = scatter.keychain.keypairs.map(x => x.unique());
        const orphaned = scatter.keychain.accounts.filter(x => !keypairs.includes(x.keypairUnique));
        if(!orphaned.length) return true;

	    orphaned.map(x => scatter.keychain.removeAccount(x));
	    return store.dispatch(Actions.SET_SCATTER, scatter);
    }
}