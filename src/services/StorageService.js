import {store} from '../store/store';
import * as Actions from '../store/constants';
const Store = window.require('electron-store');

const SCATTER_DATA_NAME = 'scatter';
const SCATTER_INTERMED_NAME = 'scatter_intermed';

const scatterStorage = new Store({name:SCATTER_DATA_NAME});
const scatterIntermedStorage = new Store({name:SCATTER_INTERMED_NAME});
const abiStorage = new Store({name:'abi'});

const {remote} = window.require('electron');
const app = remote.app;
const dataPath = app.getPath('userData');
const fs = window.require('fs');

let saveResolvers = [];
let saveTimeouts = [];
const clearSaveTimeouts = () => {
	saveResolvers.map(x => x(true));
    saveTimeouts.map(x => clearTimeout(x));
    saveTimeouts = [];
};

const safeSetScatter = async (scatter, resolver) => {
	const path = name => `${dataPath}/${name}.json`;
	const retry = () => saveTimeouts.push(
		setTimeout(() => safeSetScatter(scatter, resolver), 50)
	);

	const salt = await StorageService.getSalt();
	await scatterIntermedStorage.set('scatter', scatter);
	await scatterIntermedStorage.set('salt', salt);
	const savedScatter = await scatterIntermedStorage.get('scatter');

	// Didn't save properly
	if(scatter !== savedScatter) retry();

	// Saved properly, overwriting old data with new data
	else fs.rename(path(SCATTER_INTERMED_NAME), path(SCATTER_DATA_NAME), (err) => {
		if(err) return retry();
		resolver(true);
	});
}

export default class StorageService {

    constructor(){}

    static async setScatter(scatter){
	    return new Promise(async resolve => {
		    clearSaveTimeouts();
		    saveResolvers.push(resolve);
		    safeSetScatter(scatter, resolve);
        })
    };

    static getScatter() {
        return scatterStorage.get('scatter');
    }

    static removeScatter(){
        scatterStorage.clear();
        abiStorage.clear();
        store.commit(Actions.SET_SCATTER, null);
        store.commit(Actions.SET_SEED, '');
        return true;
    }

    static cacheABI(contractName, chainId, abi){
        return abiStorage.set(`abis.${contractName}_${chainId}`, abi);
    }

    static getCachedABI(contractName, chainId){
        return abiStorage.get(`abis.${contractName}_${chainId}`);
    }

    static getSalt(){
        return scatterStorage.get('salt') || 'SALT_ME';
    }

    static setSalt(salt){
        return scatterStorage.set('salt', salt);
    }
}