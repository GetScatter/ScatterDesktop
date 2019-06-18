import * as Actions from '../../store/constants';
import Token from "../../models/Token";
import PopupService from "../utility/PopupService";
import {Popup} from "../../models/popups/Popup";
import {GET} from "./BackendApiService";
import StoreService from "../utility/StoreService";


// Once every 30 minutes.
const intervalTime = 60000 * 30;
let priceInterval;


export default class PriceService {

    static async watchPrices(enable = true){
        clearInterval(priceInterval);
        if(!enable) return;
        return new Promise(async resolve => {

            const setPrices = async () => {
                await PriceService.setPrices();
                resolve(true);
            }

            await setPrices();
            priceInterval = setInterval(async () => {
                await setPrices();
            }, intervalTime);
        })
    }

    static async setPrices(){
		const prices = await PriceService.getAll();
		if(prices && Object.keys(prices).length) {
			await StoreService.get().dispatch(Actions.SET_PRICES, prices);
		}
	}

    static getAll(){
        return Promise.race([
            new Promise(resolve => setTimeout(() => resolve(false), 10000)),
	        GET(`prices?v2=true`).catch(() => {
            	PopupService.push(Popup.snackbar("Problem connecting to Prices API"));
            	return null;
            })
        ])
    }

    static async getCurrencies(){
        return Promise.race([
		    new Promise(resolve => setTimeout(() => resolve(false), 10000)),
	        GET('currencies').catch(() => ['USD'])
	    ])
    }

    static async getCurrencyPrices(){
        return Promise.race([
		    new Promise(resolve => setTimeout(() => resolve(false), 10000)),
	        GET('currencies/prices').catch(() => null)
	    ])
    }

    static async getTimeline(date = null){
        const query = date ? `?date=${date}` : '';
        return Promise.race([
		    new Promise(resolve => setTimeout(() => resolve(false), 10000)),
	        GET('prices/timeline'+query).catch(() => {})
	    ])
    }

    static getTotal(totals, displayCurrency, bypassDisplayToken, displayToken){
	    if(!displayCurrency) displayCurrency = StoreService.get().getters.displayCurrency;
	    // if(!displayToken) displayToken = StoreService.get().getters.displayToken;



	    if(!bypassDisplayToken && displayToken){
		    if(totals.hasOwnProperty(displayToken)) return totals[displayToken]
		    else {
			    const token = (displayToken instanceof Token ? displayToken : Token.fromUnique(displayToken)).clone();
			    token.amount = parseFloat(0).toFixed(token.decimals);
			    return token;
		    }
	    } else {
		    let total = 0;
		    Object.keys(StoreService.get().state.prices).map(tokenUnique => {
			    const balance = totals[tokenUnique];
			    if(balance){
				    const price = StoreService.get().state.prices[tokenUnique][displayCurrency];
				    const value = parseFloat(parseFloat(balance.amount) * parseFloat(price));
				    if(isNaN(value)) return;
				    total += value;
			    }
		    });

		    return Token.fromJson({
			    symbol:this.fiatSymbol(displayCurrency),//this.displayCurrency,
			    amount:total.toFixed(2),
		    })
	    }
    }

    static fiatSymbol(currency) {
    	if(!currency) currency = StoreService.get().getters.displayCurrency;
		switch(currency){
			case 'USD':
			case 'AUD':
			case 'CAD':
				return '$';
			case 'CNY':
			case 'JPY':
				return '¥';
			case 'EUR': return '€';
			case 'GBP': return '£';


			default: return currency;
		}
	}

}