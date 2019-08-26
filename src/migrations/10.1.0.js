import PluginRepository from '@walletpack/core/plugins/PluginRepository';
import Explorer from "@walletpack/core/models/Explorer";
import {Blockchains, BlockchainsArray} from "@walletpack/core/models/Blockchains";
import KeyPairService from "@walletpack/core/services/secure/KeyPairService";

export const m10_1_0 = async scatter => {

	// Clearing out the "ethereum.com" network.
    scatter.settings.networks.map(x => {
    	if(x.host === 'ethereum.com'){
    		const endorsed = PluginRepository.plugin(Blockchains.ETH).getEndorsedNetwork();
    		x.host = endorsed.host;
    		x.protocol = endorsed.protocol;
    		x.port = endorsed.port;
    		x.name = endorsed.name;
	    }
    });

    scatter.settings.displayCurrency = 'USD';
    scatter.settings.displayToken = null;
    scatter.settings.languageJson = null;

    return true;
};