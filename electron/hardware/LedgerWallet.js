const bippath = require('bip32-path');

const Blockchains = {
	EOSIO:'eos',
	ETH:'eth',
}

const asn1 = require('asn1-ber');
const ecc = require('eosjs-ecc');
const { Serialize, Api } = require('eosjs');

const EthTx = require('ethereumjs-tx')
const Eth = require("@ledgerhq/hw-app-eth");

const Transport = require('@ledgerhq/hw-transport-node-hid').default;
let transport, openedTransport;

let setupPromise;
class LedgerTransport {
	static async setup(){
		transport = Transport.listen({next:({type, device}) => this[type](device)});
		const p = new Promise(r => setupPromise = r);
		setTimeout(() => {
			if(setupPromise) {
				setupPromise(false);
				setupPromise = null;
			}
		}, 3000);
		return p;
	}

	static async add(device){
		const {path} = device;
		openedTransport = await Transport.open(path);
		setTimeout(() => {
			setupPromise(true);
			setupPromise = null;
		}, 100);
	}

	static async remove(device){
		openedTransport = null;
		transport = Transport.listen({next:({type, device}) => this[type](device)});
	}
}







const LEDGER_PATHS = {
	[Blockchains.EOSIO]:(index = 0) => `44'/194'/0'/0/${index}`,
	[Blockchains.ETH]:(index = 0) => `44'/60'/0'/0/${index}`,
}

let encoderOptions, eosjsUtil;

class LedgerWallet {

	static async setup(){
		if(!(await LedgerTransport.setup())){
			return false;
		}

		const util = require('util');
		encoderOptions = {textEncoder:new util.TextEncoder(), textDecoder:new util.TextDecoder()};
		eosjsUtil = new Api(encoderOptions);

		return true;
	}

	constructor(blockchain){
		this.blockchain = blockchain;
		this.api = null;
	}

	static typeToInterface(blockchain){
		return new LedgerWallet(blockchain);
	};

	static availableBlockchains(){
		return [Blockchains.EOSIO, Blockchains.ETH];
	}

	open(){
		this.api = new LedgerAPI(this.blockchain);
		this.getPublicKey = this.api.getPublicKey;
		this.getAddress = this.api.getAddress;
		this.sign = this.api.signTransaction;
		this.canConnect = this.api.getAppConfiguration;
		this.setAddressIndex = this.api.setAddressIndex;
		return true;
	}

	close(){
		this.api = null;
		delete this.getPublicKey;
		delete this.getAddress;
		delete this.sign;
		delete this.canConnect;
		delete this.setAddressIndex;
		return true;
	}

}



const LEDGER_CODES = {
	CLA:0xD4,
	INFO:0x06,
	PK:0x02,
	SIGN:0x04,
	YES:0x01,
	NO:0x00,
	FIRST:0x00,
	MORE:0x80
}



class LedgerAPI {

	constructor(blockchain){
		this.blockchain = blockchain;
		this.addressIndex = 0;

		let scrambleKey;
		switch(this.blockchain){
			case Blockchains.EOSIO: scrambleKey = "e0s"; break;
			case Blockchains.ETH: scrambleKey = "eth"; break;
		}

		try {
			openedTransport.decorateAppAPIMethods(
				this,
				[ "getAddress", "getPublicKey", "signTransaction", "getAppConfiguration" ],
				scrambleKey
			);
		} catch(e){}
	}

	async setAddressIndex(index){
		if(!openedTransport) return;
		const prefix = this.api ? this.api : this;
		prefix.addressIndex = index;
	}

	async getAddress(index){
		if(!openedTransport) return;
		const prefix = this.api ? this.api : this;
		return prefix[`getAddress`+this.blockchain](index);
	}


	async getPublicKey(){
		if(!openedTransport) return;
		const prefix = this.api ? this.api : this;
		return prefix[`getPublicKey`+this.blockchain]();
	}

	async getAppConfiguration(){
		if(!openedTransport) return;
		const prefix = this.api ? this.api : this;
		return prefix[`getAppConfiguration`+this.blockchain]();
	}

	async signTransaction(publicKey, rawTxHex, abi, network){
		if(!openedTransport) return;
		const prefix = this.api ? this.api : this;
		return prefix[`signTransaction`+this.blockchain](publicKey, rawTxHex, abi, network);
	}







	/*************************************************/
	/*                 GET ADDRESS                   */
	/*************************************************/

	[`getAddress`+Blockchains.EOSIO](index, boolChaincode = false){
		const path = LEDGER_PATHS[this.blockchain](index.toString());
		const paths = bippath.fromString(path).toPathArray();
		let buffer = new Buffer(1 + paths.length * 4);
		buffer[0] = paths.length;
		paths.forEach((element, index) => buffer.writeUInt32BE(element, 1 + 4 * index));
		return openedTransport.send(0xD4, 0x02, 0x00, 0x00, buffer).then((response) => {
			let result = {};
			let publicKeyLength = response[0];
			let addressLength = response[1 + publicKeyLength];
			result.publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
			result.address = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii");
			if (boolChaincode) {
				result.chainCode = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString("hex");
			}
			return result.address;
		}).catch(err => {
			console.error('Ledger address error', err);
			return {error:err.message};
		});
	}

	[`getAddress`+Blockchains.ETH](index){
		return new Promise(async (resolve, reject) => {
			const path = LEDGER_PATHS[this.blockchain](index);
			const eth = new Eth(openedTransport);
			eth.getAddress(path, false)
				.then(response => {
					resolve(response.address);
				}).catch(err => {
				resolve({error:err});
			});
		})
	}



	/*************************************************/
	/*                 SIGN TRANSACTION              */
	/*************************************************/

	[`signTransaction`+Blockchains.EOSIO](publicKey, transaction, abi, network){

		const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
		const paths = bippath.fromString(path).toPathArray();
		let offset = 0;

		let b, rawTx;

		try {
			rawTx = serializeEosjs(network, transaction);
		} catch(e){
			console.error('e', e);
			return null;
		}

		const toSend = [];
		let response;
		while (offset !== rawTx.length) {
			const maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150;
			const chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
			const buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize);
			if (offset === 0) {
				buffer[0] = paths.length;
				paths.forEach((element, index) => buffer.writeUInt32BE(element, 1 + 4 * index));
				rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
			} else rawTx.copy(buffer, 0, offset, offset + chunkSize)
			toSend.push(buffer);
			offset += chunkSize;
		}

		return foreach(toSend, (data, i) =>
			openedTransport
				.send(LEDGER_CODES.CLA, LEDGER_CODES.SIGN, i === 0 ? LEDGER_CODES.FIRST : LEDGER_CODES.MORE, 0x00, data)
				.then(apduResponse => response = apduResponse)
		).then(() => {
			// PopupService.remove(popup);
			const v = response.slice(0, 1).toString("hex");
			const r = response.slice(1, 1 + 32).toString("hex");
			const s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
			return ecc.Signature.fromHex(v+r+s).toString();
		}).catch(err => {
			console.error('err', err);
			// PopupService.remove(popup);
			return null;
		})
	}

	async [`signTransaction`+Blockchains.ETH](publicKey, payload, abi, network){
		const transaction = payload.hasOwnProperty('transaction') ? payload.transaction : payload;
		const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
		const eth = new Eth(openedTransport);
		const popup = Popup.checkHardwareWalletScreen();
		// PopupService.push(popup);
		const chainIdHex = '0x'+(network.chainId.length === 1 ? '0'+ network.chainId : network.chainId).toString();
		const baseTransaction = Object.assign(transaction, {chainId:parseInt(network.chainId), r:'0x00', s:'0x00', v:chainIdHex});
		const rawTxHex = (new EthTx(baseTransaction)).serialize().toString('hex');
		return eth.signTransaction(path, rawTxHex).then(res => {
			// PopupService.remove(popup);
			const r = '0x' + res.r;
			const s = '0x' + res.s;
			const v = '0x' + res.v;
			const signed = Object.assign(baseTransaction, {r,s,v});
			return '0x'+(new EthTx(signed)).serialize().toString('hex');
		}).catch(err => {
			// PopupService.remove(popup);
			return null;
		})
	}








	/*************************************************/
	/*                 GET APP CONFIG                */
	/*************************************************/

	[`getAppConfiguration`+Blockchains.EOSIO](){
		return openedTransport.send(LEDGER_CODES.CLA, LEDGER_CODES.INFO, LEDGER_CODES.NO, LEDGER_CODES.NO).then(res => {
			return true;
		}).catch(err => {
			return `Open the ${this.blockchain.toUpperCase()} Ledger App before you continue.`;
		})
	}

	async [`getAppConfiguration`+Blockchains.ETH](){
		const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
		const eth = new Eth(openedTransport);
		return eth.getAppConfiguration().then(res => {
			return true;
		}).catch(err => {
			return `You must open the ${this.blockchain.toUpperCase()} Ledger App before you continue.`;
		})
	}





}








const serializeEosjs = (network, transaction) => {

	const types = {};
	eosjsUtil.abiTypes.forEach((value, key) => types[key] = value);
	eosjsUtil.transactionTypes.forEach((value, key) => types[key] = value);
	Object.keys(types).map(key => {
		types[key].prepare = raw => {
			const buf = new Serialize.SerialBuffer(encoderOptions);
			const aliasKey = (() => {
				switch(key){
					case 'account_name':
					case 'action_name':
					case 'permission_name':
						return 'name';
					default:
						return key;
				}
			})();
			types[aliasKey].serialize(buf, raw);
			return new Buffer(buf.asUint8Array());
		}

	})

	return Buffer.from(serialize(
		network.chainId,
		transaction.transaction.hasOwnProperty('serializedTransaction') ? transaction.transaction.parsed : transaction.transaction,
		types
	).toString('hex'), "hex");
}

const foreach = (arr, callback) => {
	function iterate(index, array, result) {
		if (index >= array.length) {
			return result;
		} return callback(array[index], index).then((res) => {
			result.push(res);
			return iterate(index + 1, array, result);
		});
	}
	return Promise.resolve().then(() => iterate(0, arr, []));
}

const serialize = (chainId, transaction, types) => {
	const writer = new asn1.BerWriter();

	encode(writer, types.checksum256.prepare(chainId));
	encode(writer, types.time_point_sec.prepare(transaction.expiration));
	encode(writer, types.uint16.prepare(transaction.ref_block_num));
	encode(writer, types.uint32.prepare(transaction.ref_block_prefix));
	encode(writer, types.uint8.prepare(0));
	encode(writer, types.uint8.prepare(transaction.max_cpu_usage_ms));
	encode(writer, types.uint8.prepare(transaction.delay_sec));
	encode(writer, types.uint8.prepare(0));
	encode(writer, types.uint8.prepare(transaction.actions.length));

	for (let i = 0; i < transaction.actions.length; i +=1) {
		const action = transaction.actions[i];

		encode(writer, types.name.prepare(action.account));
		encode(writer, types.name.prepare(action.name));
		encode(writer, types.uint8.prepare(action.authorization.length));

		for (let i = 0; i < action.authorization.length; i += 1) {
			const authorization = action.authorization[i];
			encode(writer, types.name.prepare(authorization.actor));
			encode(writer, types.name.prepare(authorization.permission));
		}

		if(action.data){
			const data = Buffer.from(action.data, 'hex');
			encode(writer, types.uint8.prepare(data.length));
			encode(writer, data);
		}
		else {
			try {
				encode(writer, types.uint8.prepare(0))
				encode(writer, new Buffer(0));
			} catch(e){
				//console.log('err', e);
			}
		}
	}

	encode(writer, types.uint8.prepare(0));
	encode(writer, types.checksum256.prepare(Buffer.alloc(32, 0).toString('hex')));

	return writer.buffer;
}

const encode = (writer, buffer) => writer.writeBuffer(buffer, asn1.Ber.OctetString);









module.exports = LedgerWallet;