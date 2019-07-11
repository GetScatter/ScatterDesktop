import PluginRepository from 'scatter-core/plugins/PluginRepository';
import {Blockchains} from 'scatter-core/models/Blockchains'
import Crypto from 'scatter-core/util/Crypto';
import {BlockchainsArray} from 'scatter-core/models/Blockchains';

export const m9_5_0 = async scatter => {

    scatter.settings.networks = scatter.settings.networks.filter(x => x.blockchain !== Blockchains.TRX);
    scatter.settings.networks.push(PluginRepository.plugin(Blockchains.TRX).getEndorsedNetwork());

    return true;
};