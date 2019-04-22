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
import Token from "../../models/Token";
import HardwareService from "../../services/HardwareService";
import BigNumber from "bignumber.js";
import TokenService from "../../services/TokenService";
import {localizedState} from "../../localization/locales";
import LANG_KEYS from "../../localization/keys";
import nacl from 'tweetnacl'
const erc20abi = require('../../data/abis/erc20');

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

const EXPLORER = {
	"name":"Etherscan",
	"account":"https://etherscan.io/address/{x}",
	"transaction":"https://etherscan.io/tx/{x}",
	"block":"https://etherscan.io/block/{x}"
};

export default class ETH extends Plugin {

    constructor(){ super(Blockchains.ETH, PluginTypes.BLOCKCHAIN_SUPPORT) }

	bustCache(){ cachedInstances = {}; }
    defaultExplorer(){ return EXPLORER; }
    accountFormatter(account){ return `${account.publicKey}` }
    returnableAccount(account){ return { address:account.publicKey, blockchain:Blockchains.ETH }}

	contractPlaceholder(){ return '0x.....'; }
	recipientLabel(){ return localizedState(LANG_KEYS.GENERIC.Address); }

    getEndorsedNetwork(){
        return new Network('ETH Mainnet', 'https', 'ethnodes.get-scatter.com', 443, Blockchains.ETH, '1')
    }

    isEndorsedNetwork(network){
        const endorsedNetwork = this.getEndorsedNetwork();
        return network.blockchain === Blockchains.ETH && network.chainId === endorsedNetwork.chainId;
    }

    async getChainId(network){
        // TODO: Need to import web3 for chain id
        //web3.eth.net.getId()
        return 1;
    }

    usesResources(){ return false; }
	hasAccountActions(){ return false; }

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

	hasUntouchableTokens(){ return false; }

    async balanceFor(account, token, web3 = null){

        const killInstance = !web3;
        let balance;
        if(!web3){
	        const [w, e] = getCachedInstance(account.network());
	        web3 = e;
        }


        await Promise.race([
            new Promise(resolve => setTimeout(() => resolve(), 10000)),
            new Promise(async resolve => {
	            if(token.uniqueWithChain() === this.defaultToken().uniqueWithChain()){
		            balance = await web3.utils.fromWei(await web3.eth.getBalance(account.publicKey));
	            } else {
		            const contract = new web3.eth.Contract(erc20abi, token.contract);
		            try {
			            balance = TokenService.formatAmount(await contract.methods.balanceOf(account.sendable()).call(), token, true);
		            } catch(e){
			            console.error(`${token.name} is not an ERC20 token`, e);
			            balance = TokenService.formatAmount('0', token, true);
		            }
	            }
	            resolve();
            })
        ])

	    if(killInstance) killCachedInstance(account.network());
	    return balance;

    }

	async balancesFor(account, tokens){
        const [web3, engine] = getCachedInstance(account.network());

        let balances = [];
        for(let i = 0; i < tokens.length; i++){
            const t = tokens[i].clone();
	        t.amount = await this.balanceFor(account, tokens[i], web3);
	        t.chainId = account.network().chainId;
	        balances.push(t);
        }

		killCachedInstance(account.network());
        return balances;
    }

    defaultDecimals(){ return 18; }
    defaultToken(){ return new Token(Blockchains.ETH, 'eth', 'ETH', 'ETH', this.defaultDecimals(), '1') }

    actionParticipants(payload){
        return ObjectHelpers.flatten(
            payload.messages
                .map(message => message.authorization)
        );
    }


    async transfer({account, to, amount, token, promptForSignature = true}){
	    const {contract, symbol} = token;
	    const isEth = token.uniqueWithChain() === this.defaultToken().uniqueWithChain();
        return new Promise(async (resolve, reject) => {
            const wallet = new ScatterEthereumWallet(account, async (transaction, callback) => {
                const payload = { transaction, blockchain:Blockchains.TRX, network:account.network(), requiredFields:{}, abi:isEth ? null : erc20abi };
                const signatures = promptForSignature
                    ? await this.signerWithPopup(payload, account, x => finished(x), token)
                    : await this.signer(payload, account.publicKey, false, false, account);

                if(callback) callback(null, signatures);
                return signatures;
            });

            const finished = x => {
                killCachedInstance(account.network(), wallet);
                resolve(x);
            };

            const [web3, engine] = getCachedInstance(account.network(), wallet);

            if(isEth){
	            const value = web3util.utils.toWei(amount.toString());
	            web3.eth.sendTransaction({from:account.publicKey, to, value})
		            .on('transactionHash', transactionHash => finished({transactionHash}))
		            .on('error', error => finished({error}));
            } else {
	            const value = web3util.utils.toWei(amount.toString());
	            const contract = new web3.eth.Contract(erc20abi, token.contract, {from:account.sendable()});
	            contract.methods.transfer(to, value).send({gasLimit: 250000})
		            .on('transactionHash', transactionHash => finished({transactionHash}))
		            .on('error', error => finished({error}));
            }

        })
    }

    async signer(transaction, publicKey, arbitrary = false, isHash = false, account = null){
	    if(account && KeyPairService.isHardware(publicKey))
		    return await HardwareService.sign(account, transaction);

	    const loom = transaction.hasOwnProperty('loom') && !!transaction.loom;
	    if(transaction.hasOwnProperty('transaction')) transaction = transaction.transaction;

        const basePrivateKey = await KeyPairService.publicToPrivate(publicKey);
        if(!basePrivateKey) return;


        if(loom){
	        const sigMsg = nacl.sign(transaction, basePrivateKey);
	        return sigMsg.slice(0, nacl.sign.signatureLength);
        }

        const tx = new EthTx(transaction);
	    const privateKey = ethUtil.addHexPrefix(basePrivateKey);
        tx.sign(ethUtil.toBuffer(privateKey));
        return ethUtil.addHexPrefix(tx.serialize().toString('hex'));
    }

    async signerWithPopup(payload, account, rejector, token = null){
        return new Promise(async resolve => {
            payload.messages = await this.requestParser(payload.transaction, payload.hasOwnProperty('abi') ? payload.abi : null, token);
            payload.identityKey = store.state.scatter.keychain.identities[0].publicKey;
            payload.participants = [account];
            payload.network = account.network();
            payload.origin = 'Scatter';
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
                    signature = await HardwareService.sign(account, payload);
                } else signature = await this.signer(payload.transaction, account.publicKey, true);

                if(!signature) return rejector({error:'Could not get signature'});

                resolve(signature);
            }, true));
        })
    }

    async requestParser(transaction, abi, token = null){
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
            code:token ? token.name : transaction.to,
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
