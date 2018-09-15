import * as ACTIONS from '../../store/constants';
import {store} from '../../store/store';
import * as HARDWARE_STATES from './constants';
const {remote} = window.require('electron');
const Transport = remote.getGlobal('appShared').Transport.default;
import bippath from 'bip32-path';
import {ExternalWalletInterface} from '../ExternalWallet';
import {Blockchains} from '../Blockchains';
import PopupService from '../../services/PopupService';
import {Popup} from '../popups/Popup';


const fcbuffer = require('fcbuffer');
const assert = require('assert');
const asn1 = require('asn1-ber');
import Eos from 'eosjs';


export const LEDGER_PATHS = {
    [Blockchains.EOSIO]:"44'/194'/0'/0/0",
}

export default class LedgerWallet {

    constructor(blockchain){
        this.blockchain = blockchain;
        this.init();
    }

    showsKeypairOnScreen(){
        return true;
    }

    static typeToInterface(blockchain){
        return new LedgerWallet(blockchain);
    };

    init(){
        const handleEvents = ({type, device}) => this[type](device);
        Transport.listen({ next:event => handleEvents(event) });
    }

    async add(device){
        store.dispatch(ACTIONS.SET_HW_STATE, HARDWARE_STATES.CONNECTED);

        const {path} = device;
        this.transport = await Transport.open(path);
        this.api = new LedgerAPI(this.transport, this.blockchain);
        this.getPublicKey = this.api.getPublicKey;
        this.sign = this.api.signTransaction;

        // api.getAppConfiguration().then(x => {
        //     console.log('x', x);
        // });
        //
        // api.getPublicKey(LEDGER_PATHS[this.blockchain], true).then(res => {
        //     console.log('pk res', res);
        // });
        //
        // console.log('add', device, transport)
    }

    remove(device){
        store.dispatch(ACTIONS.SET_HW_STATE, HARDWARE_STATES.DISCONNECTED);

        const {path} = device;

        console.log('remove', device)
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

    constructor(transport, blockchain){
        this.transport = transport;
        this.blockchain = blockchain;

        transport.decorateAppAPIMethods(
            this,
            [
                "getPublicKey",
                "signTransaction",
                "getAppConfiguration"
            ],
            "e0s"
        );
    }

    getPublicKey(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {

                const path = LEDGER_PATHS[this.blockchain];
                console.log('path', path, this.blockchain);
                const paths = bippath.fromString(path).toPathArray();
                const buffer = Buffer.alloc(1 + paths.length * 4);
                buffer[0] = paths.length;
                paths.forEach((element, index) => {
                    buffer.writeUInt32BE(element, 1 + 4 * index);
                });

                const popup = Popup.checkHardwareWalletScreen();
                PopupService.push(popup);

                return this.transport
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

    signTransaction(publicKey, rawTxHex, abi, network){

        console.log('signTransaction', publicKey, rawTxHex, abi, network);
        const transaction = rawTxHex.transaction;

        const path = LEDGER_PATHS[this.blockchain];
        const paths = bippath.fromString(path).toPathArray();
        let offset = 0;

        const { fc } = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});
        const b = serialize(network.chainId, rawTxHex.transaction, fc.types).toString('hex');
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
            this.transport
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
            return err;
        })



    }

    getAppConfiguration(){
        return this.transport.send(CODE.CLA, CODE.INFO, CODE.NO, CODE.NO).then(res => {
            return res.slice(1,4).join('.');
        });
    }

}

export const foreach = (arr, callback) => {
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
    console.log('chainId', chainId, transaction);
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
