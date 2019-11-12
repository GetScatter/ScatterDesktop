const {assert} = require('chai');
require('electron-mocha');
require('isomorphic-fetch');

const scatterMocker = require('../mock.scatter');
const PASSWORD = require('../mock.password');

const storage = require('../mock.storage');
const wallet = require('../../electron/services/wallet');

wallet.setStorage(storage);
wallet.init();

const ecc = require('eosjs-ecc');
const Signature = require('elliptic/lib/elliptic/ec/signature');


describe('wallet', () => {

	it('should not have a wallet', done => {
		new Promise(async() => {
			assert(!wallet.exists(), 'Wallet exists in [wallet]');
			assert(!storage.getScatter(), 'Wallet exists in [storage]');
			done();
		})
	})

	it('should set a wallet password', done => {
		new Promise(async() => {
			assert(wallet.getSeed() === undefined, 'Seed was already set');
			await wallet.unlock(PASSWORD, true);
			console.log('seed', wallet.getSeed());
			assert(wallet.getSeed(), 'Seed was not set');
			done();
		})
	})

	it('should set an instance of a mock wallet', done => {
		new Promise(async() => {
			const scatter = await scatterMocker();
			await wallet.updateScatter(scatter);
			assert(await wallet.getScatter(), 'Wallet was not set');
			done();
		})
	})

	it('should be able to get a private key', done => {
		new Promise(async() => {
			const scatter = await wallet.getScatter();
			const keypair = scatter.keychain.keypairs[0];
			const privateKey = await wallet.getPrivateKey(keypair.id, 'eos');
			console.log('privateKey', privateKey);
			assert(privateKey && typeof privateKey === 'string' && privateKey.length === 51, 'Private key is invalid');
			done();
		})
	})

	it('should be able to get an identity private key', done => {
		new Promise(async() => {
			const scatter = await wallet.getScatter();
			const keypair = await wallet.getKeypair(scatter.keychain.identities[0].publicKey, 'eos');
			const privateKey = await wallet.getPrivateKey(keypair.id, 'eos');
			console.log('privateKey', privateKey);
			assert(privateKey && typeof privateKey === 'string' && privateKey.length === 51, 'Private key is invalid');
			done();
		})
	})

	// it('should be able to sign using a private key', done => {
	// 	new Promise(async() => {
	// 		const scatter = await wallet.getScatter();
	// 		const keypair = scatter.keychain.keypairs[0];
	// 		const publicKey = keypair.publicKeys[0].key;
	//
	// 		const hash = ecc.sha256('test');
	//
	// 		const signature = await wallet.sign(
	// 			{blockchain:'eos'},
	// 			publicKey,
	// 			{data:hash},
	// 			true,
	// 			true
	// 		)
	//
	// 		assert(ecc.verifyHash(signature, hash, publicKey), 'Signature could not be verified');
	// 		done();
	// 	})
	// })
	//
	// it('should be able to lock', done => {
	// 	new Promise(async() => {
	// 		await wallet.lock();
	// 		assert(!wallet.getSeed(), 'Wallet was not locked')
	// 		done();
	// 	})
	// })
	//
	// it('should be able to unlock again', done => {
	// 	new Promise(async() => {
	// 		await wallet.unlock(PASSWORD);
	// 		assert(wallet.getSeed(), 'Wallet was not unlocked [seed]')
	// 		assert(wallet.getScatter(), 'Wallet was not unlocked [data]')
	// 		done();
	// 	})
	// })


});
