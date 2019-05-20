import WindowService from '../../services/utility/WindowService'
import bippath from 'bip32-path';
import {Blockchains} from '../Blockchains';
import PopupService from '../../services/utility/PopupService';
import {Popup} from '../popups/Popup';

const fcbuffer = require('fcbuffer');
const asn1 = require('asn1-ber');
import Eos from 'eosjs';
import ecc from 'eosjs-ecc';

const EthTx = require('ethereumjs-tx')
import Eth from "@ledgerhq/hw-app-eth";
import {EXT_WALLET_TYPES} from "./ExternalWallet";
import StoreService from "../../services/utility/StoreService";

const throwErr = () => PopupService.push(Popup.prompt(
    'No Hardware Available',
    'You either need to plug in your Ledger, or select the appropriate App.'
));

export const LEDGER_PATHS = {
    [Blockchains.EOSIO]:(index = 0) => `44'/194'/0'/0/${index}`,
    [Blockchains.ETH]:(index = 0) => `44'/60'/0'/0/${index}`,
}

const getTransport = () => {
    if(!StoreService.get().state.hardware.hasOwnProperty(EXT_WALLET_TYPES.LEDGER)) return null;
    return StoreService.get().state.hardware[EXT_WALLET_TYPES.LEDGER];
}

export default class LedgerWallet {

    constructor(blockchain){
        this.blockchain = blockchain;
        this.api = null;
    }

    static typeToInterface(blockchain){
        return new LedgerWallet(blockchain);
    };

    availableBlockchains(){
        return [Blockchains.EOSIO, Blockchains.ETH];
    }

    open(){
        this.api = new LedgerAPI(this.blockchain);
	    this.getPublicKey = this.api.getPublicKey;
	    this.getAddress = this.api.getAddress;
	    this.sign = this.api.signTransaction;
	    this.canConnect = this.api.getAppConfiguration;
	    this.setAddressIndex = this.api.setAddressIndex;
    }

    close(){
        this.api = null;
	    delete this.getPublicKey;
	    delete this.getAddress;
	    delete this.sign;
	    delete this.canConnect;
	    delete this.setAddressIndex;
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
	        getTransport().decorateAppAPIMethods(
		        this,
		        [ "getAddress", "getPublicKey", "signTransaction", "getAppConfiguration" ],
		        scrambleKey
	        );
        } catch(e){}
    }

    async setAddressIndex(index){
    	if(!getTransport()) return;
        const prefix = this.api ? this.api : this;
        prefix.addressIndex = index;
    }

	async getAddress(delta = 0){
	    if(!getTransport()) return;
        const prefix = this.api ? this.api : this;
        return prefix[`getAddress`+this.blockchain](delta);
    }


	async getPublicKey(){
	    if(!getTransport()) return;
        const prefix = this.api ? this.api : this;
        return prefix[`getPublicKey`+this.blockchain]();
    }

	async getAppConfiguration(){
	    if(!getTransport()) return;
        const prefix = this.api ? this.api : this;
        return prefix[`getAppConfiguration`+this.blockchain]();
    }

    async signTransaction(publicKey, rawTxHex, abi, network){
	    if(!getTransport()) return;
        const prefix = this.api ? this.api : this;
        return prefix[`signTransaction`+this.blockchain](publicKey, rawTxHex, abi, network);
    }







    /*************************************************/
    /*                 GET ADDRESS                   */
    /*************************************************/

	[`getAddress`+Blockchains.EOSIO](delta = 0, boolChaincode = false){
		const path = LEDGER_PATHS[this.blockchain]((parseInt(this.addressIndex) + parseInt(delta)).toString());
		const paths = bippath.fromString(path).toPathArray();
		let buffer = new Buffer(1 + paths.length * 4);
		buffer[0] = paths.length;
		paths.forEach((element, index) => buffer.writeUInt32BE(element, 1 + 4 * index));
		return getTransport().send(0xD4, 0x02, 0x00, 0x00, buffer).then((response) => {
			let result = {};
			let publicKeyLength = response[0];
			let addressLength = response[1 + publicKeyLength];
			result.publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
			result.address = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii");
			if (boolChaincode) {
				result.chainCode = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString("hex");
			}
			return result.address;
		});
	}

	[`getAddress`+Blockchains.ETH](delta = 0){
		return new Promise(async (resolve, reject) => {
			const path = LEDGER_PATHS[this.blockchain](parseInt(this.addressIndex) + parseInt(delta));
			const eth = new Eth(getTransport());
			eth.getAddress(path, false)
				.then(response => {
					resolve(response.address);
				}).catch(err => {
				reject(err);
			});
		})
	}





    /*************************************************/
    /*                 GET PUBLIC KEY                */
    /*************************************************/

    [`getPublicKey`+Blockchains.EOSIO](){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
                const paths = bippath.fromString(path).toPathArray();
                const buffer = Buffer.alloc(1 + paths.length * 4);
                buffer[0] = paths.length;
                paths.forEach((element, index) => buffer.writeUInt32BE(element, 1 + 4 * index));

                const popup = Popup.checkHardwareWalletScreen();
                PopupService.push(popup);

                return getTransport()
                    .send(
                        LEDGER_CODES.CLA,
                        LEDGER_CODES.PK,
                        LEDGER_CODES.YES, // Trigger on-screen approval
                        LEDGER_CODES.NO, // chaincode
                        buffer
                    )
                    .then(response => {
                        PopupService.remove(popup);
                        const result = {};
                        const publicKeyLength = response[0];
                        const addressLength = response[1 + publicKeyLength];

                        resolve(response
                            .slice(
                                1 + publicKeyLength + 1,
                                1 + publicKeyLength + 1 + addressLength
                            )
                            .toString("ascii"));
                    }).catch(err => {
                        PopupService.remove(popup);
                        reject(err);
                    })
            }, 1);
        })
    }

    [`getPublicKey`+Blockchains.ETH](){
        return new Promise(async (resolve, reject) => {
            const popup = Popup.checkHardwareWalletScreen();
            PopupService.push(popup);
            const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
            const eth = new Eth(getTransport());
            eth.getAddress(path, true)
                .then(response => {
                    PopupService.remove(popup);
                    resolve(response.address);
                }).catch(err => {
                    PopupService.remove(popup);
                    reject(err);
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
		    const { fc } = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});
	    	rawTx = Buffer.from(serialize(
	    		network.chainId,
			    transaction.transaction.hasOwnProperty('serializedTransaction') ? transaction.transaction.parsed : transaction.transaction,
			    fc.types
		    ).toString('hex'), "hex");
	    } catch(e){
	    	console.log('e', e);
		    WindowService.flashWindow();
		    PopupService.push(Popup.prompt('Ledger Action Not Supported', 'Looks like this action isn\'t supported by the Ledger App'));
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

        const popup = Popup.checkHardwareWalletScreen();
        PopupService.push(popup);

        return foreach(toSend, (data, i) =>
	        getTransport()
                .send(LEDGER_CODES.CLA, LEDGER_CODES.SIGN, i === 0 ? LEDGER_CODES.FIRST : LEDGER_CODES.MORE, 0x00, data)
                .then(apduResponse => response = apduResponse)
        ).then(() => {
            PopupService.remove(popup);
            const v = response.slice(0, 1).toString("hex");
            const r = response.slice(1, 1 + 32).toString("hex");
            const s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return ecc.Signature.fromHex(v+r+s).toString();
        }).catch(err => {
        	console.error('err', err);
            PopupService.remove(popup);
            return null;
        })
    }

    async [`signTransaction`+Blockchains.ETH](publicKey, payload, abi, network){
        const transaction = payload.hasOwnProperty('transaction') ? payload.transaction : payload;
        const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
        const eth = new Eth(getTransport());
        const popup = Popup.checkHardwareWalletScreen();
        PopupService.push(popup);
        const chainIdHex = '0x'+(network.chainId.length === 1 ? '0'+ network.chainId : network.chainId).toString();
        const baseTransaction = Object.assign(transaction, {chainId:parseInt(network.chainId), r:'0x00', s:'0x00', v:chainIdHex});
        const rawTxHex = (new EthTx(baseTransaction)).serialize().toString('hex');
        return eth.signTransaction(path, rawTxHex).then(res => {
            PopupService.remove(popup);
            const r = '0x' + res.r;
            const s = '0x' + res.s;
            const v = '0x' + res.v;
            const signed = Object.assign(baseTransaction, {r,s,v});
            return '0x'+(new EthTx(signed)).serialize().toString('hex');
        }).catch(err => {
            PopupService.remove(popup);
            return null;
        })
    }








    /*************************************************/
    /*                 GET APP CONFIG                */
    /*************************************************/

    [`getAppConfiguration`+Blockchains.EOSIO](){
        return getTransport().send(LEDGER_CODES.CLA, LEDGER_CODES.INFO, LEDGER_CODES.NO, LEDGER_CODES.NO).then(res => {
            return true;
        }).catch(err => {
            return `Open the ${this.blockchain.toUpperCase()} Ledger App before you continue.`;
        })
    }

    async [`getAppConfiguration`+Blockchains.ETH](){
        const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
        const eth = new Eth(getTransport());
        return eth.getAppConfiguration().then(res => {
            return true;
        }).catch(err => {
            return `You must open the ${this.blockchain.toUpperCase()} Ledger App before you continue.`;
        })
    }





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

	encode(writer, fcbuffer.toBuffer(types.checksum256(), chainId));
	encode(writer, fcbuffer.toBuffer(types.time(), transaction.expiration));
	encode(writer, fcbuffer.toBuffer(types.uint16(), transaction.ref_block_num));
	encode(writer, fcbuffer.toBuffer(types.uint32(), transaction.ref_block_prefix));
	encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 0));
	encode(writer, fcbuffer.toBuffer(types.uint8(), transaction.max_cpu_usage_ms));
	encode(writer, fcbuffer.toBuffer(types.unsigned_int(), transaction.delay_sec));
	encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 0));
	encode(writer, fcbuffer.toBuffer(types.unsigned_int(), transaction.actions.length));

	for (let i = 0; i < transaction.actions.length; i +=1) {
		const action = transaction.actions[i];

		encode(writer, fcbuffer.toBuffer(types.account_name(), action.account));
		encode(writer, fcbuffer.toBuffer(types.action_name(), action.name));
		encode(writer, fcbuffer.toBuffer(types.unsigned_int(), action.authorization.length));

		for (let i = 0; i < action.authorization.length; i += 1) {
			const authorization = action.authorization[i];
			encode(writer, fcbuffer.toBuffer(types.account_name(), authorization.actor));
			encode(writer, fcbuffer.toBuffer(types.permission_name(), authorization.permission));
		}

		if(action.data){
			const data = Buffer.from(action.data, 'hex');
			encode(writer, fcbuffer.toBuffer(types.unsigned_int(), data.length));
			encode(writer, data);
		}
		else {
			try {
				encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 0))
				encode(writer, new Buffer(0));
			} catch(e){
				//console.log('err', e);
			}
		}
	}

	encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 0));
	encode(writer, fcbuffer.toBuffer(types.checksum256(), Buffer.alloc(32, 0)));

	return writer.buffer;
}

const encode = (writer, buffer) => {
    writer.writeBuffer(buffer, asn1.Ber.OctetString);
}