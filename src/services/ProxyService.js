import {blockchainName, BlockchainsArray} from "../models/Blockchains";
import Explorer from "../models/Explorer";
import Configs from "../../configs";

export default class ProxyService {

	static async getProxyList(){
		return Promise.race([
			new Promise((resolve) => setTimeout(() => resolve([]), 3000)),
			fetch(`${Configs.api}/proxies`).then(r => r.json()).catch(() => [])
		]);
	}

}