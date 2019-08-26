import PluginRepository from '@walletpack/core/plugins/PluginRepository';
import {Blockchains} from '@walletpack/core/models/Blockchains'
import Crypto from '@walletpack/core/util/Crypto';
import {BlockchainsArray} from '@walletpack/core/models/Blockchains';

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