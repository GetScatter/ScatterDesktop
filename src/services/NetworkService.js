import {store} from '../store/store';
import * as Actions from '../store/constants';

import AccountService from './AccountService';
import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup'

export default class NetworkService {

    static async addNetwork(network){
        // Can't modify existing networks.
        const scatter = store.state.scatter.clone();
        const networks = scatter.settings.networks;
        if(networks.find(x => x.id === network.id)) return;
        
        if(!network.name.length) return false;
        if(!network.host.length) return false;
        if(!network.port) return false;
        if(!network.chainId) return false;

        network.setPort();

        if(networks.find(x => x.blockchain === network.blockchain && x.chainId === network.chainId))
            return PopupService.push(Popup.snackbar("A network with this chain id already exists", "ban"));

        if(networks.find(x => x.name.toLowerCase() === network.name.toLowerCase()))
            return PopupService.push(Popup.textPrompt("Name Exists", 'Enter a different name for this network', 'exclamation-triangle', 'Okay', {placeholder:'Network Name'}, name => {
                if(!name) return false;
                network.name = name;
                return this.addNetwork(network);
            }));

        scatter.settings.updateOrPushNetwork(network);
        await store.dispatch(Actions.SET_SCATTER, scatter);
        await AccountService.importAllAccountsForNetwork(network);
        PopupService.push(Popup.snackbar("Network Saved!", "check"));
    }

    static async removeNetwork(network){
        return new Promise(resolve => {
            PopupService.promptGuard(Popup.prompt(
                "Deleting Network", "This will delete this network, as well as all associated accounts and their permissions.",
                "trash-o", "Delete Network"
            ), async accepted => {
                if(accepted) {
                    const scatter = store.state.scatter.clone();

                    // Removing accounts and permissions for this network
                    const accounts = scatter.keychain.accounts.filter(x => x.networkUnique === network.unique());
                    accounts.map(account => scatter.keychain.removeAccount(account));

                    scatter.settings.removeNetwork(network);
                    store.dispatch(Actions.SET_SCATTER, scatter);
                    PopupService.push(Popup.snackbar("Network Deleted!", "check"));
                    resolve(true);
                } else resolve(false);
            });
        })
    }

}