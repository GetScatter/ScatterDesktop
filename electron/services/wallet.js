

const LowLevelWindowService = require("./windows");

const {ipcMain} = require("electron");

const bip39 = require('bip39');
const scrypt = require('scrypt-async');
const AES = require("aes-oop").default;
const path = require('path')
const Error = require('@walletpack/core/models/errors/Error').default;
const IdGenerator = require('@walletpack/core/util/IdGenerator').default;
const Hasher = require('@walletpack/core/util/Hasher').default;

// TODO: Changing to curve-based
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


let seed, salt, scatter, storage;

// Storage is not set by default, this allows
// changing the storage mechanism for testing purposes.
const setStorage = _s => storage = _s;

const init = () => {
	scatter = storage.getScatter();
	salt = storage.getSalt();
	storage.getSeedSetter(() => seed);
}


const setScatter = (_s) => scatter = JSON.parse(JSON.stringify(_s));
const getScatter = () => scatter ? JSON.parse(JSON.stringify(scatter)) : null;

const exists = () => !!scatter;

const isEncrypted = x => x.toString().indexOf('"iv":') > -1;
const isUnlocked = () => !!seed && !isEncrypted(scatter);

const updateScatter = async (_s) => {
	if(exists() && !isUnlocked()) return;

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

const verifyPassword = async password => {
	const hash = await passwordToSeed(password);
	return seed === hash;
}

const changePassword = async (newPassword) => {
	const oldSalt = storage.getSalt();
	const oldSeed = seed;

	const newSalt = Hasher.unsaltedQuickHash(IdGenerator.text(32));
	await storage.setSalt(newSalt);

	const newSeed = await passwordToSeed(newPassword);
	seed = newSeed;

	const clone = JSON.parse(JSON.stringify(scatter));
	clone.keychain.keypairs.map(keypair => {
		keypair.privateKey = AES.decrypt(keypair.privateKey, oldSeed);
		keypair.privateKey = AES.encrypt(keypair.privateKey, newSeed);
	});
	clone.keychain.identities.map(id => {
		id.privateKey = AES.decrypt(id.privateKey, oldSeed);
		id.privateKey = AES.encrypt(id.privateKey, newSeed);
	});

	await updateScatter(clone);
	return true;

	// TODO:! need to reseed other storages as well
	// await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	// await StorageService.swapHistory(StoreService.get().state.history);
	// await StorageService.setTranslation(Locale.fromJson(StoreService.get().state.language.json));
	// StoreService.get().dispatch(Actions.LOAD_HISTORY);
	// StoreService.get().dispatch(UIActions.LOAD_LANGUAGE);
}




const hashPassword = (password) => {
	return new Promise(async resolve => {
		salt = storage.getSalt();
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


const reloading = () => {
	if(seed) seed = null;
	if(scatter) scatter = storage.getScatter();
};

const getPrivateKey = async (keypairId, blockchain) => {
	let keypair = scatter.keychain.keypairs.find(x => x.id === keypairId);
	if(!keypair) return;

	const encryptedKey = JSON.parse(JSON.stringify(keypair.privateKey));
	const decryptedKey = AES.decrypt(encryptedKey, seed);

	return plugins[blockchain].bufferToHexPrivate(decryptedKey);
}

const lock = () => {
	seed = null;
	scatter = storage.getScatter();
	return true;
}

const unlock = async (password, isNew = false, salt = null) => {
	if(isUnlocked()) return getScatter();

	try {
		if(salt) await storage.setSalt(salt);
		seed = await passwordToSeed(password);
		if(!isNew) {
			const decrypted = AES.decrypt(scatter, seed);
			if (!decrypted.hasOwnProperty('keychain')) return false;
			decrypted.keychain = AES.decrypt(decrypted.keychain, seed);
			scatter = decrypted;
		} else {
			if(!salt) await storage.setSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));
		}

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
		if(!plugin) return false;

		const keypair = scatter.keychain.keypairs.find(x => x.publicKeys.find(k => k.key === publicKey))
		if(!keypair) return Error.signatureError('no_keypair', 'This keypair could not be found');

		if(keypair.external) return signWithHardware(keypair, network, publicKey, payload, arbitrary, isHash);

		let privateKey = AES.decrypt(keypair.privateKey, seed);
		if(!privateKey) return Error.signatureError('sign_err', 'Could not decode private key');
		if(typeof privateKey === 'object' && privateKey.hasOwnProperty('data')) privateKey = privateKey.data;

		console.log('payload?', payload, publicKey, arbitrary, isHash);
		return plugin.signer(payload, publicKey, arbitrary, isHash, privateKey);
	} catch(e){
		console.error('Signing Error!', e);
		return Error.signatureError('sign_err', 'There was an error signing this transaction.');
	}
};

ipcMain.on('load', (e) => {
	e.sender.send('loaded', getScatter());
})





const LedgerWallet = require("../hardware/LedgerWallet");

const hardwareTypes = [
	{name:'Ledger', blockchains:LedgerWallet.availableBlockchains()},
]

const getHardwareKeys = async ({external, indexes}) => {
	return new Promise(async resolve => {
		const {blockchain} = external;

		await LedgerWallet.setup();
		const ledger = new LedgerWallet(blockchain);
		await ledger.open();

		let result = [];
		await new Promise(r => setTimeout(async () => {
			if(!ledger.canConnect()) return {error:`cant_connect`};

			indexes = indexes.sort();

			for(let i = 0; i < indexes.length; i++){
				const key = await ledger.getAddress(indexes[i]);
				result.push({key, index:indexes[i]});
			}

			return r(true);
		}, 100));

		return resolve(result);
	})
};

const signWithHardware = async (keypair, network, publicKey, payload, arbitrary = false, isHash = false) => {
	const {blockchain} = network;

	await LedgerWallet.setup();
	const ledger = new LedgerWallet(blockchain);
	await ledger.open();

	return new Promise(r => setTimeout(async () => {
		// TODO: fix me
		// if(!ledger.canConnect()) return {error:`cant_connect`};
		ledger.setAddressIndex(keypair.external.addressIndex);
		r(await ledger.sign(publicKey, payload, payload.abi, network));
	}, 100));
}

const encrypt = data => AES.encrypt(data, seed);
const decrypt = data => AES.decrypt(data, seed);

const getSeed = () => seed;

module.exports = {
	setStorage,
	init,
	exists,
	updateScatter,
	setScatter,
	getScatter,
	sign,
	getPrivateKey,
	reloading,
	isUnlocked,
	unlock,
	lock,
	verifyPassword,
	changePassword,
	hardwareTypes,
	getHardwareKeys,
	encrypt,
	decrypt,

	getSeed,
}