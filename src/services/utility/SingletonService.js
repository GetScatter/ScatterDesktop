
import AccountService from "@walletpack/core/services/blockchain/AccountService";
import PriceService from "@walletpack/core/services/apis/PriceService";
import PermissionService from "@walletpack/core/services/apps/PermissionService";
import StoreService from "@walletpack/core/services/utility/StoreService";
import SocketService from "@walletpack/core/services/utility/SocketService";
import AppsService from "@walletpack/core/services/apps/AppsService";
import PluginRepository from "@walletpack/core/plugins/PluginRepository";
import { Blockchains } from "@walletpack/core/models/Blockchains";

let initialized = false;
export default class SingletonService {
	static async init() {
		if (initialized) return true;
		initialized = true;
		// TODO:
		// PluginRepository.plugin(Blockchains.TRX).init();
		SocketService.initialize();
		AppsService.getApps();
		PriceService.watchPrices();
		PermissionService.removeDanglingPermissions();
		AccountService.fixOrphanedAccounts();
		return true;
	}

}