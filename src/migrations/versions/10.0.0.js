import PluginRepository from '../../plugins/PluginRepository';

export const m10_0_0 = async scatter => {

    scatter.settings.explorers = PluginRepository.defaultExplorers();

    return true;
};