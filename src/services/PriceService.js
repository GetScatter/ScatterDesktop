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
            new Promise(resolve => setTimeout(() => resolve(false), 1000)),
            fetch(api+'/v1/prices').then(x => x.json())
        ])
    }

    static async getAllTokens(){
        let tokens = [];
        await Promise.all(BlockchainsArray.map(async ({value}) => {
            const plugin = PluginRepository.plugin(value);
            await plugin.fetchTokens(tokens);
            return true;
        }));

        return store.dispatch(Actions.SET_TOKENS, tokens);
    }

    static async getBalances(){
        const accounts = store.state.scatter.keychain.accounts
            .reduce((acc, account) => {
                if(!acc.find(x => x.sendable() === account.sendable())) acc.push(account);
                return acc;
            }, []);

        const balances = {};
        const tokens = store.state.tokens;

        await Promise.all(accounts.map(async account => {
            const plugin = PluginRepository.plugin(account.blockchain());

            // Only get from endorsed networks
            if(!await plugin.isEndorsedNetwork(account.network())) return false;

            balances[account.unique()] = [];

            return await Promise.all(tokens.map(async token => {
                if(token.blockchain !== account.blockchain()) return false;
                return Promise.race([
                    new Promise(resolve => setTimeout(() => resolve(true), 500)),
                    (async () => {
                        const balance = await plugin.balanceFor(account, token.account, token.symbol);
                        if(parseFloat(balance) > 0){
                            balances[account.unique()].push({symbol:token.symbol, balance, account:token.account, blockchain:account.blockchain()});
                        }
                        return true;
                    })()
                ])
            }));
        }));

        await store.dispatch(Actions.SET_BALANCES, balances);
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

    static async getTokenInfo(token){
        const plugin = PluginRepository.plugin(token.blockchain);
        return plugin.tokenInfo(token);
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

    static async toggleDisplayToken(token){
        const scatter = store.state.scatter.clone();
        if(!scatter.settings.displayToken) scatter.settings.displayToken = token;
        else scatter.settings.displayToken = scatter.settings.displayToken.symbol !== token.symbol ? token : null;
        await this.watchPrices(!!token);
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

}