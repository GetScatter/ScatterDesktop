import {blockchainName, BlockchainsArray} from "../models/Blockchains";
import Explorer from "../models/Explorer";

export default class ProxyService {

	static async getProxyList(){
		return Promise.race([
			new Promise((resolve) => setTimeout(() => resolve([]), 3000)),
			fetch(`https://api.get-scatter.com/v1/proxies`).then(r => r.json()).catch(() => [])
		]);
	}

}