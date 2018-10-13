import Plugin from '../Plugin';
import * as Actions from '../../models/api/ApiActions';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'

import IdGenerator from '../../util/IdGenerator';
import Hasher from '../../util/Hasher';
import KeyPairService from '../../services/KeyPairService';
import {store} from '../../store/store';

import PopupService from '../../services/PopupService'
import {Popup} from '../../models/popups/Popup'

import TronWeb from 'tronweb';
import * as utils from 'tronweb/src/utils/crypto';
const ethUtil = require('ethereumjs-util');
const toBuffer = key => ethUtil.toBuffer(ethUtil.addHexPrefix(key));
import Web3 from 'web3';
// import Ethers from 'ethers';
import ethabi from 'ethereumjs-abi';

let cachedInstances = {};
const getCachedInstance = network => {
    if(cachedInstances.hasOwnProperty(network.unique())) return cachedInstances[network.unique()];
    else {
        const provider = new TronWeb.providers.HttpProvider(network.fullhost());
        const tronWeb = new TronWeb(provider, provider, network.fullhost());
        cachedInstances[network.unique()] = tronWeb;
        return tronWeb;
    }
}

const EXPLORERS = [
    {
        name:'Etherscan',
        account:account => `https://tronscan.org/#/address/${account.formatted()}`,
        transaction:id => `https://tronscan.org/#/transaction/${id}`,
        block:id => `https://tronscan.org/#/block/${id}`
    },
];

export default class TRX extends Plugin {

    constructor(){ super(Blockchains.TRX, PluginTypes.BLOCKCHAIN_SUPPORT) }
    explorers(){ return EXPLORERS; }
    accountFormatter(account){ return `${account.publicKey}` }
    returnableAccount(account){ return { address:account.publicKey, blockchain:Blockchains.TRX }}
    forkSupport(){ return false; }

    async getEndorsedNetwork(){
        return new Promise((resolve, reject) => {
            resolve(new Network('Tron Mainnet', 'https', 'api.trongrid.io', 443, Blockchains.TRX, '1'));
        });
    }

    async isEndorsedNetwork(network){
        const endorsedNetwork = await this.getEndorsedNetwork();
        return network.blockchain === Blockchains.TRX && network.chainId === endorsedNetwork.chainId;
    }

    async getChainId(network){
        return 1;
    }

    usesResources(){ return false; }

    accountsAreImported(){ return false; }
    isValidRecipient(address){ return utils.isAddressValid(address); }
    privateToPublic(privateKey){
        if(typeof privateKey === 'string') privateKey = this.hexPrivateToBuffer(privateKey);
        return utils.getBase58CheckAddress(utils.getAddressFromPriKey(privateKey));
    }
    validPrivateKey(privateKey){ return privateKey.length === 64 && ethUtil.isValidPrivate(toBuffer(privateKey)); }
    validPublicKey(publicKey){ return utils.isAddressValid(address); }
    bufferToHexPrivate(buffer){ return new Buffer(buffer).toString('hex') }
    hexPrivateToBuffer(privateKey){ return Buffer.from(privateKey, 'hex'); }
    conformPrivateKey(privateKey){
        privateKey = privateKey.trim();
        return privateKey;
    }

    async balanceFor(account){
        const tron = getCachedInstance(account.network());
        const balance = await tron.trx.getBalance(account.publicKey);
        return tron.toBigNumber(balance).div(1000000).toFixed(6).toString(10);
    }

    defaultDecimals(){ return 6; }
    defaultToken(){ return {account:'trx', symbol:'TRX', name:'TRX', blockchain:Blockchains.TRX}; }
    actionParticipants(payload){ return payload.transaction.participants }

    async fetchTokens(tokens){
        const ethTokens = [this.defaultToken()];
        ethTokens.map(token => {
            token.blockchain = Blockchains.TRX;
            if(!tokens.find(x => `${x.symbol}:${x.account}` === `${token.symbol}:${token.account}`)) tokens.push(token);
        });
    }

    async tokenInfo(token) {
        return null;
    }


    async transfer({account, to, amount, promptForSignature = true}){
        return new Promise(async (resolve, reject) => {
            const tron = getCachedInstance(account.network());
            tron.trx.sign = async signargs => {
                const transaction = { transaction:signargs, participants:[account.publicKey], };
                const payload = { transaction, blockchain:Blockchains.TRX, network:account.network(), requiredFields:{} };
                return promptForSignature
                    ? await this.passThroughProvider(payload, account, reject)
                    : await this.signer(payload, account.publicKey);
            };

            const send = await tron.transactionBuilder.sendTrx(to, amount, account.publicKey);
            resolve(await tron.trx.sign(send).then(x => x).catch(error => {
                return {error}
            }));
        })
    }

    async signer(payload, publicKey, arbitrary = false, isHash = false){
        let privateKey = KeyPairService.publicToPrivate(publicKey);
        if (!privateKey) return;

        if(typeof privateKey !== 'string') privateKey = this.bufferToHexPrivate(privateKey);

        return utils.signTransaction(privateKey, payload.transaction.transaction);
    }

    async passThroughProvider(payload, account, rejector){
        return new Promise(async resolve => {
            payload.messages = await this.requestParser(payload);
            payload.identityKey = store.state.scatter.keychain.identities[0].publicKey;
            payload.participants = [account];
            payload.network = account.network();
            payload.origin = 'Internal Scatter Transfer';
            const request = {
                payload,
                origin:payload.origin,
                blockchain:Blockchains.TRX,
                requiredFields:{},
                type:Actions.REQUEST_SIGNATURE,
                id:1,
            }

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result || (!result.accepted || false)) return rejector({error:'Could not get signature'});

                let signature = null;
                if(KeyPairService.isHardware(account.publicKey)){
                    const keypair = KeyPairService.getKeyPairFromPublicKey(account.publicKey);
                    signature = await keypair.external.interface.sign(account.publicKey, payload, payload.abi, account.network());
                } else signature = await this.signer(payload, account.publicKey);

                if(!signature) return rejector({error:'Could not get signature'});

                resolve(signature);
            }));
        })
    }

    async requestParser(transaction, abiData){
        const network = Network.fromJson(transaction.network);
        const txID = transaction.transaction.transaction.txID;
        transaction = transaction.transaction.transaction.raw_data;




        return transaction.contract.map(contract => {

            const data = contract.parameter.value;

            // let params = {};
            let methodABI;
            // if(abiData){
            //     const tron = getCachedInstance(network);
            //
            //     const {abi, address, method} = abiData;
            //
            //     console.log('abi', abi);
            //
            //     methodABI = abi.find(x => x.name === method);
            //     if(!methodABI) throw Error.signatureError('no_abi_method', "No method signature on the abi you provided matched the data for this transaction");
            //
            //
            //     console.log('parsing', method, methodABI.inputs, data.data);
            //
            //     // params = (new Web3()).eth.abi.decodeParameters(methodABI.inputs, data.data);
            //     // params = Object.keys(params).reduce((acc, key) => {
            //     //     if(methodABI.inputs.map(input => input.name).includes(key))
            //     //         acc[key] = params[key];
            //     //     return acc;
            //     // }, {});
            //
            //
            //     // const abiCoder = new Ethers.utils.AbiCoder();
            //     // params = abiCoder.decode(methodABI.inputs, data.data);
            //
            //     params = ethabi.rawDecode(methodABI.inputs.map(x => x.type), data.data);
            //
            //     console.log('params', params);
            // }


            return {
                data,
                code:contract.type,
                type:methodABI ? methodABI.name : 'transfer',
            };

        })
    }

}