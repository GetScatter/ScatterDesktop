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
import ResourceService from '../../services/ResourceService'
import StorageService from '../../services/StorageService'
import ApiService from '../../services/ApiService'
import * as Actions from '../../models/api/ApiActions';
import {store} from '../../store/store'
import eosjs2 from 'eosjs2';
import * as numeric from "eosjs2/dist/eosjs-numeric";


let cachedInstances = {};
const getCachedInstance = network => {
    if(cachedInstances.hasOwnProperty(network.unique())) return cachedInstances[network.unique()];
    else {
        const eos = Eos({httpEndpoint:`${network.fullhost()}`, chainId:network.chainId});
        cachedInstances[network.unique()] = eos;
        return eos;
    }
}


const getAccountsFromPublicKey = (publicKey, network) => {
    return Promise.race([
        new Promise(resolve => setTimeout(() => resolve([]), 2500)),
        new Promise((resolve, reject) => {
            const eos = getCachedInstance(network);
            eos.getKeyAccounts(publicKey).then(res => {
                if(!res || !res.hasOwnProperty('account_names')){ resolve([]); return false; }

                Promise.all(res.account_names.map(name => eos.getAccount(name).catch(e => resolve([])))).then(multires => {
                    let accounts = [];
                    multires.map(account => {
                        account.permissions.map(perm => {
                            if(!!perm.required_auth.keys.find(x => x.key === publicKey))
                                accounts.push({name:account.account_name, authority:perm.perm_name})
                        });
                    });
                    resolve(accounts)
                }).catch(e => resolve([]));
            }).catch(e => resolve([]));
        })
    ])
};

const EXPLORERS = [
    {
        name:'Bloks',
        account:account => `https://bloks.io/account/${account.name}`,
        transaction:id => `https://bloks.io/transaction/${id}`,
        block:id => `https://bloks.io/block/${id}`
    },
    {
        name:'EOSFlare',
        account:account => `https://eosflare.io/account/${account.name}`,
        transaction:id => `https://eosflare.io/tx/${id}`,
        block:id => `https://eosflare.io/block/${id}`
    }
];




export default class EOS extends Plugin {

    constructor(){ super(Blockchains.EOSIO, PluginTypes.BLOCKCHAIN_SUPPORT) }
    explorers(){ return EXPLORERS; }
    accountFormatter(account){ return `${account.name}@${account.authority}` }
    returnableAccount(account){ return { name:account.name, authority:account.authority, publicKey:account.publicKey, blockchain:Blockchains.EOSIO }}

    forkSupport(){
        return true;
    }

    async getEndorsedNetwork(){
        return new Promise((resolve, reject) => {
            resolve(new Network(
                'EOS Mainnet', 'https',
                'nodes.get-scatter.com',
                443,
                Blockchains.EOSIO,
                'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
            ));
        });
    }

    async isEndorsedNetwork(network){
        const endorsedNetwork = await this.getEndorsedNetwork();
        return network.blockchain === Blockchains.EOSIO && network.chainId === endorsedNetwork.chainId;
    }

    async getChainId(network){
        const eos = Eos({httpEndpoint:`${network.protocol}://${network.hostport()}`});
        return eos.getInfo({}).then(x => x.chain_id || '').catch(() => '');
    }

    usesResources(){ return true; }

    async getResourcesFor(account){
        const data = await this.accountData(account);
        if(!data || !data.hasOwnProperty('cpu_limit') || !data.cpu_limit.hasOwnProperty('available')) return [];
        return [{
            name:'CPU',
            available:data.cpu_limit.available,
            max:data.cpu_limit.max,
            percentage:(data.cpu_limit.used * 100) / data.cpu_limit.max
        },{
            name:'NET',
            available:data.net_limit.available,
            max:data.net_limit.max,
            percentage:(data.net_limit.used * 100) / data.net_limit.max
        },{
            name:'RAM',
            available:data.ram_usage,
            max:data.ram_quota,
            percentage:(data.ram_usage * 100) / data.ram_quota
        }]
    }

    async moderateResource(resource, account){
        return new Promise(resolve => {
            const {name} = resource;

            const returnResult = tx => {
                if(!tx) return resolve(false);
                // PopupService.push(Popup.transactionSuccess(account.blockchain(), tx.transaction_id));
                resolve(true);
            }

            if(['CPU', 'NET'].includes(name))
                PopupService.push(Popup.delegateResources(account, returnResult));

            if(name === 'RAM')
                PopupService.push(Popup.buySellRAM(account, returnResult));

        })
    }

    async needsResources(account){
        const resources = await this.getResourcesFor(account);
        if(!resources.length) return false;

        return resources.find(x => x.name === 'CPU').available < 6000;
    }

    async addResources(account){
        const signProvider = payload => this.signer(payload, account.publicKey);
        const network = account.network();
        const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
        return await eos.delegatebw(account.name, account.name, '0.0000 EOS', '0.1000 EOS', 0, { authorization:[account.formatted()] })
            .catch(error => console.error(error))
            .then(res => res);
    }

    accountsAreImported(){ return true; }
    getImportableAccounts(keypair, network){
        return new Promise((resolve, reject) => {
            let publicKey = keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO);
            if(!publicKey) return resolve([]);
            publicKey = publicKey.key;
            getAccountsFromPublicKey(publicKey, network).then(accounts => {
                resolve(accounts.map(account => Account.fromJson({
                    name:account.name,
                    authority:account.authority,
                    publicKey,
                    keypairUnique:keypair.unique(),
                    networkUnique:network.unique(),
                })))
            }).catch(e => resolve([]));
        })
    }

    isValidRecipient(name){ return /(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/g.test(name); }
    privateToPublic(privateKey, prefix = null){ return ecc.PrivateKey(privateKey).toPublic().toString(prefix ? prefix : Blockchains.EOSIO.toUpperCase()); }
    validPrivateKey(privateKey){ return privateKey.length === 51 && ecc.isValidPrivate(privateKey); }
    validPublicKey(publicKey, prefix = null){ return ecc.PublicKey.fromStringOrThrow(publicKey, prefix ? prefix : Blockchains.EOSIO.toUpperCase()); }

    randomPrivateKey(){ return ecc.randomKey(); }
    conformPrivateKey(privateKey){ return privateKey.trim(); }
    convertsTo(){ return []; }
    from_eth(privateKey){
        return ecc.PrivateKey.fromHex(Buffer.from(privateKey, 'hex')).toString();
    }
    bufferToHexPrivate(buffer){
        return ecc.PrivateKey.fromBuffer(new Buffer(buffer)).toString()
    }
    hexPrivateToBuffer(privateKey){
        return new ecc.PrivateKey(privateKey).toBuffer();
    }

    actionParticipants(payload){
        return ObjectHelpers.flatten(
            payload.messages
                .map(message => message.authorization
                    .map(auth => `${auth.actor}@${auth.permission}`))
        );
    }

    async accountData(account){
        const eos = getCachedInstance(account.network());
        return Promise.race([
            new Promise(resolve => setTimeout(() => resolve(null), 2000)),
            eos.getAccount(account.name)
        ])
    }

    async balanceFor(account, tokenAccount, symbol){
        const eos = getCachedInstance(account.network());

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

    defaultDecimals(){ return 4; }
    defaultToken(){ return {symbol:'EOS', account:'eosio.token', name:'EOS', blockchain:Blockchains.EOSIO}; }

    async fetchTokens(tokens){
        tokens.push(this.defaultToken());
        const eosTokens = await fetch("https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json").then(res => res.json()).catch(() => []);
        eosTokens.map(token => {
            token.blockchain = Blockchains.EOSIO;
            if(!tokens.find(x => `${x.symbol}:${x.account}` === `${token.symbol}:${token.account}`)) tokens.push(token);
        });
    }

    async tokenInfo(token){
        const network = await this.getEndorsedNetwork();
        const eos = getCachedInstance(network);
        return Promise.race([
            new Promise(resolve => setTimeout(() => resolve(null), 500)),
            eos.getTableRows({
                json:true,
                code:token.account,
                scope:token.symbol,
                table:'stat',
                limit:1
            }).then(({rows}) => {
                if(!rows.length) return null;
                return {
                    maxSupply:rows[0].max_supply[0],
                    supply:rows[0].supply.split(' ')[0],
                };
            }).catch(() => null)
        ])
    }



    async passThroughProvider(payload, account, rejector){
        return new Promise(async resolve => {
            payload.messages = await this.requestParser(payload, Network.fromJson(account.network()));
            payload.identityKey = store.state.scatter.keychain.identities[0].publicKey;
            payload.participants = [account];
            payload.network = account.network();
            payload.origin = 'Internal Scatter Transfer';
            const request = {
                payload,
                origin:payload.origin,
                blockchain:'eos',
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
                } else signature = await this.signer({data:payload.buf}, account.publicKey, true);

                if(!signature) return rejector({error:'Could not get signature'});

                if(result.needResources) await await ResourceService.addResources(account);

                resolve(signature);
            }));
        })
    }


    async stakeOrUnstake(account, cpu, net, network, staking = true){
        return new Promise(async (resolve, reject) => {
            const signProvider = payload => this.passThroughProvider(payload, account, network, reject);

            const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
            if(staking) resolve(eos.delegatebw(account.name, account.name, net, cpu, 0, { authorization:[account.formatted()] })
                .catch(error => ({error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}))
                .then(res => res));

            else resolve(eos.undelegatebw(account.name, account.name, net, cpu, { authorization:[account.formatted()] })
                .catch(error => ({error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}))
                .then(res => res));
        })
    }

    async buyOrSellRAM(account, bytes, network, buying = true){
        return new Promise(async (resolve, reject) => {
            const signProvider = payload => this.passThroughProvider(payload, account, network, reject);

            const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
            if(buying) resolve(eos.buyrambytes(account.name, account.name, bytes, { authorization:[account.formatted()] })
                .catch(error => ({error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}))
                .then(res => res));

            else resolve(eos.sellram(account.name, bytes, { authorization:[account.formatted()] })
                .catch(error => ({error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}))
                .then(res => res));
        })
    }

    async transfer({account, to, amount, contract, symbol, memo, promptForSignature = true}){
        return new Promise(async (resolve, reject) => {
            const signProvider = promptForSignature
                ? payload => this.passThroughProvider(payload, account, reject)
                : payload => this.signer(payload, account.publicKey);

            const eos = Eos({httpEndpoint:account.network().fullhost(), chainId:account.network().chainId, signProvider});
            const contractObject = await eos.contract(contract);
            const amountWithSymbol = amount.indexOf(symbol) > -1 ? amount : `${amount} ${symbol}`;
            resolve(await contractObject.transfer(account.name, to, amountWithSymbol, memo, { authorization:[account.formatted()] })
                .catch(error => {
                    console.log('error', error);
                    return {error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}
                })
                .then(result => result));
        })
    }

    async signer(payload, publicKey, arbitrary = false, isHash = false){
        let privateKey = KeyPairService.publicToPrivate(publicKey);
        if (!privateKey) return;

        if(typeof privateKey !== 'string') privateKey = this.bufferToHexPrivate(privateKey);

        if (arbitrary && isHash) return ecc.Signature.signHash(payload.data, privateKey).toString();
        return ecc.sign(Buffer.from(arbitrary ? payload.data : payload.buf, 'utf8'), privateKey);
    }

    async createTransaction(actions, account, network){
        let tx = {};
        const formatContract = x => x.replace('.', '_');
        const actionOptions = { authorization:[`${account.name}@${account.authority}`] };

        const signProvider = x => {
            tx.buf = x.buf;
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
                try {
                    contracts[formatContract(action.contract)][action.action](...action.params, actionOptions);
                } catch(e){
                    console.log('err', e);
                }
            });
        }, {broadcast:false}).catch(() => {});

        return tx;
    }






    async getAbis(contracts, network, eos){
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

        return abis;
    }

    async parseEosjsRequest(payload, network){
        const {transaction} = payload;

        const eos = getCachedInstance(network);

        const contracts = ObjectHelpers.distinct(transaction.actions.map(action => action.account));
        const abis = await this.getAbis(contracts, network, eos);


        return await Promise.all(transaction.actions.map(async (action, index) => {
            const contractAccountName = action.account;

            let abi = abis[contractAccountName];

            const typeName = abi.abi.actions.find(x => x.name === action.name).type;
            const data = abi.fromBuffer(typeName, action.data);
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

    async parseEosjs2Request(payload, network){
        const {transaction} = payload;

        const rpc = new eosjs2.Rpc.JsonRpc(network.fullhost());
        const api = new eosjs2.Api({rpc});

        const contracts = ObjectHelpers.distinct(transaction.abis.map(x => x.account_name));

        const abis = await Promise.all(contracts.map(async accountName => {
            const cachedABI = await StorageService.getCachedABI(accountName+'eosjs2', network.chainId);

            const account = await rpc.get_account(accountName);
            const lastUpdate = +new Date(account.last_code_update);

            let rawAbiHex;
            const fetchAbi = async () => {
                const rawAbi = numeric.base64ToBinary((await rpc.get_raw_code_and_abi(accountName)).abi);
                rawAbiHex = Buffer.from(rawAbi).toString('hex');
                await StorageService.cacheABI(accountName+'eosjs2', network.chainId, {
                    rawAbiHex,
                    timestamp:+new Date()
                });
            };

            if(!cachedABI) await fetchAbi();
            else {
                if(cachedABI.timestamp < lastUpdate) await fetchAbi();
                else rawAbiHex = cachedABI.rawAbiHex;
            }

            const rawAbi = Buffer.from(rawAbiHex, 'hex');
            const abi = api.rawAbiToJson(rawAbi);
            api.cachedAbis.set(accountName, { rawAbi, abi });
            return true;
        }));

        const buffer = Buffer.from(transaction.serializedTransaction, 'hex');
        const parsed = await api.deserializeTransactionWithActions(buffer);
        parsed.actions.map(x => {
            x.code = x.account;
            x.type = x.name;
            delete x.account;
            delete x.name;
        });

        payload.buf = Buffer.concat([
            new Buffer(transaction.chainId, "hex"),         // Chain ID
            buffer,                                         // Transaction
            new Buffer(new Uint8Array(32)),                 // Context free actions
        ]);

        return parsed.actions;
    }

    async requestParser(payload, network){
        if(payload.transaction.hasOwnProperty('serializedTransaction'))
            return this.parseEosjs2Request(payload, network);
        else return this.parseEosjsRequest(payload, network);
    }
}
