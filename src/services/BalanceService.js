import PluginRepository from "../plugins/PluginRepository";
import {store} from "../store/store";
import * as Actions from "../store/constants";

let lastBalanceTime;

export default class BalanceService {

	static async loadBalancesFor(account){
		const blockchain = account.blockchain();
		const plugin = PluginRepository.plugin(blockchain);
		const tokens = store.getters.allTokens.filter(x => x.blockchain === blockchain)
			.filter(x => x.chainId === account.network().chainId);
		const balances = await plugin.balancesFor(account, tokens);
		return store.dispatch(Actions.SET_BALANCES, {account:account.identifiable(), balances});
	}

	static async loadAllBalances(force = false){
		if(!force && lastBalanceTime < (+new Date()+1000*60*5)) return;
		lastBalanceTime = +new Date();
		const accounts = store.state.scatter.keychain.accounts.reduce((acc, account) => {
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
		const accountKeys = store.state.scatter.keychain.accounts.map(x => x.identifiable());
		const keysToRemove = Object.keys(store.state.balances).filter(key => !accountKeys.includes(key));
		return store.dispatch(Actions.REMOVE_BALANCES, keysToRemove);
	}

}