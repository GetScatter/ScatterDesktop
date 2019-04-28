import * as Actions from '../../store/constants';
import AccountService from "../blockchain/AccountService";
import LanguageService from "./LanguageService";
import PriceService from "../apis/PriceService";
import RecurringService from "../blockchain/RecurringService";
import PermissionService from "../apps/PermissionService";
import RIDLService from "../apis/RIDLService";
import StoreService from "./StoreService";
import SocketService from "./SocketService";
import AppsService from "../apps/AppsService";

let initialized = false;

export default class SingletonService {

	static async init(){
		if(initialized) return true;
		initialized = true;
		await SocketService.initialize();
		await AppsService.getApps();
		StoreService.get().dispatch(Actions.LOAD_HISTORY);
		StoreService.get().dispatch(Actions.LOAD_LANGUAGE);
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