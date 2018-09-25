import {store} from '../store/store';
import * as Actions from '../store/constants';
import {Blockchains, BlockchainsArray} from '../models/Blockchains';
import PluginRepository from '../plugins/PluginRepository'

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
        const eosPlugin = PluginRepository.plugin(Blockchains.EOSIO);

        //TODO: Only fetching EOS Tokens for now.
        // const accounts = store.state.scatter.keychain.accounts;
        const accounts = store.state.scatter.keychain.accounts.filter(x => x.blockchain() === Blockchains.EOSIO);

        const balances = {};
        const tokens = store.state.tokens;

        await Promise.all(accounts.map(async account => {
            const plugin = PluginRepository.plugin(account.blockchain());

            // Only get from endorsed networks
            if(!await plugin.isEndorsedNetwork(account.network())) return false;

            balances[account.unique()] = [];

            return await Promise.all(tokens.map(async token => {
                const balance = await plugin.balanceFor(account, token.account, token.symbol);
                if(parseFloat(balance) > 0){
                    balances[account.unique()].push({symbol:token.symbol, balance, account:token.account, blockchain:account.blockchain()});
                }
                return true;
            }));
        }));

        await store.dispatch(Actions.SET_BALANCES, balances);
    }

    static tokenDecimals(token){
        const tokenBalance = Object.keys(store.state.balances).map(x => store.state.balances[x]).find(x => x.symbol === token.symbol);
        return tokenBalance ? tokenBalance.balance.toString().split('.')[1].length : PluginRepository.plugin(token.blockchain).defaultDecimals();
    }

    static async valueToTokens(token, value){
        const balances = store.state.balances;
        const prices = await PriceService.getAll();
        if(!prices || !Object.keys(prices).length || !prices.hasOwnProperty(token.symbol)) return 0;
        return parseFloat(value / prices[token.symbol].price).toFixed(this.tokenDecimals(token));
    }

    static async getTokenInfo(token){
        const plugin = PluginRepository.plugin(token.blockchain);
        return plugin.tokenInfo(token);
    }

    static accountBalancesFor(token){
        let accountBalances = [];
        Object.keys(store.state.balances).map(accountUnique => {
            const account = store.state.scatter.keychain.accounts.find(x => x.unique() === accountUnique);
            const foundToken = store.state.balances[accountUnique].find(x => x.blockchain === token.blockchain && x.symbol === token.symbol);
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