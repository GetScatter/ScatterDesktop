const {assert} = require('chai');
require('electron-mocha');
require('isomorphic-fetch');

const scatterMocker = require('../mock.scatter');
const PASSWORD = require('../mock.password');

const storage = require('../mock.storage');
const wallet = require('../../electron/services/wallet');

wallet.setStorage(storage);
wallet.init();

const sha256 = require('eosjs-ecc').sha256;
const elliptic = require('elliptic').ec;
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
			const privateKey = await wallet.getPrivateKey(keypair.id);
			assert(privateKey && Array.isArray(privateKey) && privateKey.length === 32, 'Private key is invalid');
			done();
		})
	})

	it('should be able to sign using a private key', done => {
		new Promise(async() => {
			const scatter = await wallet.getScatter();
			const keypair = scatter.keychain.keypairs[0];
			const privateKey = await wallet.getPrivateKey(keypair.id);
			const publicKey = keypair.publicKeys[0].key;

			const hash = sha256('test');
			// console.log('signing hash', hash);
			const signature = await wallet.sign(hash, publicKey, 'secp256k1');
			assert(signature, 'Signature was not provided')


			const ec = elliptic('secp256k1');
			const ecSig = new Signature(signature);
			const ecKey = ec.keyFromPrivate(privateKey);
			// const ecKey = ec.keyFromPrivate(Buffer.from(privateKey).toString('hex'), 'hex');
			console.log('verify', ecKey.verify(hash, signature));
			// assert(ec.verify(hash, ecSig, ecKey), 'Signature was incorrect');
			// console.log('signature', signature);
			done();
		})
	})


});