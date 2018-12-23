import {store} from '../store/store';
import * as Actions from '../store/constants';
import {Blockchains, BlockchainsArray} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'
import ObjectHelpers from '../util/ObjectHelpers'

// const api = "https://api.get-scatter.com";
const api = "http://localhost:6545";

// Once every 30 minutes.
const intervalTime = 60000 * 30;
let priceInterval;


export default class PriceService {

    static async watchPrices(enable = true){
        clearInterval(priceInterval);
        if(!enable) return;
        return new Promise(async resolve => {

            const setPrices = async () => {
                const prices = await PriceService.getAll();
                if(prices && Object.keys(prices).length) await store.dispatch(Actions.SET_PRICES, prices);
                resolve(true);
            }

            await setPrices();
            priceInterval = setInterval(async () => {
                await setPrices();
            }, intervalTime);
        })
    }

    static getAll(){
        return Promise.race([
            new Promise(resolve => setTimeout(() => resolve(false), 10000)),
            fetch(api+'/v1/prices?v2=true').then(x => x.json())
        ])
    }

    static async getCurrencies(){
        return Promise.race([
		    new Promise(resolve => setTimeout(() => resolve(false), 10000)),
		    fetch(api+'/v1/currencies').then(x => x.json()).catch(() => ['USD'])
	    ])
    }

}