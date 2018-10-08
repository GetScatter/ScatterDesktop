import WindowService from '../../services/WindowService'
import * as Actions from '../../store/constants';
import {store} from '../../store/store';
import * as HARDWARE_STATES from './constants';
const {remote} = window.require('electron');
const Transport = remote.getGlobal('appShared').Transport.default;
import bippath from 'bip32-path';
import {EXT_WALLET_TYPES} from '../ExternalWallet';
import {Blockchains} from '../Blockchains';
import PopupService from '../../services/PopupService';
import {Popup} from '../popups/Popup';

const fcbuffer = require('fcbuffer');
const assert = require('assert');
const asn1 = require('asn1-ber');
import Eos from 'eosjs';

const EthTx = require('ethereumjs-tx')
import Eth from "@ledgerhq/hw-app-eth";

const throwErr = () => PopupService.push(Popup.prompt(
    'No Hardware Available',
    'You either need to plug in your Ledger, or select the appropriate App.',
    'exclamation-triangle',
    'Okay'
));

export const LEDGER_PATHS = {
    [Blockchains.EOSIO]:(index = 0) => `44'/194'/0'/0/${index}`,
    [Blockchains.ETH]:(index = 0) => `44'/60'/0'/0/${index}`,
}

export const cache = {};

export default class LedgerWallet {

    constructor(blockchain){
        this.blockchain = blockchain;
        this.api = null;
        this.init();
    }

    static typeToInterface(blockchain){
        if(!cache.hasOwnProperty(blockchain)) cache[blockchain] = new LedgerWallet(blockchain);
        return cache[blockchain];
    };

    async init(){
        this.getPublicKey = async () => { return throwErr(); };
        this.sign = async () => { return throwErr(); };
        this.canConnect = async () => { return 'Open and unlock your Ledger.'; };
        this.setAddressIndex = index => { return null; };
        this.availableBlockchains = () => [Blockchains.EOSIO, Blockchains.ETH];
        this.reset = () => this.init();

        const handleEvents = ({type, device}) => this[type](device);
        const setHardware = async () => {
            const hardware = {
                type:EXT_WALLET_TYPES.LEDGER,
                transport:null,
                subscriber:Transport.listen({ next:event => handleEvents(event) }),
                disconnect:async () => {
                    if(store.state.hardware.transport)
                        await store.state.hardware.transport.close();
                    if(store.state.hardware.subscriber)
                        await store.state.hardware.subscriber.unsubscribe();

                    store.dispatch(Actions.SET_HARDWARE, null);
                    delete cache[this.blockchain];
                }
            }

            return store.dispatch(Actions.SET_HARDWARE, hardware);
        }

        if(store.state.hardware && store.state.hardware.type !== EXT_WALLET_TYPES.LEDGER){
            await store.state.hardware.disconnect();
            return await setHardware();
        } else return await setHardware();
    }

    async add(device){
        const {path} = device;

        if(!store.state.hardware.transport) {
            const clone = Object.assign(store.state.hardware, {transport: await Transport.open(path)});
            await store.dispatch(Actions.SET_HARDWARE, clone);
        }

        this.api = new LedgerAPI(this.blockchain);
        this.getPublicKey = this.api.getPublicKey;
        this.sign = this.api.signTransaction;
        this.canConnect = this.api.getAppConfiguration;
        this.setAddressIndex = this.api.setAddressIndex;
    }

    async remove(device){
        await store.state.hardware.disconnect();
    }

}



const CODE = {
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
        store.state.hardware.transport.decorateAppAPIMethods(
            this,
            [ "getPublicKey", "signTransaction", "getAppConfiguration" ],
            scrambleKey
        );
    }

    setAddressIndex(index){
        const prefix = this.api ? this.api : this;
        prefix.addressIndex = index;
    }

    getPublicKey(){
        const prefix = this.api ? this.api : this;
        return prefix[`getPublicKey`+this.blockchain]();
    }

    getAppConfiguration(){
        const prefix = this.api ? this.api : this;
        return prefix[`getAppConfiguration`+this.blockchain]();
    }

    async signTransaction(publicKey, rawTxHex, abi, network){
        const prefix = this.api ? this.api : this;
        return prefix[`signTransaction`+this.blockchain](publicKey, rawTxHex, abi, network);
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
                paths.forEach((element, index) => {
                    buffer.writeUInt32BE(element, 1 + 4 * index);
                });

                const popup = Popup.checkHardwareWalletScreen();
                PopupService.push(popup);

                return store.state.hardware.transport
                    .send(
                        CODE.CLA,
                        CODE.PK,
                        CODE.YES, // Trigger on-screen approval
                        CODE.NO, // chaincode
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
            const eth = new Eth(store.state.hardware.transport);
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

    [`signTransaction`+Blockchains.EOSIO](publicKey, rawTxHex, abi, network){

        const transaction = rawTxHex.transaction;

        const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
        const paths = bippath.fromString(path).toPathArray();
        let offset = 0;

        const { fc } = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});
        let b;
        try {
            b = serialize(network.chainId, rawTxHex.transaction, fc.types).toString('hex');
        } catch(e){
            WindowService.flashWindow();
            PopupService.push(Popup.prompt('Ledger Action Not Supported', 'Looks like this action isn\'t supported by the Ledger App', 'exclamation-triangle', 'Okay'));
            return null;
        }
        const rawTx = Buffer.from(b, "hex");
        const toSend = [];
        let response;
        while (offset !== rawTx.length) {
            const maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150;
            const chunkSize =
                offset + maxChunkSize > rawTx.length
                    ? rawTx.length - offset
                    : maxChunkSize;
            const buffer = Buffer.alloc(
                offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize
            );
            if (offset === 0) {
                buffer[0] = paths.length;
                paths.forEach((element, index) => {
                    buffer.writeUInt32BE(element, 1 + 4 * index);
                });
                rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
            } else {
                rawTx.copy(buffer, 0, offset, offset + chunkSize);
            }
            toSend.push(buffer);
            offset += chunkSize;
        }

        const popup = Popup.checkHardwareWalletScreen();
        PopupService.push(popup);

        return foreach(toSend, (data, i) =>
            store.state.hardware.transport
                .send(CODE.CLA, CODE.SIGN, i === 0 ? CODE.FIRST : CODE.MORE, 0x00, data)
                .then(apduResponse => {
                    response = apduResponse;
                    return response;
                })
        ).then(() => {
            PopupService.remove(popup);
            const v = response.slice(0, 1).toString("hex");
            const r = response.slice(1, 1 + 32).toString("hex");
            const s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return v + r + s;
        }).catch(err => {
            PopupService.remove(popup);
            return null;
        })
    }

    async [`signTransaction`+Blockchains.ETH](publicKey, payload, abi, network){
        const {transaction} = payload;
        const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
        const eth = new Eth(store.state.hardware.transport);
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
        if(!store.state.hardware) return 'Hardware wallet disconnected';

        return store.state.hardware.transport.send(CODE.CLA, CODE.INFO, CODE.NO, CODE.NO).then(res => {
            return true;
        }).catch(err => {
            delete cache[this.blockchain];
            return `You must open the ${this.blockchain.toUpperCase()} Ledger App in order to use it with Scatter`;
        })
    }

    async [`getAppConfiguration`+Blockchains.ETH](){
        const path = LEDGER_PATHS[this.blockchain](this.addressIndex);
        const eth = new Eth(store.state.hardware.transport);
        return eth.getAppConfiguration().then(res => {
            return true;
        }).catch(err => {
            delete cache[this.blockchain];
            return `You must open the ${this.blockchain.toUpperCase()} Ledger App in order to use it with Scatter`;
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
    encode(
        writer,
        fcbuffer.toBuffer(types.uint32(), transaction.ref_block_prefix)
    );
    encode(
        writer,
        fcbuffer.toBuffer(types.unsigned_int(), 0) //transaction.net_usage_words
    );
    encode(
        writer,
        fcbuffer.toBuffer(types.uint8(), transaction.max_cpu_usage_ms)
    );
    encode(
        writer,
        fcbuffer.toBuffer(types.unsigned_int(), transaction.delay_sec)
    );

    assert(transaction.context_free_actions.length === 0);
    encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 0));

    assert(transaction.actions.length === 1);
    encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 1));

    const action = transaction.actions[0];

    encode(writer, fcbuffer.toBuffer(types.account_name(), action.account));
    encode(writer, fcbuffer.toBuffer(types.action_name(), action.name));

    encode(
        writer,
        fcbuffer.toBuffer(types.unsigned_int(), action.authorization.length)
    );
    for (let i = 0; i < action.authorization.length; i += 1) {
        const authorization = action.authorization[i];

        encode(
            writer,
            fcbuffer.toBuffer(types.account_name(), authorization.actor)
        );
        encode(
            writer,
            fcbuffer.toBuffer(types.permission_name(), authorization.permission)
        );
    }

    const data = Buffer.from(action.data, 'hex');
    encode(writer, fcbuffer.toBuffer(types.unsigned_int(), data.length));
    encode(writer, data);

    assert(writer, transaction.transaction_extensions.length === 0);
    encode(writer, fcbuffer.toBuffer(types.unsigned_int(), 0));
    encode(writer, fcbuffer.toBuffer(types.checksum256(), Buffer.alloc(32, 0)));

    return writer.buffer;
}

const encode = (writer, buffer) => {
    writer.writeBuffer(buffer, asn1.Ber.OctetString);
}