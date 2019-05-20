import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {blockchainName, Blockchains, BlockchainsArray} from "../../models/Blockchains";
import KeyPairService from "../../services/secure/KeyPairService";
import IdGenerator from "../../util/IdGenerator";

export const m11_0_0 = async scatter => {

	const keypairs = scatter.keychain.keypairs.map(x => x.clone());
	scatter.keychain.keypairs = [];
	scatter.onboarded = true;

	keypairs.map(keypair => {
		delete keypair.keyHash;

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
		})

	})


    return true;
};