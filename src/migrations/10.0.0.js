import PluginRepository from '@walletpack/core/plugins/PluginRepository';
import Explorer from "@walletpack/core/models/Explorer";
import {BlockchainsArray} from "@walletpack/core/models/Blockchains";
import KeyPairService from "@walletpack/core/services/secure/KeyPairService";

export const m10_0_0 = async scatter => {

    // Resetting explorers as structures have changed.
    scatter.settings.explorers = PluginRepository.defaultExplorers();
    BlockchainsArray.map(({value:blockchain}) => {
	    scatter.settings.explorers[blockchain] = Explorer.fromRaw(scatter.settings.explorers[blockchain].raw);
    });

    // Removing display token as structure has changed.
    scatter.settings.displayToken = null;

    // Removing all hardware wallets as uniques have changed.
	scatter.keychain.keypairs.filter(x => x.external).map(x => {
		scatter.keychain.removeKeyPair(x);
	});

    return true;
};