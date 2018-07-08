import {store} from '../store/store';
import * as Actions from '../store/constants';
const Store = window.require('electron-store');
const scatterStorage = new Store({name:'scatter'});
const abiStorage = new Store({name:'abi'});

export default class StorageService {

    constructor(){}

    static setScatter(scatter){
        return scatterStorage.set('scatter', scatter);
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