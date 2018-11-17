import PluginRepository from '../../plugins/PluginRepository';
import {Blockchains} from '../../models/Blockchains'
import {store} from '../../store/store'
import Crypto from '../../util/Crypto';
import {BlockchainsArray} from '../../models/Blockchains';

export const m9_5_0 = async scatter => {

    scatter.settings.networks = scatter.settings.networks.filter(x => x.blockchain !== Blockchains.TRX);
    scatter.settings.networks.push(PluginRepository.plugin(Blockchains.TRX).getEndorsedNetwork());

    return true;
};