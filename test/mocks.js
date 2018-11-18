import Scatter from "../src/models/Scatter";
import Settings from "../src/models/Settings";
import Keypair from "../src/models/Keypair";
import Keychain from "../src/models/Keychain";
import {Blockchains} from "../src/models/Blockchains";
import Identity from "../src/models/Identity";
import Account from "../src/models/Account";
import PluginRepository from '../src/plugins/PluginRepository';


export const mockNetworks = PluginRepository.signatureProviders().map(plugin => {
	return plugin.getEndorsedNetwork();
});

export const mockKeypair = Keypair.fromJson({
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

export const mockEosAccount = Account.fromJson({
	keypairUnique:mockKeypair.unique(),
	networkUnique:mockNetworks.find(x => x.blockchain === Blockchains.EOSIO).unique(),
	publicKey:mockKeypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key,
	name:'ramdeathtest',
	authority:'active'
});

export const mockTrxAccount = Account.fromJson({
	keypairUnique:mockKeypair.unique(),
	networkUnique:mockNetworks.find(x => x.blockchain === Blockchains.TRX).unique(),
	publicKey:mockKeypair.publicKeys.find(x => x.blockchain === Blockchains.TRX).key,
})

export const testScatter = async (options = {}) => {
	const withNetworks = options.hasOwnProperty('withNetworks') ? options.withNetworks : true;
	const withAccounts = options.hasOwnProperty('withAccounts') ? options.withAccounts : true;
	const withKeypairs = options.hasOwnProperty('withKeypairs') ? options.withKeypairs : true;


	const scatter = Scatter.fromJson({
		settings:Settings.fromJson({
			networks:withNetworks ? mockNetworks : [],
		}),
		keychain:Keychain.fromJson({
			keypairs:withKeypairs ? [mockKeypair] : [],
			accounts:withNetworks && withKeypairs && withAccounts ? [mockEosAccount, mockTrxAccount] : []
		})
	});

	const identity = Identity.placeholder();
	identity.initialize(scatter.hash);

	return scatter;
};