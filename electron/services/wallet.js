const LowLevelWindowService = require("./windows");

const {ipcMain} = require("electron");

const bip39 = require('bip39');
const scrypt = require('scrypt-async');
const AES = require("aes-oop").default;
const storage = require('./storage')
const path = require('path')
const Scatter = require('@walletpack/core/models/Scatter').default;
const PluginRepository = require('@walletpack/core/plugins/PluginRepository').default;
const Error = require('@walletpack/core/models/errors/Error').default;


const EOSIO = require('@walletpack/eosio').default;
const TRON = require('@walletpack/tron').default;
const BITCOIN = require('@walletpack/bitcoin').default;
const ETHEREUM = require('@walletpack/ethereum').default;

const plugins = {
	eos:new EOSIO(),
	trx:new TRON(),
	btc:new BITCOIN(),
	eth:new ETHEREUM()
}


let seed, salt;
let scatter = storage.getScatter();

salt = storage.getSalt();

const setScatter = (_s) => scatter = JSON.parse(JSON.stringify(_s));
const getScatter = () => JSON.parse(JSON.stringify(scatter));

const updateScatter = async (_s) => {
	const isEncrypted = x => x.toString().indexOf('"iv":') > -1

	_s.keychain.keypairs.map(x => {
		if(!isEncrypted(x.privateKey)){
			x.privateKey = AES.encrypt(x.privateKey, seed);
		}
	})

	_s.keychain.identities.map(x => {
		if(!isEncrypted(x.privateKey)){
			x.privateKey = AES.encrypt(x.privateKey, seed);
		}
	})

	_s.keychain.cards.map(x => {
		if(!isEncrypted(x.secure)){
			x.secure = AES.encrypt(x.secure, seed);
		}
	});

	scatter = JSON.parse(JSON.stringify(_s));

	_s.keychain = AES.encrypt(_s.keychain, seed);
	await storage.setScatter(AES.encrypt(_s, seed));
	return getScatter();
}




const hashPassword = (password) => {
	return new Promise(async resolve => {
		scrypt(password, salt, {
			N: 16384,
			r: 8,
			p: 1,
			dkLen: 16,
			encoding: 'hex'
		}, (derivedKey) => {
			resolve(derivedKey);
		})
	});
}

const passwordToSeed = async password => {
	const hash = await hashPassword(password);
	let mnemonic = bip39.entropyToMnemonic(hash);
	return bip39.mnemonicToSeedHex(mnemonic);
}




const unlock = async password => {
	try {
		seed = await passwordToSeed(password);
		const decrypted = AES.decrypt(scatter, seed);
		if(!decrypted.hasOwnProperty('keychain')) return false;
		decrypted.keychain = AES.decrypt(decrypted.keychain, seed);
		scatter = decrypted;

		setTimeout(() => {
			LowLevelWindowService.queuePopup();
		}, 1000);

		return getScatter();
	} catch(e){
		console.error('decrypt error', e);
		seed = null;
		scatter = storage.getScatter();
		return false;
	}
}

const sign = (network, publicKey, payload, arbitrary = false, isHash = false) => {
	try {

		const plugin = plugins[network.blockchain];
		console.log('plugin', plugin, network.blockchain);
		if(!plugin) return false;

		const keypair = scatter.keychain.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey))
		console.log('keypair', !!keypair);
		if(!keypair) return Error.signatureError('no_keypair', 'This keypair could not be found');

		let privateKey = AES.decrypt(keypair.privateKey, seed);
		if(!privateKey) return Error.signatureError('sign_err', 'Could not decode private key');
		if(typeof privateKey === 'object' && privateKey.hasOwnProperty('data')) privateKey = privateKey.data;


		// TODO: eosjs-ecc needs an update with a patch for ripemd, for now edit 'eosjs-ecc/hash.js'
		// https://github.com/EOSIO/eosjs-ecc/pull/56/commits/a4f409927bc84022d5fc9811dfccec85b7ffbb2b
		return plugin.signer(payload, publicKey, arbitrary, isHash, privateKey);
	} catch(e){
		console.error('Signing Error!', e);
		return Error.signatureError('sign_err', 'There was an error signing this transaction.');
	}
};

ipcMain.on('load', (e) => {
	e.sender.send('loaded', getScatter());
})



module.exports = {
	updateScatter,
	setScatter,
	getScatter,
	sign,
	unlock,
}