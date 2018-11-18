import {store} from '../store/store';
import * as Actions from '../store/constants';

import AccountService from './AccountService';
import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup'
import BalanceService from "./BalanceService";

export default class NetworkService {

    static async addNetwork(network){
        // Can't modify existing networks.
        const scatter = store.state.scatter.clone();
        const networks = scatter.settings.networks;
        if(networks.find(x => x.id === network.id)) return;
        
        if(!network.name.length) return PopupService.push(Popup.snackbar("Network must have a name", "attention-circled"));
        if(!network.host.length) return PopupService.push(Popup.snackbar("Network must have a host", "attention-circled"));
        if(!network.port) return PopupService.push(Popup.snackbar("Network must have a valid port", "attention-circled"));
        if(!network.chainId) return PopupService.push(Popup.snackbar("Network must have a chain id", "attention-circled"));

        network.setPort();

        if(networks.find(x => x.blockchain === network.blockchain && x.chainId === network.chainId))
            return PopupService.push(Popup.snackbar("A network with this chain id already exists", "attention-circled"));

        if(networks.find(x => x.name.toLowerCase() === network.name.toLowerCase()))
	        return PopupService.push(Popup.snackbar("A network with this name already exists", "attention-circled"));

        scatter.settings.updateOrPushNetwork(network);
        await store.dispatch(Actions.SET_SCATTER, scatter);
        await AccountService.importAllAccountsForNetwork(network);
        BalanceService.loadAllBalances();
        PopupService.push(Popup.snackbar("Network Saved!", "check"));
        return true;
    }

    static async removeNetwork(network){
        return new Promise(resolve => {
            PopupService.promptGuard(Popup.prompt(
                "Deleting Network", "This will delete this network, as well as all associated accounts and their permissions.",
                "trash", "Delete Network"
            ), async accepted => {
                if(accepted) {
                    const scatter = store.state.scatter.clone();

                    // Removing accounts and permissions for this network
                    const accounts = scatter.keychain.accounts.filter(x => x.networkUnique === network.unique());
                    accounts.map(account => scatter.keychain.removeAccount(account));
                    scatter.settings.removeNetwork(network);
                    store.dispatch(Actions.SET_SCATTER, scatter);
                    PopupService.push(Popup.snackbar("Network Deleted!", "check"));
                    BalanceService.removeStaleBalances();
                    resolve(true);
                } else resolve(false);
            });
        })
    }

    static async updateNetwork(network){
	    const scatter = store.state.scatter.clone();
	    scatter.settings.updateOrPushNetwork(network);
	    await store.dispatch(Actions.SET_SCATTER, scatter);
	    PopupService.push(Popup.snackbar("Network Saved!", "check"));
    }

}