import PluginRepository from '@walletpack/core/plugins/PluginRepository';
import {Blockchains} from '@walletpack/core/models/Blockchains'
import Crypto from '@walletpack/core/util/Crypto';
import {BlockchainsArray} from '@walletpack/core/models/Blockchains';

export const m9_5_0 = async scatter => {

    scatter.settings.networks = scatter.settings.networks.filter(x => x.blockchain !== Blockchains.TRX);
    scatter.settings.networks.push(PluginRepository.plugin(Blockchains.TRX).getEndorsedNetwork());

    return true;
};