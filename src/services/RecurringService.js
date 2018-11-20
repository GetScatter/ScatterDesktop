import {store} from "../store/store";
import * as Actions from "../store/constants";
import PluginRepository from "../plugins/PluginRepository";
import {Blockchains} from "../models/Blockchains";

export default class RecurringService {

	static async addProxy(account, proxy){
		const scatter = store.state.scatter.clone();
		scatter.recurring.proxies = scatter.recurring.proxies.filter(x => x.account !== account.identifiable());
		scatter.recurring.proxies.push({
			account:account.identifiable(),
			proxy,
			timestamp:+new Date()
		});
		return store.dispatch(Actions.SET_SCATTER, scatter);
	}

	static async removeProxies(accounts){
		const scatter = store.state.scatter.clone();
		const ids = accounts.map(x => x.identifiable());
		scatter.recurring.proxies = scatter.recurring.proxies.filter(x => !ids.includes(x.account));
		return store.dispatch(Actions.SET_SCATTER, scatter);
	}

	static async checkProxies(){
		const scatter = store.state.scatter.clone();
		const accounts = store.getters.accounts;

		const accountIds = accounts.map(x => x.identifiable());
		const removedAccounts = scatter.recurring.proxies.filter(x => !accountIds.includes(x.account));
		if(removedAccounts.length) await this.removeProxies(removedAccounts);

		const now = +new Date();
		const staleTime = 1000*60*60*24*7; // 7 days
		const staleProxies = scatter.recurring.proxies.filter(proxy => {
			return now > proxy.timestamp + staleTime;
		});

		if(!staleProxies) return true;

		const failed = (await Promise.all(staleProxies.map(proxy => {
			const account = accounts.find(x => x.identifiable() === proxy.account);
			return PluginRepository.plugin(account.blockchain()).proxyVote(account, proxy.proxy).then(res => {
				return {res, account}
			});
		}))).filter(x => !x.res);

		// If a proxy fails, we're just going to remove it.
		if(failed.length){
			await this.removeProxies(failed.map(x => x.account));
		}

		return true;
	}

}