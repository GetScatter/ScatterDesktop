import Plugin from '../Plugin';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'
import Account from '../../models/Account'
import KeyPairService from '../../services/KeyPairService'
import Eos from 'eosjs'
let {ecc, Fcbuffer} = Eos.modules;
import ObjectHelpers from '../../util/ObjectHelpers'
import * as ricardianParser from 'eos-rc-parser';
import {Popup} from '../../models/popups/Popup'
import PopupService from '../../services/PopupService'
import StorageService from '../../services/StorageService'
import ApiService from '../../services/ApiService'
import * as Actions from '../../models/api/ApiActions';
import {store} from '../../store/store'


const getAccountsFromPublicKey = (publicKey, network) => {
    return Promise.race([
        new Promise(resolve => setTimeout(() => resolve([]), 10000)),
        new Promise((resolve, reject) => {
            const eos = Eos({httpEndpoint:`${network.protocol}://${network.hostport()}`, chainId:network.chainId});
            eos.getKeyAccounts(publicKey).then(res => {
                if(!res || !res.hasOwnProperty('account_names')){ resolve([]); return false; }

                Promise.all(res.account_names.map(name => eos.getAccount(name).catch(e => resolve([])))).then(multires => {
                    let accounts = [];
                    multires.map(account => {
                        account.permissions.map(permission => {
                            accounts.push({name:account.account_name, authority:permission.perm_name});
                        });
                    });
                    resolve(accounts)
                }).catch(e => resolve([]));
            }).catch(e => resolve([]));
        })
    ])
}


export default class EOS extends Plugin {

    constructor(){ super(Blockchains.EOS, PluginTypes.BLOCKCHAIN_SUPPORT) }
    accountFormatter(account){ return `${account.name}@${account.authority}` }
    returnableAccount(account){ return { name:account.name, authority:account.authority, publicKey:account.publicKey, blockchain:Blockchains.EOS }}

    async getEndorsedNetwork(){
        return new Promise((resolve, reject) => {
            resolve(new Network(
                'EOS Mainnet', 'https',
                'nodes.get-scatter.com',
                443,
                Blockchains.EOS,
                'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
            ));
        });
    }

    async isEndorsedNetwork(network){
        const endorsedNetwork = await this.getEndorsedNetwork();
        return network.hostport() === endorsedNetwork.hostport();
    }

    async getChainId(network){
        const eos = Eos({httpEndpoint:`${network.protocol}://${network.hostport()}`});
        return eos.getInfo({}).then(x => x.chain_id || '').catch(() => '');
    }

    accountsAreImported(){ return true; }
    getImportableAccounts(keypair, network){
        return new Promise((resolve, reject) => {
            getAccountsFromPublicKey(keypair.publicKey, network).then(accounts => {
                resolve(accounts.map(account => Account.fromJson({
                    name:account.name,
                    authority:account.authority,
                    publicKey:keypair.publicKey,
                    keypairUnique:keypair.unique(),
                    networkUnique:network.unique(),
                })))
            }).catch(e => resolve([]));
        })
    }

    privateToPublic(privateKey){ return ecc.privateToPublic(privateKey); }
    validPrivateKey(privateKey){ return ecc.isValidPrivate(privateKey); }
    validPublicKey(publicKey){   return ecc.isValidPublic(publicKey); }
    randomPrivateKey(){ return ecc.randomKey(); }
    conformPrivateKey(privateKey){ return privateKey.trim(); }
    convertsTo(){ return []; }
    from_eth(privateKey){
        return ecc.PrivateKey.fromHex(Buffer.from(privateKey, 'hex')).toString();
    }

    actionParticipants(payload){
        return ObjectHelpers.flatten(
            payload.messages
                .map(message => message.authorization
                    .map(auth => `${auth.actor}@${auth.permission}`))
        );
    }

    async balanceFor(account, network, tokenAccount, symbol){
        const eos = Eos({httpEndpoint:`${network.protocol}://${network.hostport()}`, chainId:network.chainId});

        const balances = await eos.getTableRows({
            json:true,
            code:tokenAccount,
            scope:account.name,
            table:'accounts',
            limit:500
        }).then(res => res.rows).catch(() => []);

        const row = balances.find(row => row.balance.split(" ")[1].toLowerCase() === symbol.toLowerCase());
        return row ? row.balance.split(" ")[0] : 0;
    }

    async fetchTokens(tokens){
        const eosTokens = await fetch("https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json").then(res => res.json()).catch(() => []);
        eosTokens.map(token => {
            if(!tokens.find(x => `${x.symbol}:${x.account}` === `${token.symbol}:${token.account}`)) tokens.push(token);
        });
    }

    async transfer(account, to, amount, network, tokenAccount, symbol, memo){
        const signProvider = async payload => {
            return new Promise(async resolve => {
                payload.messages = await this.requestParser(payload, Network.fromJson(network));
                payload.identityKey = store.state.scatter.keychain.identities[0].publicKey;
                const request = {
                    payload,
                    origin:'Internal Scatter Transfer',
                    blockchain:'eos',
                    requiredFields:{},
                    type:Actions.REQUEST_SIGNATURE,
                    id:1,
                }

                PopupService.push(Popup.popout(request, async ({result}) => {
                    if(!result || (!result.accepted || false)) return resolve(null);
                    resolve(this.signer({data:payload.buf}, account.publicKey, true));
                }));
            })
        };

        const eos = Eos({httpEndpoint:`${network.protocol}://${network.hostport()}`, chainId:network.chainId, signProvider});
        const contract = await eos.contract(tokenAccount);
        const options = { authorization:[account.formatted()] };
        return await contract.transfer(account.name, to, amount, memo, options)
            .catch(error => ({error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}))
            .then(result => result);
    }

    async signer(payload, publicKey, arbitrary = false, isHash = false){
        const privateKey = KeyPairService.publicToPrivate(publicKey);
        if(!privateKey) return;

        let sig;
        if(arbitrary && isHash) sig = ecc.Signature.signHash(payload.data, privateKey).toString();
        return ecc.sign(Buffer.from(arbitrary ? payload.data : payload.buf.data, 'utf8'), privateKey);
    }

    async requestParser(signargs, network){
        const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});

        const contracts = signargs.transaction.actions.map(action => action.account)
            .reduce((acc, contract) => {
                if(!acc.includes(contract)) acc.push(contract);
                return acc;
            }, []);

        const staleAbi = +new Date() - (1000 * 60 * 60 * 24 * 2);
        const abis = {};

        await Promise.all(contracts.map(async contractAccount => {
            const cachedABI = await StorageService.getCachedABI(contractAccount, network.chainId);

            if(cachedABI === 'object' && cachedABI.timestamp > +new Date((await eos.getAccount(contractAccount)).last_code_update))
                abis[contractAccount] = eos.fc.abiCache.abi(contractAccount, cachedABI.abi);

            else {
                abis[contractAccount] = (await eos.contract(contractAccount)).fc;
                const savableAbi = JSON.parse(JSON.stringify(abis[contractAccount]));
                delete savableAbi.schema;
                delete savableAbi.structs;
                delete savableAbi.types;
                savableAbi.timestamp = +new Date();

                await StorageService.cacheABI(contractAccount, network.chainId, savableAbi);
            }
        }));

        return await Promise.all(signargs.transaction.actions.map(async (action, index) => {
            const contractAccountName = action.account;

            let abi = abis[contractAccountName];

            const data = abi.fromBuffer(action.name, action.data);
            const actionAbi = abi.abi.actions.find(fcAction => fcAction.name === action.name);
            let ricardian = actionAbi ? actionAbi.ricardian_contract : null;

            if(ricardian){
                const htmlFormatting = {h1:'div class="ricardian-action"', h2:'div class="ricardian-description"'};
                const signer = action.authorization.length === 1 ? action.authorization[0].actor : null;
                ricardian = ricardianParser.parse(action.name, data, ricardian, signer, htmlFormatting);
            }

            return {
                data,
                code:action.account,
                type:action.name,
                authorization:action.authorization,
                ricardian
            };
        }));
    }

    // async createTransaction(contract, action, params, account, network){
    //
    //     /*
    //     {
    //         actions:[
    //             {contract:'eosio.token', action:'transfer', params:[...]}
    //             {contract:'eosio.token', action:'transfer', params:[...]}
    //             {contract:'hello', action:'hi', params:[...]}
    //         ]
    //     }
    //      */
    //
    //
    //     let tx = {};
    //     const signProvider = x => {
    //         tx.buf = {data:x.buf};
    //         tx.transaction = x.transaction;
    //     }
    //
    //     const options = {
    //         httpEndpoint:network.fullhost(),
    //         chainId:network.chainId,
    //         broadcast: false,
    //         sign: true,
    //         signProvider
    //     };
    //
    //     const eos = Eos(options);
    //
    //     const actionOptions = { authorization:[`${account.name}@${account.authority}`] };
    //
    //     const c = await eos.contract(contract);
    //     await c[action](...params, {authorization:[`${account.name}@${account.authority}`]});
    //     return tx;
    // }

    async createTransaction(actions, account, network){
        let tx = {};
        const formatContract = x => x.replace('.', '_');
        const actionOptions = { authorization:[`${account.name}@${account.authority}`] };

        const signProvider = x => {
            tx.buf = {data:x.buf};
            tx.transaction = x.transaction;
            return [];
        };

        const options = {
            httpEndpoint:network.fullhost(),
            chainId:network.chainId,
            broadcast: false,
            sign: true,
            signProvider
        };

        const contractNames = actions.map(x => x.contract);

        const eos = Eos(options);

        await eos.transaction(contractNames, contracts => {
            actions.map(action => {
                console.log('hi', formatContract(action.contract), action.action, ...action.params);
                try {
                    contracts[formatContract(action.contract)][action.action](...action.params, actionOptions);
                } catch(e){
                    console.log('err', e);
                }
            });
        }, {broadcast:false}).catch(() => {});


        // const c = await eos.contract(contract);
        // await c[action](...params, {authorization:[`${account.name}@${account.authority}`]});
        return tx;
    }
}
