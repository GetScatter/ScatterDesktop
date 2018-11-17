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
		const accounts = store.state.scatter.keychain.accounts;
		await Promise.all(accounts.map(account => this.loadBalancesFor(account)));
	}

}