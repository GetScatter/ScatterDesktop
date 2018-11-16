import Plugin from '../Plugin';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'
import Account from '../../models/Account'
import KeyPairService from '../../services/KeyPairService'
import {localized} from '../../localization/locales'
import LANG_KEYS from '../../localization/keys'
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
import { Api, JsonRpc, RpcError, JsSignatureProvider } from 'eosjs2';
import * as numeric from "eosjs2/dist/eosjs-numeric";
import Token from "../../models/Token";


const mainnetChainId = 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906';

let cachedInstances = {};
const getCachedInstance = network => {
	if(cachedInstances.hasOwnProperty(network.unique())) return cachedInstances[network.unique()];
	else {
		const eos = Eos({httpEndpoint:`${network.fullhost()}`, chainId:network.chainId});
		cachedInstances[network.unique()] = eos;
		return eos;
	}
}


const getAccountsFromPublicKey = async (publicKey, network, process, progressDelta, fallbackToChain = false) => {
	if(network.chainId === mainnetChainId && !fallbackToChain){
		const baseUrl = 'https://api.light.xeos.me/api/key';

		// get from API
		const accountsFromApi = await Promise.race([
			new Promise(resolve => setTimeout(() => resolve(null), 5000)),
			fetch(`${baseUrl}/${publicKey}`).then(r => r.json()).then(res => {
				const rawAccounts = res.eos.accounts;
				let accounts = [];
				Object.keys(rawAccounts).map(name => {
					rawAccounts[name].map(acc => {
						accounts.push({name, authority: acc.perm})
					})
				});
				return accounts;
			}).catch(err => {
				return null;
			})
		]);

		if(!accountsFromApi) return getAccountsFromPublicKey(publicKey, network, process, progressDelta, true);
		else return accountsFromApi;
	}


	return Promise.race([
		new Promise(resolve => setTimeout(() => resolve([]), 20000)),
		new Promise((resolve, reject) => {
			const eos = getCachedInstance(network);
			if(process) process.subTitle = `Fetching accounts from ${network.name}`;
			eos.getKeyAccounts(publicKey).then(res => {
				if(process) process.updateProgress(progressDelta/3);
				if(!res || !res.hasOwnProperty('account_names')){ resolve([]); return false; }
				const {account_names} = res;

				const originalTitle = process.title;
				const setProcessTitle = () => {
					if(process) process.subTitle = `Importing ${account_names.length} accounts from ${network.name}`;
				};
				setProcessTitle();

				const perAccountProgress = progressDelta ? (progressDelta/3) / account_names.length : 0;

				Promise.all(account_names.map(async name => {
					const data = await eos.getAccount(name).catch(e => resolve([]))
					setProcessTitle(true);
					if(process) process.updateProgress(perAccountProgress);
					return data;
				})).then(multires => {
					let accounts = [];
					multires.map(account => {
						account.permissions.map(perm => {
							if(!!perm.required_auth.keys.find(x => x.key === publicKey)) {
								accounts.push({name: account.account_name, authority: perm.perm_name})
							}
						});
					});
					resolve(accounts)
				}).catch(e => resolve([]));
			}).catch(e => resolve([]));
		})
	])
};

const EXPLORER = {
	"name":"Bloks",
	"account":"https://bloks.io/account/{x}",
	"transaction":"https://bloks.io/transaction/{x}",
	"block":"https://bloks.io/block/{x}"
};




export default class EOS extends Plugin {

	constructor(){ super(Blockchains.EOSIO, PluginTypes.BLOCKCHAIN_SUPPORT) }
	defaultExplorer(){ return EXPLORER; }
	accountFormatter(account){ return `${account.name}@${account.authority}` }
	returnableAccount(account){ return { name:account.name, authority:account.authority, publicKey:account.publicKey, blockchain:Blockchains.EOSIO }}

	forkSupport(){
		return true;
	}

	contractPlaceholder(){ return 'eosio.token'; }
	recipientLabel(){ return 'Account Name'; } // TODO: Localize

	async getEndorsedNetwork(){
		return new Promise((resolve, reject) => {
			resolve(new Network(
				'EOS Mainnet', 'https',
				'nodes.get-scatter.com',
				443,
				Blockchains.EOSIO,
				mainnetChainId
			));
		});
	}

	async isEndorsedNetwork(network){
		return network.blockchain === Blockchains.EOSIO && network.chainId === mainnetChainId;
	}

	async getChainId(network){
		const eos = Eos({httpEndpoint:network.fullhost()});
		return eos.getInfo({}).then(x => x.chain_id || '').catch(() => '');
	}

	usesResources(){ return true; }

	async refund(account){
		return new Promise(async (resolve, reject) => {
			const signProvider = payload => this.passThroughProvider(payload, account, reject);
			const network = account.network();
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
			return await eos.refund(account.name, {authorization:[account.formatted()]})
				.catch(error => resolve(console.error(error)))
				.then(res => resolve(res));
		})
	}

	async getResourcesFor(account){
		const data = await this.accountData(account);
		if(!data || !data.hasOwnProperty('cpu_limit') || !data.cpu_limit.hasOwnProperty('available')) return [];

		let refund;
		if(data.hasOwnProperty('refund_request') && data.refund_request){
			const threeDays = (86400*3*1000);
			const percentage = ((+new Date() - +new Date(data.refund_request.request_time)) * 100) / threeDays;
			refund = {
				name:'Refund',
				text:(new Date((+new Date(data.refund_request.request_time)) + (86400*3*1000))).toLocaleDateString(),
				percentage,
				actionable:percentage >= 100,
				actionText:localized(LANG_KEYS.KEYPAIR.ACCOUNTS.EOSClaimRefundButton, null, store.getters.language),
			}
		}

		const actionText = localized(LANG_KEYS.KEYPAIR.ACCOUNTS.EOSManageResourceButton, null, store.getters.language);
		const resources = [{
			name:'CPU',
			available:data.cpu_limit.available,
			max:data.cpu_limit.max,
			percentage:(data.cpu_limit.used * 100) / data.cpu_limit.max,
			actionable:true,
			actionText,
		},{
			name:'NET',
			available:data.net_limit.available,
			max:data.net_limit.max,
			percentage:(data.net_limit.used * 100) / data.net_limit.max,
			actionable:true,
			actionText,
		},{
			name:'RAM',
			available:data.ram_usage,
			max:data.ram_quota,
			percentage:(data.ram_usage * 100) / data.ram_quota,
			actionable:true,
			actionText,
		}];

		if(refund) resources.push(refund);

		return resources;
	}

	async moderateResource(resource, account){
		return new Promise(async resolve => {
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

			if(name === 'Refund') {
				resolve(await this.refund(account));
			}

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
	getImportableAccounts(keypair, network, process, progressDelta){
		return new Promise((resolve, reject) => {
			let publicKey = keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO);
			if(!publicKey) return resolve([]);
			publicKey = publicKey.key;
			getAccountsFromPublicKey(publicKey, network, process, progressDelta).then(accounts => {
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
	validPrivateKey(privateKey){ return privateKey.length >= 50 && ecc.isValidPrivate(privateKey); }
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

	async accountData(account, network = null, accountName = null){

		const getAccount = () => {
			return fetch(`${network ? network.fullhost() : account.network().fullhost()}/v1/chain/get_account`, {
				method: 'POST',
				body: JSON.stringify({account_name:accountName ? accountName : account.name})
			})
				.then(res => res.json())
		};

		return Promise.race([
			new Promise(resolve => setTimeout(() => resolve(null), 2000)),
			getAccount()
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
	defaultToken(){ return new Token(Blockchains.EOSIO, 'eosio.token', 'EOS', 'EOS', this.defaultDecimals()) }

	async getSystemSymbol(network){
		return this.accountData(null, network, 'eosio.stake')
			.then(res => res.core_liquid_balance.split(' ')[1])
			.catch(err => {
				console.error(err);
				return null
			});
	}

	async getRamPrice(network, eos = null){
		if(!eos) eos = getCachedInstance(network);

		const parseAsset = asset => asset.split(' ')[0];
		const getRamInfo = async () => eos.getTableRows({
			json:true,
			code:'eosio',
			scope:'eosio',
			table:'rammarket'
		}).then(res => {
			const ramInfo = res.rows[0];
			return [parseAsset(ramInfo.quote.balance), parseAsset(ramInfo.base.balance)];
		});

		const ramInfo = await getRamInfo();
		return (ramInfo[0] / ramInfo[1]).toFixed(8);
	}

	async createAccount(creator, name, owner, active, eosUsed){
		return new Promise(async (resolve, reject) => {
			const network = creator.network();
			const signProvider = payload => this.passThroughProvider(payload, creator, reject);
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});

			const coreSymbol = await this.getSystemSymbol(network);
			if(!coreSymbol) return reject(`Couldn't get core symbol`);

			const ramPrice = await this.getRamPrice(null, eos);
			if(!ramPrice) return reject(`Couldn't get RAM price`);

			const net = (eosUsed/4).toFixed(4);
			const cpu = (eosUsed-net).toFixed(4);

			if(net <= 0 || cpu <= 0) return reject(`Either CPU or NET was below or equal to 0`);

			eos.transaction(tr => {
				tr.newaccount({
					creator: creator.name,
					name: name,
					owner,
					active
				});
				tr.buyrambytes({
					payer:creator.name,
					receiver:name,
					bytes:4096
				});
				tr.delegatebw({
					from: creator.name,
					receiver: name,
					stake_net_quantity: `${net} ${coreSymbol}`,
					stake_cpu_quantity: `${cpu} ${coreSymbol}`,
					transfer: 1
				})
			})
				.then(trx => resolve(trx.transaction_id))
				.catch(err => reject(err));
		})
	}

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
					keypair.external.interface.setAddressIndex(keypair.external.addressIndex);
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
			const signProvider = payload => this.passThroughProvider(payload, account, reject);

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

			if(transaction.hasOwnProperty('delay_sec') && parseInt(transaction.delay_sec) > 0){
				data.delay_sec = transaction.delay_sec;
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

		const rpc = new JsonRpc(network.fullhost());
		const api = new Api({rpc});

		const contracts = ObjectHelpers.distinct(transaction.abis.map(x => {
			if(x.hasOwnProperty('account_name')) return x.account_name;
			return x.accountName;
		}));

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
