import {store} from '../store/store';
import * as Actions from '../store/constants';
import BalanceService from "./BalanceService";
import {GET, POST} from './BackendApiService';
import SoundService from "./SoundService";
import {remote} from '../util/ElectronHelpers';
import ObjectHelpers from "../util/ObjectHelpers";
import Token from "../models/Token";
const NotificationService = remote.getGlobal('appShared').NotificationService;


const timeout = (rq, caughtValue = null) => Promise.race([
	new Promise(resolve => setTimeout(() => resolve(caughtValue), 10000)),
	rq.catch(() => caughtValue)
]);

let watchers = [];
let watchTimeout;

export default class ExchangeService {

	static async pairs(token){
		return timeout(POST('exchange/pairs', {token})).then(pairs => {
			if(!pairs) return [];
			Object.keys(pairs).map(key => pairs[key].map(x => x.token = Token.fromJson(x.token)));
			return pairs;
		});
	}

	static async rate(token, other, service){
		return timeout(POST('exchange/rate', {token, other, service}));
	}

	static async order(service, token, other, amount, from, to){
		return timeout(POST('exchange/order', {service, token, other, amount, from, to}));
	}

	static async accepted(id){
		return timeout(GET(`exchange/accepted/${id}`));
	}

	static async cancelled(id){
		return timeout(GET(`exchange/cancelled/${id}`));
	}

	static async orderStatus(id){
		return timeout(GET(`exchange/order/${id}`).then(res => res.updated.status));
	}

	static async stablePaths(){
		return timeout(GET(`exchange/stabilize/paths`), []);
	}

	static async pairable(){
		return timeout(GET(`exchange/pairable`), []);
	}

	static watch(history){
		watchers.push(history);
		this.checkExchanges();
		return true;
	}

	static async checkExchanges(){
		clearTimeout(watchTimeout);
		if(!watchers.length) return;

		for(let i = 0; i < watchers.length; i++){
			const history = watchers[i];
			const status = await this.orderStatus(history.orderDetails.id);
			if(status !== history.status){
				history.status = status;
				await store.dispatch(Actions.UPDATE_HISTORY, history);

				if(status === 'complete'){
					SoundService.ding();
					NotificationService.pushNotification('Exchange Complete', `Your token exchange has just completed.`);

					watchers = watchers.filter(x => x.id !== history.id);

					const accounts = store.getters.accounts.filter(x => x.sendable() === history.to);
					if(accounts.length){
						for(let n = 0; n < accounts.length; n++){
							await BalanceService.loadBalancesFor(accounts[n]);
						}
					}
				}
			}
		}

		setTimeout(() => this.checkExchanges(), 1000*30);
	}

}