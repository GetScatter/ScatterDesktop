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
import UpdateService from "./UpdateService";

let initialized = false;

export default class SingletonService {

	static async init(){
		if(initialized) return true;
		initialized = true;
		SocketService.initialize();
		UpdateService.needsUpdate();
		AppsService.getApps();
		StoreService.get().dispatch(Actions.LOAD_HISTORY);
		StoreService.get().dispatch(Actions.LOAD_LANGUAGE);
		RIDLService.init().then(() => {
			RIDLService.checkAccounts();
		})

		PermissionService.removeDanglingPermissions();
		AccountService.fixOrphanedAccounts();
		LanguageService.regenerateLanguage();
		PriceService.watchPrices();
		RecurringService.checkProxies();
		return true;
	}

}