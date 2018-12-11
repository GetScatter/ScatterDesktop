import {store} from '../store/store';
import * as Actions from '../store/constants';

import AccountService from './AccountService';
import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup'
import BalanceService from "./BalanceService";
import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";


export default class NetworkService {

    static async addNetwork(network){
        // Can't modify existing networks.
        const scatter = store.state.scatter.clone();
        const networks = scatter.settings.networks;
        if(networks.find(x => x.id === network.id)) return;

        const {NETWORK} = LANG_KEYS.SNACKBARS;
        
        if(!network.name.length) return PopupService.push(Popup.snackbar(localizedState(NETWORK.MissingName), "attention-circled"));
        if(!network.host.length) return PopupService.push(Popup.snackbar(localizedState(NETWORK.MissingHost), "attention-circled"));
        if(!network.port) return PopupService.push(Popup.snackbar(localizedState(NETWORK.MissingPort), "attention-circled"));
        if(!network.chainId) return PopupService.push(Popup.snackbar(localizedState(NETWORK.MissingChain), "attention-circled"));

        network.setPort();

        if(networks.find(x => x.blockchain === network.blockchain && x.chainId === network.chainId))
            return PopupService.push(Popup.snackbar(localizedState(NETWORK.ChainExists), "attention-circled"));

        if(networks.find(x => x.name.toLowerCase() === network.name.toLowerCase()))
	        return PopupService.push(Popup.snackbar(localizedState(NETWORK.NameExists), "attention-circled"));

        scatter.settings.updateOrPushNetwork(network);
        await store.dispatch(Actions.SET_SCATTER, scatter);
        await AccountService.importAllAccountsForNetwork(network);
        BalanceService.loadAllBalances(true);
        PopupService.push(Popup.snackbar(localizedState(NETWORK.Saved), "check"));
        return true;
    }

    static async removeNetwork(network){
        return new Promise(resolve => {
            PopupService.push(Popup.prompt("Deleting Network", "This will delete this network, as well as all associated accounts and their permissions.", async accepted => {
	            if(accepted) {
		            const scatter = store.state.scatter.clone();

		            // Removing accounts and permissions for this network
		            const accounts = scatter.keychain.accounts.filter(x => x.networkUnique === network.unique());
		            accounts.map(account => scatter.keychain.removeAccount(account));
		            scatter.settings.removeNetwork(network);
		            store.dispatch(Actions.SET_SCATTER, scatter);
		            PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.NETWORK.Deleted), "check"));
		            BalanceService.removeStaleBalances();
		            resolve(true);
	            } else resolve(false);
            }))
        })
    }

    static async updateNetwork(network){
	    const scatter = store.state.scatter.clone();
	    scatter.settings.updateOrPushNetwork(network);
	    await store.dispatch(Actions.SET_SCATTER, scatter);
		PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.NETWORK.Saved), "check"));
    }

}