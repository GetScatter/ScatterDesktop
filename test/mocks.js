import Scatter from "../src/models/Scatter";
import Settings from "../src/models/Settings";
import Keypair from "../src/models/Keypair";
import Keychain from "../src/models/Keychain";
import {Blockchains} from "../src/models/Blockchains";
import Identity from "../src/models/Identity";
import Account from "../src/models/Account";
import PluginRepository from '../src/plugins/PluginRepository';

export const testScatter = async () => {
	const networks = await Promise.all(PluginRepository.signatureProviders().map(async plugin => {
		return plugin.getEndorsedNetwork();
	}));

	const keypair = Keypair.fromJson({
		name:'Testing Keypair',
		keyHash:'testing_key',
		blockchains:[
			Blockchains.EOSIO,
			Blockchains.TRX
		],
		publicKeys:[
			{blockchain:Blockchains.EOSIO, key:'EOS7w5aJCv5B7y3a6f4WCwPSvs6TpCAoRGnGpiLMsSWbmxaZdKigd'},
			{blockchain:Blockchains.TRX, key:'TF2quv1hTipcZ8FJ8FRsXXLSiJ1C15dqkW'}
		],
	});

	const eosAccount = Account.fromJson({
		keypairUnique:keypair.unique(),
		networkUnique:networks.find(x => x.blockchain === Blockchains.EOSIO).unique(),
		publicKey:keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key,
		name:'ramdeathtest',
		authority:'active'
	});

	const trxAccount = Account.fromJson({
		keypairUnique:keypair.unique(),
		networkUnique:networks.find(x => x.blockchain === Blockchains.TRX).unique(),
		publicKey:keypair.publicKeys.find(x => x.blockchain === Blockchains.TRX).key,
	})


	const scatter = Scatter.fromJson({
		settings:Settings.fromJson({
			networks:await Promise.all(PluginRepository.signatureProviders().map(async plugin => {
				return plugin.getEndorsedNetwork();
			}))
		}),
		keychain:Keychain.fromJson({
			keypairs:[keypair],
			accounts:[eosAccount, trxAccount]
		})
	});

	const identity = Identity.placeholder();
	identity.initialize(scatter.hash);

	return scatter;
};