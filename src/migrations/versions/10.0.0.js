import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {BlockchainsArray} from "../../models/Blockchains";
import KeyPairService from "../../services/KeyPairService";

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