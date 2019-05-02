import PluginRepository from "../../plugins/PluginRepository";
import * as Actions from "../../store/constants";
import StoreService from "../utility/StoreService";

let lastBalanceTime;

export default class BalanceService {

	static async loadBalancesFor(account){
		try {
			const blockchain = account.blockchain();
			const plugin = PluginRepository.plugin(blockchain);
			const tokens = StoreService.get().getters.allTokens.filter(x => x.blockchain === blockchain)
				.filter(x => x.chainId === account.network().chainId);
			const balances = await plugin.balancesFor(account, tokens);
			(await this.loadUntouchables(account)).map(x => balances.push(x));
			return StoreService.get().dispatch(Actions.SET_BALANCES, {account:account.identifiable(), balances});
		} catch(e){
			return null;
		}
	}

	static async loadAllBalances(force = false){
		if(!force && lastBalanceTime < (+new Date()+1000*60*5)) return;
		lastBalanceTime = +new Date();
		const accounts = StoreService.get().state.scatter.keychain.accounts.reduce((acc, account) => {
			// Filtering out permission based accounts
			if(!acc.find(x => x.identifiable() === account.identifiable())) acc.push(account);
			return acc;
		}, []).sort(async account => {
			// Sorting mainnets first.
			const isMainnet = PluginRepository.plugin(account.blockchain()).isEndorsedNetwork(account.network());
			return isMainnet ? -1 : 1;
		});

		for(let i = 0; i < accounts.length; i++){
			await Promise.race([
				new Promise(resolve => setTimeout(() => resolve(), 20000)),
				this.loadBalancesFor(accounts[i])
			])
		}

		return true;
	}

	static removeStaleBalances(){
		const accountKeys = StoreService.get().state.scatter.keychain.accounts.map(x => x.identifiable());
		const keysToRemove = Object.keys(StoreService.get().state.balances).filter(key => !accountKeys.includes(key));
		return StoreService.get().dispatch(Actions.REMOVE_BALANCES, keysToRemove);
	}

	static async loadUntouchables(account){
		const plugin = PluginRepository.plugin(account.blockchain());
		return plugin.hasUntouchableTokens() ? plugin.untouchableBalance(account) : [];
	}

	static totalBalances(allNetworks = false){
		const tokens = {};
		tokens['totals'] = {};

		Object.keys(StoreService.get().state.balances).map(async accountUnique => {
			const account = StoreService.get().state.scatter.keychain.accounts.find(x => x.identifiable() === accountUnique);
			if(!account) return;

			if(!allNetworks && StoreService.get().getters.mainnetTokensOnly){
				if(!PluginRepository.plugin(account.blockchain()).isEndorsedNetwork(account.network()))
					return;
			}

			if(!tokens.hasOwnProperty(account.networkUnique)){
				tokens[account.networkUnique] = {};
			}

			if(!StoreService.get().state.balances[accountUnique]) return;
			StoreService.get().state.balances[accountUnique].map(token => {
				if(!tokens[account.networkUnique].hasOwnProperty(token.uniqueWithChain())) {
					tokens[account.networkUnique][token.uniqueWithChain()] = token.clone();
					tokens['totals'][token.uniqueWithChain()] = token.clone();
				} else {
					tokens[account.networkUnique][token.uniqueWithChain()].add(token.amount);
					tokens['totals'][token.uniqueWithChain()].add(token.amount);
				}
			});
		});

		return tokens;
	}

}