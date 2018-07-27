import Plugin from '../Plugin';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'

const EthTx = require('ethereumjs-tx')
const ethUtil = require('ethereumjs-util');
import Web3 from 'web3';

import IdGenerator from '../../util/IdGenerator';
import KeyPairService from '../../services/KeyPairService';
import ObjectHelpers from '../../util/ObjectHelpers'
//
//
//
// let messageSender = new WeakMap();
// let throwIfNoIdentity = new WeakMap();
// let network = new WeakMap();
const web3 = new Web3();
//
// const proxy = (dummy, handler) => new Proxy(dummy, handler);
//
// class ScatterEthereumWallet {
//     constructor(){
//         this.getAccounts = this.getAccounts.bind(this);
//         this.signTransaction = this.signTransaction.bind(this);
//     }
//
//     async getAccounts(callback) {
//         const result = await messageSender(NetworkMessageTypes.IDENTITY_FROM_PERMISSIONS);
//         const accounts = !result ? [] : result.accounts
//             .filter(account => account.blockchain === Blockchains.ETH)
//             .map(account => account.publicKey);
//
//         callback(null, accounts);
//         return accounts;
//     }
//
//     async signTransaction(transaction){
//         if(!network) throw Error.noNetwork();
//
//         // Basic settings
//         if (transaction.gas !== undefined) transaction.gasLimit = transaction.gas;
//         transaction.value = transaction.value || '0x00';
//         if(transaction.hasOwnProperty('data')) transaction.data = ethUtil.addHexPrefix(transaction.data);
//
//         // Required Fields
//         const requiredFields = IdentityRequiredFields.fromJson(transaction.hasOwnProperty('requiredFields') ? transaction.requiredFields : {});
//         if(!requiredFields.isValid()) throw Error.malformedRequiredFields();
//
//         // Contract ABI
//         const abi = transaction.hasOwnProperty('abi') ? transaction.abi : null;
//         if(!abi && transaction.hasOwnProperty('data'))
//             throw Error.signatureError('no_abi', 'You must provide a JSON ABI along with your transaction so that users can read the contract');
//
//         // Messages for display
//         transaction.messages = await messagesBuilder(transaction, abi);
//
//         // Signature Request Popup
//         const payload = Object.assign(transaction, { domain:strippedHost(), network, requiredFields });
//         const {signatures, returnedFields} = await messageSender(NetworkMessageTypes.REQUEST_SIGNATURE, payload);
//
//         if(transaction.hasOwnProperty('fieldsCallback'))
//             transaction.fieldsCallback(returnedFields);
//
//         return signatures[0];
//     }
// }
//
//


const toBuffer = key => ethUtil.toBuffer(ethUtil.addHexPrefix(key));

export default class ETH extends Plugin {

    constructor(){ super(Blockchains.ETH, PluginTypes.BLOCKCHAIN_SUPPORT) }
    accountFormatter(account){ return `${account.publicKey}` }
    returnableAccount(account){ return { address:account.publicKey, blockchain:Blockchains.ETH }}

    async getEndorsedNetwork(){
        return new Promise((resolve, reject) => {
            resolve(new Network('ETH Mainnet', 'https', 'ethereum.com', 8080, Blockchains.ETH, '1'));
        });
    }

    async isEndorsedNetwork(network){
        const endorsedNetwork = await this.getEndorsedNetwork();
        return network.hostport() === endorsedNetwork.hostport();
    }

    async getChainId(network){
        // TODO: Need to import web3 for chain id
        //web3.eth.net.getId()
        return 1;
    }

    accountsAreImported(){ return false; }
    privateToPublic(privateKey){ return ethUtil.addHexPrefix(ethUtil.privateToAddress(toBuffer(privateKey)).toString('hex')); }
    validPrivateKey(privateKey){ return ethUtil.isValidPrivate(toBuffer(privateKey)); }
    validPublicKey(publicKey){   return ethUtil.isValidAddress(publicKey); }
    randomPrivateKey(){
        return new Promise((resolve, reject) => {
            const byteArray = Array.from({length:32}).map(i => Math.round(IdGenerator.rand() * 255));
            const privateKey = new Buffer(byteArray);
            resolve(privateKey.toString('hex'));
        })
    }
    conformPrivateKey(privateKey){
        privateKey = privateKey.trim();

        if(privateKey.indexOf('0x') === 0)
            privateKey.replace('0x', '');

        return privateKey;
    }
    convertsTo(){
        return [Blockchains.EOS];
    }

    async balanceFor(account, network, tokenAccount, symbol){
        return 0;
    }

    actionParticipants(payload){
        return ObjectHelpers.flatten(
            payload.messages
                .map(message => message.authorization)
        );
    }

    async signer(transaction, publicKey, arbitrary = false, isHash = false){
        const basePrivateKey = KeyPairService.publicToPrivate(publicKey);
        if(!basePrivateKey) return;

        const privateKey = ethUtil.addHexPrefix(basePrivateKey);
        const tx = new EthTx(transaction);
        tx.sign(ethUtil.toBuffer(privateKey));
        return ethUtil.addHexPrefix(tx.serialize().toString('hex'));
    }

    async requestParser(transaction, abi){
        let params = {};
        let methodABI;
        if(abi){
            methodABI = abi.find(method => transaction.data.indexOf(method.signature) !== -1);
            if(!methodABI) throw Error.signatureError('no_abi_method', "No method signature on the abi you provided matched the data for this transaction");

            params = web3.eth.abi.decodeParameters(methodABI.inputs, transaction.data.replace(methodABI.signature, ''));
            params = Object.keys(params).reduce((acc, key) => {
                if(methodABI.inputs.map(input => input.name).includes(key))
                    acc[key] = params[key];
                return acc;
            }, {});
        }

        const h2n = web3.utils.hexToNumberString;

        const data = Object.assign(params, {
            // gas:h2n(transaction.gas),
            gasLimit:h2n(transaction.gasLimit),
            gasPrice:web3.utils.fromWei(h2n(transaction.gasPrice)),
        });

        if(transaction.hasOwnProperty('value') && transaction.value > 0)
            data.value = h2n(transaction.value);

        return [{
            data,
            code:transaction.to,
            type:abi ? methodABI.name : 'transfer',
            authorization:transaction.from
        }];
    }

}