import * as PluginTypes from './PluginTypes';
import EOS from './defaults/eos';
import ETH from './defaults/eth';
import TRX from './defaults/trx';
import {BlockchainsArray} from '../models/Blockchains';

/***
 * Setting up for plugin based generators,
 * this will add more blockchain compatibility in the future.
 */

class PluginRepositorySingleton {

    constructor(){
        this.plugins = [];
        this.loadPlugins();
    }

    loadPlugins(){
        this.plugins.push(new EOS());
        this.plugins.push(new ETH());
        this.plugins.push(new TRX());
    }

    signatureProviders(){
        return this.plugins.filter(plugin => plugin.type === PluginTypes.BLOCKCHAIN_SUPPORT);
    }

    supportedBlockchains(){
        return this.signatureProviders().map(plugin => name)
    }

    plugin(name){
        return this.plugins.find(plugin => plugin.name === name);
    }

    async endorsedNetworks(){
        return await Promise.all(this.signatureProviders().map(async plugin => await plugin.getEndorsedNetwork()));
    }

    defaultExplorers(){
        const plugins = this.signatureProviders();
        return BlockchainsArray.reduce((acc,x) => {
            const explorers = this.plugin(x.value).explorers();
            acc[x.value] = explorers[Object.keys(explorers)[0]];
            return acc;
        }, {})
    }

    allExplorers(){
        const plugins = this.signatureProviders();
        return BlockchainsArray.reduce((acc,x) => {
            acc[x.value] = this.plugin(x.value).explorers();
            return acc;
        }, {})
    }
}

const PluginRepository = new PluginRepositorySingleton();
export default PluginRepository;