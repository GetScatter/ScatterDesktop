import {blockchainName, Blockchains, BlockchainsArray} from "../models/Blockchains";
import PluginRepository from "../plugins/PluginRepository";
import Explorer from "../models/Explorer";

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
			fetch(`https://api.get-scatter.com/v1/explorers`).then(r => r.json())
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