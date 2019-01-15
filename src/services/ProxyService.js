import {GET} from "./BackendApiService";

export default class ProxyService {

	static async getProxyList(){
		return Promise.race([
			new Promise((resolve) => setTimeout(() => resolve([]), 3000)),
			GET(`proxies`).catch(() => [])
		]);
	}

}