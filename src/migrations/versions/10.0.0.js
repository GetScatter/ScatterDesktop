import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {BlockchainsArray} from "../../models/Blockchains";

export const m10_0_0 = async scatter => {

    scatter.settings.explorers = PluginRepository.defaultExplorers();
    BlockchainsArray.map(({value:blockchain}) => {
	    scatter.settings.explorers[blockchain] = Explorer.fromRaw(scatter.settings.explorers[blockchain].raw);
    });
    console.log('set explorers', scatter.settings.explorers);

    return true;
};