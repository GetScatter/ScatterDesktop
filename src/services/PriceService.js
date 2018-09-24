import {Blockchains} from '../models/Blockchains';
import {store} from '../store/store';
import * as Actions from '../store/constants';

const cmc = x => `https://api.coinmarketcap.com/v2/ticker/${x}/`

// Once every 30 minutes.
const intervalTime = 60000 * 30;
let priceInterval;


export default class PriceService {

    static async watchPrices(){
        clearInterval(priceInterval);
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
            new Promise(resolve => setTimeout(() => resolve(false), 1000)),
            fetch('https://api.coinmarketcap.com/v2/ticker/').then(x => x.json()).then(res => {
                return Object.keys(res.data).map(key => {
                    const token = res.data[key];
                    const {symbol, name, quotes} = token;
                    const price = parseFloat(quotes.USD.price).toFixed(2);
                    return { symbol, name, price };
                }).reduce((acc, x) => {
                    acc[x.symbol] = x;
                    return acc;
                }, {});
            })
        ])
    }

}