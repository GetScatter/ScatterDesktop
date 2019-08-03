import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {blockchainName, Blockchains, BlockchainsArray} from "../../models/Blockchains";
import KeyPairService from "../../services/secure/KeyPairService";
import IdGenerator from "../../util/IdGenerator";
import {LANG} from "../../localization/locales";
import {LocationInformation} from "../../models/Identity";

export const m11_0_0 = async scatter => {

	const keypairs = scatter.keychain.keypairs.map(x => x.clone());
	scatter.keychain.keypairs = [];

	scatter.settings.language = LANG.ENGLISH;

	await Promise.all(keypairs.map(async keypair => {
		delete keypair.keyHash;

		await KeyPairService.addPublicKey(keypair, Blockchains.BTC, true);

		let first = true;
		keypair.blockchains.map(blockchain => {
			const accounts = scatter.keychain.accounts.filter(x => x.keypairUnique === keypair.unique() && x.blockchain() === blockchain);
			if(accounts.length){
				const clone = keypair.clone();
				if(!first) {
					// Generating new ID
					clone.id = IdGenerator.text(24);
					// Re-linking all accounts.
					accounts.map(account => account.keypairUnique = clone.id);
					// Changing name
					clone.name = `${blockchainName(blockchain)} copy of ${clone.name}`;
				}
				// Setting blockchains
				clone.blockchains = [blockchain];
				scatter.keychain.keypairs.push(clone);
			}

			first = false;
		});

		return true;
	}))

	scatter.keychain.identities.map(identity => {
		const location = identity.locations.length ? identity.locations[0] : LocationInformation.fromJson({name:`Location for ${identity.name}`});
		scatter.keychain.locations.push(location);
		identity.location = location.id;
		delete identity.locations;
	});

	const btcNetwork = PluginRepository.plugin(Blockchains.BTC).getEndorsedNetwork();
	if(!scatter.settings.networks.find(x => x.unique() === btcNetwork.unique())){
		scatter.settings.networks.push(btcNetwork);
	}

	scatter.settings.explorers[Blockchains.BTC] = Explorer.fromRaw(PluginRepository.plugin(Blockchains.BTC).defaultExplorer());

    return true;
};