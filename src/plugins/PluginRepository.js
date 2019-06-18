import * as PluginTypes from './PluginTypes';
import {Blockchains, BlockchainsArray} from '../models/Blockchains';
import {RUNNING_TESTS} from "../util/TestingHelper";
import Explorer from "../models/Explorer";

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
        BlockchainsArray.map(({value:blockchain}) => {
            if(RUNNING_TESTS){
                // scrypt causes tests to fail due to no prebuilds
                if(blockchain === Blockchains.ETH) return;
            }

            const plugin = require('./defaults/'+blockchain).default;
            this.plugins.push(new plugin);
        });
    }

    signatureProviders(){
        return this.plugins.filter(plugin => plugin.type === PluginTypes.BLOCKCHAIN_SUPPORT);
    }

    plugin(name){
        return this.plugins.find(plugin => plugin.name === name);
    }

    defaultExplorers(){
        return BlockchainsArray.reduce((acc,x) => {
            if(this.plugin(x.value)) {
	            acc[x.value] = Explorer.fromJson({
                    raw:this.plugin(x.value).defaultExplorer()
                });
            }
            return acc;
        }, {})
    }

    bustCaches(){
        this.signatureProviders().map(sp => sp.bustCache())
    }
}

const PluginRepository = new PluginRepositorySingleton();
export default PluginRepository;