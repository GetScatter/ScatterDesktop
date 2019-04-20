import {store} from '../store/store';
import * as Actions from '../store/constants';
import AccountService from "./AccountService";
import LanguageService from "./LanguageService";
import PriceService from "./PriceService";
import RecurringService from "./RecurringService";
import PermissionService from "./PermissionService";
import RIDLService from "./RIDLService";

let initialized = false;

export default class SingletonService {

	static async init(){
		if(initialized) return true;
		initialized = true;
		store.dispatch(Actions.LOAD_HISTORY);
		store.dispatch(Actions.LOAD_LANGUAGE);
		await RIDLService.init();
		await RIDLService.checkAccounts();
		await PermissionService.removeDanglingPermissions();
		await AccountService.fixOrphanedAccounts();
		await LanguageService.regenerateLanguage();
		await PriceService.watchPrices();
		await RecurringService.checkProxies();
		return true;
	}

}