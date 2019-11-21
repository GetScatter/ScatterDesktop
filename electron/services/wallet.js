const LowLevelWindowService = require("./windows");
const {ipcMain} = require("electron");
const prompt = require('./prompt');

const bip39 = require('bip39');
const scrypt = require('scrypt-async');
const AES = require("aes-oop").default;
const Scatter = require('@walletpack/core/models/Scatter').default;
const Error = require('@walletpack/core/models/errors/Error').default;
const IdGenerator = require('@walletpack/core/util/IdGenerator').default;
const Hasher = require('@walletpack/core/util/Hasher').default;

require('@walletpack/core/services/utility/Framework').default.init({
	getVersion:() => require('../../package').version,
});

const plugins = {
	eos:new (require('@walletpack/eosio').default)(),
	trx:new (require('@walletpack/tron').default)(),
	btc:new (require('@walletpack/bitcoin').default)(),
	eth:new (require('@walletpack/ethereum').default)()
}

plugins.trx.init();

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

const isEncrypted = x => !x ? false : x.toString().indexOf('"iv":') > -1;
const isUnlocked = () => !!seed && !isEncrypted(scatter);

const updateScatter = async (_s) => {
	if(exists() && !isUnlocked()) return;

	_s.keychain.keypairs.map(x => {
		if(!isEncrypted(x.privateKey)){
			x.privateKey = AES.encrypt(Buffer.from(x.privateKey), seed);
		}
	})

	_s.keychain.identities.map(x => {
		if(!isEncrypted(x.privateKey)){
			x.privateKey = AES.encrypt(Buffer.from(x.privateKey), seed);
		}
	})

	_s.keychain.cards.map(x => {
		if(!isEncrypted(x.secure)){
			x.secure = AES.encrypt(x.secure, seed);
		}
	});

	scatter = Scatter.fromJson(JSON.parse(JSON.stringify(_s)));

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

	await storage.reencryptOptionals(oldSeed, newSeed);
	return true;
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
	if(!process.env.TESTING && !await prompt.accepted(
		`Exporting a private key.`,
		`Something has requested a private key. Are you currently exporting the private key from Scatter?`
	)) return null;

	return getPrivateKeyForSigning(keypairId, blockchain);
}

const getPrivateKeyForSigning = async (keypairId, blockchain) => {
	let keypair = getKeypairByID(keypairId);
	if(!keypair) return;

	const encryptedKey = JSON.parse(JSON.stringify(keypair.privateKey));
	let decryptedKey = AES.decrypt(encryptedKey, seed);

	// Legacy scatters held private keys for identities in hex format already.
	if(typeof decryptedKey === 'string') return decryptedKey;

	return plugins[blockchain].bufferToHexPrivate(decryptedKey);
}

const getKeypair = (publicKey, blockchain) => {
	const keypair = scatter.keychain.keypairs
		.filter(x => x.blockchains.includes(blockchain))
		.find(x => x.publicKeys.find(k => k.key === publicKey));
	if(keypair) return JSON.parse(JSON.stringify(keypair));

	const identity = scatter.keychain.identities.find(x => x.publicKey === publicKey);
	if(identity) return {
		id:identity.id,
		name:identity.name,
		publicKeys:[{blockchain:'eos', key:publicKey}],
		privateKey:identity.privateKey
	}

	return null;
}

const getKeypairByID = id => {
	const keypair = scatter.keychain.keypairs.find(x => x.id === id);
	if(keypair) return JSON.parse(JSON.stringify(keypair));

	const identity = scatter.keychain.identities.find(x => x.id === id);
	if(identity) return {
		id:identity.id,
		name:identity.name,
		publicKeys:[{blockchain:'eos', key:identity.publicKey}],
		privateKey:identity.privateKey
	}

	return null;
}

const lock = () => {
	seed = null;
	scatter = storage.getScatter();
	return true;
}

const forceSalt = async _salt => {
	await storage.setSalt(_salt);
	salt = _salt;
	return true;
}

const unlock = async (password, isNew = false, _salt = null) => {
	if(isUnlocked()) return getScatter();

	try {
		if(_salt) await forceSalt(_salt);
		if(!salt) await forceSalt(Hasher.unsaltedQuickHash(IdGenerator.text(32)));

		seed = await passwordToSeed(password);

		if(!isNew) {
			let decrypted = AES.decrypt(scatter, seed);
			if (!decrypted.hasOwnProperty('keychain')) return false;
			decrypted = Scatter.fromJson(decrypted);
			decrypted.decrypt(seed);
			scatter = decrypted;
		}

		if(!process.env.TESTING) setTimeout(() => {
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

const sign = async (network, publicKey, payload, arbitrary = false, isHash = false) => {
	try {
		const plugin = plugins[network.blockchain];
		if(!plugin) return false;

		const keypair = getKeypair(publicKey, network.blockchain);
		if(!keypair) return Error.signatureError('no_keypair', 'This keypair could not be found');

		if(keypair.external) return signWithHardware(keypair, network, publicKey, payload, arbitrary, isHash);

		const privateKey = await getPrivateKeyForSigning(keypair.id, network.blockchain);

		return plugin.signer(payload, publicKey, arbitrary, isHash, privateKey);
	} catch(e){
		console.error('Signing Error!', e);
		return Error.signatureError('sign_err', 'There was an error signing this transaction.');
	}
};





const LedgerWallet = require("../hardware/LedgerWallet");

const hardwareTypes = [
	{name:'Ledger', blockchains:LedgerWallet.availableBlockchains()},
]

const getHardwareKey = async (blockchain, index) => {
	if(!(await LedgerWallet.setup()))
		return {error:`Can't connect to ledger device`};


	const ledger = new LedgerWallet(blockchain);
	await ledger.open();

	return ledger.getAddress(index)
};

const signWithHardware = async (keypair, network, publicKey, payload, arbitrary = false, isHash = false) => {
	const {blockchain} = network;

	if(!(await LedgerWallet.setup()))
		return {error:`Can't connect to ledger device`};


	const ledger = new LedgerWallet(blockchain);
	await ledger.open();

	return new Promise(r => setTimeout(async () => {
		if(!(await ledger.canConnect())) return {error:`cant_connect`};
		ledger.setAddressIndex(keypair.external.addressIndex);
		r(await ledger.sign(publicKey, payload, payload.abi, network));
	}, 100));
}

const encrypt = data => AES.encrypt(data, seed);
const decrypt = data => AES.decrypt(data, seed);

const getSeed = () => seed;

const availableBlockchains = () => ({
	EOSIO:'eos',
	ETH:'eth',
	TRX:'trx',
	BTC:'btc',
});

const EXPORTS = {
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
	getHardwareKey,
	encrypt,
	decrypt,

	getSeed,
	availableBlockchains,

}

if(process.env.TESTING){
	EXPORTS.getKeypair = getKeypair;
	EXPORTS.getKeypairByID = getKeypairByID;
}

module.exports = EXPORTS;
