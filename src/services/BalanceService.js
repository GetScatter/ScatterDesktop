import PluginRepository from "../plugins/PluginRepository";
import {store} from "../store/store";
import * as Actions from "../store/constants";

export default class BalanceService {

	static async loadBalancesFor(account){
		const blockchain = account.blockchain();
		const plugin = PluginRepository.plugin(blockchain);
		const tokens = store.getters.allTokens.filter(x => x.blockchain === blockchain);
		const balances = await plugin.balancesFor(account, tokens);
		return store.dispatch(Actions.SET_BALANCES, {account:account.identifiable(), balances});
	}

	static async loadAllBalances(){
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
			await this.loadBalancesFor(accounts[i]);
		}

		return true;
	}

	static removeStaleBalances(){
		const accountKeys = store.state.scatter.keychain.accounts.map(x => x.identifiable());
		const keysToRemove = Object.keys(store.state.balances).filter(key => !accountKeys.includes(key));
		return store.dispatch(Actions.REMOVE_BALANCES, keysToRemove);
	}

}