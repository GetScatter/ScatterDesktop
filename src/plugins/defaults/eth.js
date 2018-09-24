import Plugin from '../Plugin';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'

const EthTx = require('ethereumjs-tx')
const ethUtil = require('ethereumjs-util');
import Web3 from 'web3';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";

import IdGenerator from '../../util/IdGenerator';
import KeyPairService from '../../services/KeyPairService';
import ObjectHelpers from '../../util/ObjectHelpers'

import PopupService from '../../services/PopupService'
import {Popup} from '../../models/popups/Popup'

const web3 = new Web3();

const toBuffer = key => ethUtil.toBuffer(ethUtil.addHexPrefix(key));


const EXPLORERS = [
    {
        name:'Etherscan',
        account:account => `https://etherscan.io/address/${account.formatted()}`,
        transaction:id => `https://etherscan.io/tx/${id}`,
        block:id => `https://etherscan.io/block/${id}`
    },
];

export default class ETH extends Plugin {

    constructor(){ super(Blockchains.ETH, PluginTypes.BLOCKCHAIN_SUPPORT) }
    explorers(){ return EXPLORERS; }
    accountFormatter(account){ return `${account.publicKey}` }
    returnableAccount(account){ return { address:account.publicKey, blockchain:Blockchains.ETH }}

    forkSupport(){
        return false;
    }

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

    usesResources(){ return false; }

    accountsAreImported(){ return false; }
    isValidRecipient(address){ return this.validPublicKey(address); }
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
    bufferToHexPrivate(buffer){
        return new Buffer(buffer).toString('hex')
    }
    hexPrivateToBuffer(privateKey){
        return Buffer.from(privateKey, 'hex');
    }
    conformPrivateKey(privateKey){
        privateKey = privateKey.trim();

        if(privateKey.indexOf('0x') === 0)
            privateKey.replace('0x', '');

        return privateKey;
    }
    convertsTo(){
        return [Blockchains.EOSIO];
    }

    async balanceFor(account, tokenAccount, symbol){
        return 0;
    }

    defaultDecimals(){ return 18; }
    defaultToken(){ return {account:'eth', symbol:'ETH', name:'ETH', blockchain:Blockchains.ETH}; }

    actionParticipants(payload){
        return ObjectHelpers.flatten(
            payload.messages
                .map(message => message.authorization)
        );
    }

    async fetchTokens(tokens){
        const ethTokens = [this.defaultToken()];
        ethTokens.map(token => {
            token.blockchain = Blockchains.ETH;
            if(!tokens.find(x => `${x.symbol}:${x.account}` === `${token.symbol}:${token.account}`)) tokens.push(token);
        });
    }

    async transfer(account, to, amount, network, tokenAccount, symbol, memo){
        PopupService.push(Popup.prompt("Ethereum transfers not enabled yet", "Sorry, but only EOS transfers are currently enabled", "ban", "Okay"))
        return null;
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