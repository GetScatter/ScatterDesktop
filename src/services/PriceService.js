import {store} from '../store/store';
import * as Actions from '../store/constants';
import {Blockchains, BlockchainsArray} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'
import ObjectHelpers from '../util/ObjectHelpers'
import StorageService from "./StorageService";
import Token from "../models/Token";

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
                if(prices && Object.keys(prices).length) {
                    await store.dispatch(Actions.SET_PRICES, prices);
                }
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

    static async getTimeline(date = null){
        const api = 'http://localhost:6544';
        const query = date ? `?date=${date}` : '';
        return Promise.race([
		    new Promise(resolve => setTimeout(() => resolve(false), 10000)),
		    fetch(api+'/v1/prices/timeline'+query).then(x => x.json()).catch(() => {})
	    ])
    }

    static getTotal(totals){
	    // const totals = this.totalBalances.totals;


	    if(store.getters.displayToken){
		    if(totals.hasOwnProperty(store.getters.displayToken)) return totals[store.getters.displayToken]
		    else {
			    const token = Token.fromUnique(store.getters.displayToken);
			    token.amount = parseFloat(0).toFixed(token.decimals);
			    return token;
		    }
	    } else {
		    let total = 0;

		    Object.keys(store.state.prices).map(tokenUnique => {
			    const balance = totals[tokenUnique];
			    if(balance){
				    const price = store.state.prices[tokenUnique][store.getters.displayCurrency];
				    const value = parseFloat(parseFloat(balance.amount) * parseFloat(price));
				    if(isNaN(value)) return;
				    total += value;
			    }
		    });

		    const fiatSymbol = () => {
			    switch(store.getters.displayCurrency){
				    case 'USD':
				    case 'AUD':
				    case 'CAD':
					    return '$';
				    case 'CNY':
				    case 'JPY':
					    return '¥';
				    case 'EUR': return '€';
				    case 'GBP': return '£';


				    default: return store.getters.displayCurrency;
			    }
		    }

		    return Token.fromJson({
			    symbol:fiatSymbol(),//this.displayCurrency,
			    amount:total.toFixed(2),
		    })
	    }
    }

}