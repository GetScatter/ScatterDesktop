import {store} from '../store/store';
import * as Actions from '../store/constants';
import {Blockchains, BlockchainsArray} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'
import ObjectHelpers from '../util/ObjectHelpers'

const api = "https://api.get-scatter.com";

// Once every 30 minutes.
const intervalTime = 60000 * 10;
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
            fetch(api+'/v1/prices').then(x => x.json())
        ])
    }

    static tokenDecimals(token){
        const tokenBalance = ObjectHelpers.flatten(Object.keys(store.state.balances).map(x => store.state.balances[x])).find(x => x.blockchain === token.blockchain && x.account === token.account && x.symbol === token.symbol);
        return tokenBalance ? tokenBalance.balance.toString().split('.')[1].length : PluginRepository.plugin(token.blockchain).defaultDecimals();
    }

    static async valueToTokens(token, value){
        const prices = await PriceService.getAll();
        if(!prices || !Object.keys(prices).length || !prices.hasOwnProperty(token.symbol)) return 0;
        return parseFloat(value / prices[token.symbol].price).toFixed(this.tokenDecimals(token));
    }

    static async tokensToValue(token, value){
        const prices = await PriceService.getAll();
        if(!prices || !Object.keys(prices).length || !prices.hasOwnProperty(token.symbol)) return 0;
        return parseFloat(value * prices[token.symbol].price).toFixed(2);
    }

    static tokensFor(token){
        let accountBalances = [];
        Object.keys(store.state.balances).map(accountUnique => {
            const account = store.state.scatter.keychain.accounts.find(x => x.unique() === accountUnique);
            const foundToken = store.state.balances[accountUnique].find(x => x.blockchain === token.blockchain && x.account === token.account && x.symbol === token.symbol);
            if(foundToken){
                accountBalances.push({
                    account,
                    balance:foundToken.balance,
                });
            }
        });
        return accountBalances;
    }

}