const ecc = require('eosjs-ecc');

module.exports = async () => {
	return new Promise(async resolve => {
		require('@walletpack/core/services/utility/Framework').default.init({
			getVersion:() => '1.0.0',
		});

		require('@walletpack/core/models/Scatter').default.create().then(async fakeScatter => {
			fakeScatter.onboarded = true;

			const network = require('@walletpack/core/models/Network').default.fromJson({
				blockchain:'eos',
				name:'EOS Mainnet',
				host:'nodes.get-scatter.com',
				port:443,
				protocol:'https',
				chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
			});

			const privateKey = await require('@walletpack/core/util/Crypto').default.generatePrivateKey();
			const eosPublicKey = ecc.PrivateKey(privateKey).toPublic().toString('EOS');

			const keypair = require('@walletpack/core/models/Keypair').default.fromJson({
				name:'testkey',
				privateKey:privateKey,
				publicKeys:[{key:eosPublicKey, blockchain:'eos'}],
				blockchains:['eos']
			});

			const account = require('@walletpack/core/models/Account').default.fromJson({
				name:'testaccount',
				authority:'active',
				publicKey:keypair.publicKeys[0].key,
				keypairUnique:keypair.unique(),
				networkUnique:network.unique(),
			})

			fakeScatter.settings.networks.push(network);
			fakeScatter.keychain.keypairs.push(keypair);
			fakeScatter.keychain.accounts.push(account);


			resolve(fakeScatter);
		});
	})
}