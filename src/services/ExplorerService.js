import {blockchainName, Blockchains, BlockchainsArray} from "../models/Blockchains";
import PluginRepository from "../plugins/PluginRepository";
import Explorer from "../models/Explorer";
import {GET} from "./BackendApiService";

export default class ExplorerService {

	static getExplorers(){
		let explorers = {};
		BlockchainsArray.map(({value:blockchain}) => explorers[blockchain] = []);

		const setDefaultExplorers = () => {
			explorers = PluginRepository.defaultExplorers();
		};

		return Promise.race([
			new Promise((resolve) => setTimeout(() => {
				setDefaultExplorers();
				resolve(explorers);
			}, 3000)),
			GET(`explorers`)
				.then(res => {
					BlockchainsArray.map(({value:blockchain}) => {
						res[blockchainName(blockchain)].map(rawExplorer => {
							explorers[blockchain].push(Explorer.fromRaw(rawExplorer));
						});
					});

					return explorers;
				}).catch(err => {
				setDefaultExplorers();
				return explorers;
			})
		])
	}

}