import PluginRepository from '../../plugins/PluginRepository';
import {Blockchains} from '../../models/Blockchains'
import Crypto from '../../util/Crypto';
import {BlockchainsArray} from '../../models/Blockchains';

export const m9_2_0 = async scatter => {

    await Promise.all(scatter.settings.networks.map(async network => {
        if(network.blockchain === Blockchains.ETH && network.host === 'ethereum.com')
            network = PluginRepository.plugin(Blockchains.ETH).getEndorsedNetwork();

        return network;
    }));

    if(!scatter.settings.networks.find(x => x.blockchain === Blockchains.TRX))
        scatter.settings.networks.push(PluginRepository.plugin(Blockchains.TRX).getEndorsedNetwork());

    return true;
};