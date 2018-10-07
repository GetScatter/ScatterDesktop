import Plugin from '../Plugin';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'

import * as Actions from '../../models/api/ApiActions';
import {store} from '../../store/store'
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

const web3util = new Web3();

const toBuffer = key => ethUtil.toBuffer(ethUtil.addHexPrefix(key));

let cachedInstances = {};
const getCachedInstance = (network, wallet = null) => {
    const key = network.unique() + (wallet ? wallet.getAccounts()[0] : '');
    if(cachedInstances.hasOwnProperty(key)) return cachedInstances[key];
    else {
        const engine = new ProviderEngine();
        const web3 = new Web3(engine);
        if(wallet) engine.addProvider(new HookedWalletSubprovider(wallet));

        const rpcUrl = network.host === 'ethnodes.get-scatter.com' ? 'https://commonly-classic-katydid.quiknode.io/d0bf98e7-a866-43d4-ac71-2397fd1b3aba/dQsznyrZRg2dr4DQJNPDgw==/' : network.fullhost();
        engine.addProvider(new RpcSubprovider({rpcUrl}));
        engine.start();
        cachedInstances[key] = [web3, engine];
        return cachedInstances[key];
    }
}

const killCachedInstance = (network, wallet = null) => {
    const key = network.unique() + (wallet ? wallet.getAccounts()[0] : '');
    if(cachedInstances.hasOwnProperty(key)) {
        const [web3, engine] = cachedInstances[key];
        engine.stop();
        delete cachedInstances[key];
    }

}

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
            resolve(new Network('ETH Mainnet', 'https', 'ethnodes.get-scatter.com', 443, Blockchains.ETH, '1'));
        });
    }

    async isEndorsedNetwork(network){
        const endorsedNetwork = await this.getEndorsedNetwork();
        return network.blockchain === Blockchains.ETH && network.chainId === endorsedNetwork.chainId;
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
    validPrivateKey(privateKey){ return privateKey.length === 64 && ethUtil.isValidPrivate(toBuffer(privateKey)); }
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
        const [web3, engine] = getCachedInstance(account.network());
        let balance = await web3.utils.fromWei(await web3.eth.getBalance(account.publicKey));
        killCachedInstance(account.network());
        return balance;
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

    async tokenInfo(token) {
        return null;
    }


    async transfer({account, to, amount, contract, symbol, promptForSignature = true}){
        return new Promise(async (resolve, reject) => {
            const wallet = new ScatterEthereumWallet(account, async (transaction, callback) => {
                const payload = { transaction, blockchain:Blockchains.TRX, network:account.network(), requiredFields:{} };
                const signatures = promptForSignature
                    ? await this.passThroughProvider(payload, account, x => finished(x))
                    : await this.signer(payload.transaction, account.publicKey);

                if(callback) callback(null, signatures);
                return signatures;
            });

            const finished = x => {
                killCachedInstance(account.network(), wallet);
                resolve(x);
            };

            const [web3, engine] = getCachedInstance(account.network(), wallet);
            const value = web3util.utils.toWei(amount.toString());
            web3.eth.sendTransaction({from:account.publicKey, to, value})
                .on('transactionHash', transactionHash => finished({transactionHash}))
                .on('error', error => finished({error}));
        })
    }

    async signer(transaction, publicKey, arbitrary = false, isHash = false){
        const basePrivateKey = KeyPairService.publicToPrivate(publicKey);
        if(!basePrivateKey) return;

        const privateKey = ethUtil.addHexPrefix(basePrivateKey);
        const tx = new EthTx(transaction);
        tx.sign(ethUtil.toBuffer(privateKey));
        return ethUtil.addHexPrefix(tx.serialize().toString('hex'));
    }

    async passThroughProvider(payload, account, rejector){
        return new Promise(async resolve => {
            payload.messages = await this.requestParser(payload.transaction);
            payload.identityKey = store.state.scatter.keychain.identities[0].publicKey;
            payload.participants = [account];
            payload.network = account.network();
            payload.origin = 'Internal Scatter Transfer';
            const request = {
                payload,
                origin:payload.origin,
                blockchain:Blockchains.ETH,
                requiredFields:{},
                type:Actions.REQUEST_SIGNATURE,
                id:1,
            };

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result || (!result.accepted || false)) return rejector({error:'Could not get signature'});

                let signature = null;
                if(KeyPairService.isHardware(account.publicKey)){
                    const keypair = KeyPairService.getKeyPairFromPublicKey(account.publicKey);
                    signature = await keypair.external.interface.sign(account.publicKey, payload, payload.abi, account.network());
                } else signature = await this.signer(payload.transaction, account.publicKey, true);

                if(!signature) return rejector({error:'Could not get signature'});

                resolve(signature);
            }));
        })
    }

    async requestParser(transaction, abi){
        let params = {};
        let methodABI;
        if(abi){
            methodABI = abi.find(method => transaction.data.indexOf(method.signature) !== -1);
            if(!methodABI) throw Error.signatureError('no_abi_method', "No method signature on the abi you provided matched the data for this transaction");

            params = web3util.eth.abi.decodeParameters(methodABI.inputs, transaction.data.replace(methodABI.signature, ''));
            params = Object.keys(params).reduce((acc, key) => {
                if(methodABI.inputs.map(input => input.name).includes(key))
                    acc[key] = params[key];
                return acc;
            }, {});
        }

        const h2n = web3util.utils.hexToNumberString;

        const data = Object.assign(params, {
            // gas:h2n(transaction.gas),
            gasLimit:h2n(transaction.gasLimit),
            gasPrice:web3util.utils.fromWei(h2n(transaction.gasPrice)),
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


class ScatterEthereumWallet {
    constructor(account, signer){
        this.signTransaction = signer;
        this.getAccounts = (callback) => {
            const accounts = [account.sendable()];
            if(callback) callback(null, accounts);
            return accounts;
        };

    }
}