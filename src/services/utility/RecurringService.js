import * as Actions from "@walletpack/core/store/constants";
import PluginRepository from "@walletpack/core/plugins/PluginRepository";
import {Blockchains} from "@walletpack/core/models/Blockchains";
import StoreService from "@walletpack/core/services/utility/StoreService";

let checkedProxies = false;
export default class RecurringService {

	static async addProxy(account, proxy){
		const scatter = StoreService.get().state.scatter.clone();
		scatter.recurring.proxies = scatter.recurring.proxies.filter(x => x.account !== account.identifiable());
		scatter.recurring.proxies.push({
			account:account.identifiable(),
			proxy,
			timestamp:+new Date()
		});
		return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	}

	static async removeProxies(accounts){
		const scatter = StoreService.get().state.scatter.clone();
		const identifiables = accounts.map(x => x.identifiable());
		scatter.recurring.proxies = scatter.recurring.proxies.filter(x => !identifiables.includes(x.account));
		return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	}

	static async touchProxies(accounts){
		const scatter = StoreService.get().state.scatter.clone();
		const identifiables = accounts.map(x => x.identifiable());
		scatter.recurring.proxies.filter(x => identifiables.includes(x.account)).map(x => x.timestamp = +new Date());
		return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	}

	static async checkProxies(){
		if(checkedProxies) return;
		checkedProxies = true;

		const scatter = StoreService.get().state.scatter.clone();
		const accounts = StoreService.get().state.scatter.keychain.accounts;

		const accountIds = accounts.map(x => x.identifiable());
		const removedAccounts = scatter.recurring.proxies.filter(x => !accountIds.includes(x.account));
		if(removedAccounts.length) await this.removeProxies(removedAccounts);

		const now = +new Date();
		const staleTime = 1000*60*60*24*7; // 7 days
		const staleProxies = scatter.recurring.proxies.filter(proxy => {
			return now > proxy.timestamp + staleTime;
		});


		if(!staleProxies) return true;

		const proxied = (await Promise.all(staleProxies.map(async proxy => {
			const account = accounts.find(x => x.identifiable() === proxy.account);
			return PluginRepository.plugin(account.blockchain()).proxyVote(account, proxy.proxy).then(res => {
				return {res, account}
			});
		})));

		const failed = proxied.filter(x => !x.res);
		const succeeded = proxied.filter(x => x.res);

		if(failed.length) await this.removeProxies(failed.map(x => x.account));
		if(succeeded.length) await this.touchProxies(succeeded.map(x => x.account));

		return true;
	}

}