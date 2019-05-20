import Plugin from '../Plugin';
import * as PluginTypes from '../PluginTypes';
import {Blockchains} from '../../models/Blockchains'
import Network from '../../models/Network'
import Account from '../../models/Account'
import KeyPairService from '../../services/secure/KeyPairService'
import {localized, localizedState} from '../../localization/locales'
import LANG_KEYS from '../../localization/keys'
import Eos from 'eosjs'
let {ecc} = Eos.modules;
import ObjectHelpers from '../../util/ObjectHelpers'
import {Popup} from '../../models/popups/Popup'
import PopupService from '../../services/utility/PopupService'
import StorageService from '../../services/utility/StorageService'
import * as Actions from '../../models/api/ApiActions';
import * as StoreActions from '../../store/constants'
import { Api, JsonRpc, RpcError, JsSignatureProvider } from 'eosjs2';
import * as numeric from "eosjs2/dist/eosjs-numeric";
import Token from "../../models/Token";
import AccountAction from "../../models/AccountAction";
import AccountService from "../../services/blockchain/AccountService";
import HardwareService from "../../services/secure/HardwareService";
import HistoricAction from "../../models/histories/HistoricAction";
import StoreService from "../../services/utility/StoreService";


const blockchainApiURL = 'https://api.light.xeos.me/api';
const mainnetChainId = 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906';

class EosTokenAccountAPI {
	constructor(){}

	static async getAccountsFromPublicKey(publicKey){
		return await Promise.race([
			new Promise(resolve => setTimeout(() => resolve(null), 5000)),
			fetch(`${blockchainApiURL}/key/${publicKey}`).then(r => r.json()).then(res => {
				if(!res.eos) return null;
				const rawAccounts = res.eos.accounts;
				let accounts = [];
				Object.keys(rawAccounts).map(name => {
					rawAccounts[name]
						.filter(acc => {
							return acc.auth.keys.some(({pubkey}) => pubkey === publicKey);
						})
						.map(acc => {
							accounts.push({name, authority: acc.perm})
						})
				});
				return accounts;
			}).catch(err => {
				console.error('err', err);
				return null;
			})
		])
	}

	static async getAllTokens(account){
		return await Promise.race([
			new Promise(resolve => setTimeout(() => resolve(null), 5000)),
			fetch(`${blockchainApiURL}/account/eos/${account.sendable()}`).then(r => r.json()).then(res => {
				return res.balances.map(balance => {
					return Token.fromJson({
						blockchain:Blockchains.EOSIO,
						contract:balance.contract,
						symbol:balance.currency,
						name:balance.currency,
						amount:balance.amount,
						decimals:balance.decimals,
						chainId:account.network().chainId
					})
				});
			}).catch(err => {
				return null;
			})
		])
	}
}

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
		const accountsFromApi = await EosTokenAccountAPI.getAccountsFromPublicKey(publicKey);
		if(!accountsFromApi) return getAccountsFromPublicKey(publicKey, network, process, progressDelta, true);
		else return accountsFromApi;
	}

	return Promise.race([
		new Promise(resolve => setTimeout(() => resolve([]), 20000)),
		new Promise((resolve, reject) => {
			const eos = getCachedInstance(network);
			if(process) process.setSubTitle(localizedState(LANG_KEYS.PROCESSES.FetchAccountsFromNetwork, network.name));
			eos.getKeyAccounts(publicKey).then(res => {
				if(process) process.updateProgress(progressDelta/3);
				if(!res || !res.hasOwnProperty('account_names')){ resolve([]); return false; }
				const {account_names} = res;

				const setProcessTitle = () => {
					if(process) process.setSubTitle(localizedState(LANG_KEYS.PROCESSES.ImportingAccountsFromNetwork, [account_names.length, network.name]));
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



const popupError = result => {
	const json = JSON.parse(result);
	let error;
	if(json.hasOwnProperty('error') && json.error.hasOwnProperty('details') && json.error.details.length) {
		error = ({error: JSON.parse(result).error.details[0].message.replace('assertion failure with message:', '').trim()});
	} else error = result;

	PopupService.push(Popup.prompt('Transaction Error', error));
}



const EXPLORER = {
	"name":"Bloks",
	"account":"https://bloks.io/account/{x}",
	"transaction":"https://bloks.io/transaction/{x}",
	"block":"https://bloks.io/block/{x}"
};




export default class EOS extends Plugin {

	constructor(){ super(Blockchains.EOSIO, PluginTypes.BLOCKCHAIN_SUPPORT) }

	bustCache(){ cachedInstances = {}; }
	defaultExplorer(){ return EXPLORER; }
	accountFormatter(account){ return `${account.name}@${account.authority}` }
	returnableAccount(account){ return { name:account.name, authority:account.authority, publicKey:account.publicKey, blockchain:Blockchains.EOSIO }}

	contractPlaceholder(){ return 'eosio.token'; }
	recipientLabel(){ return localizedState(LANG_KEYS.GENERIC.AccountName); }

	checkNetwork(network){
		return Promise.race([
			new Promise(resolve => setTimeout(() => resolve(null), 2000)),
			fetch(`${network.fullhost()}/v1/chain/get_info`).then(() => true).catch(() => false),
		])
	}

	getEndorsedNetwork(){
		return new Network('EOS Mainnet', 'https', 'nodes.get-scatter.com', 443, Blockchains.EOSIO, mainnetChainId)
	}

	isEndorsedNetwork(network){
		return network.blockchain === Blockchains.EOSIO && network.chainId === mainnetChainId;
	}

	async getChainId(network){
		const eos = Eos({httpEndpoint:network.fullhost()});
		return eos.getInfo({}).then(x => x.chain_id || '').catch(() => '');
	}

	usesResources(){ return true; }
	hasAccountActions(){ return true; }

	async proxyVote(account, proxyAccount, prompt = false){
		return new Promise(async (resolve, reject) => {
			const signProvider = prompt
				? payload => this.signerWithPopup(payload, account, reject)
				: payload => this.signer(payload, account.publicKey);
			const network = account.network();
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
			return await eos.voteproducer(account.name, proxyAccount, [], {authorization:[account.formatted()]})
				.catch(res => reject(popupError(res)))
				.then(res => {
					const history = new HistoricAction(account, 'proxy', res.transaction_id);
					StoreService.get().dispatch(StoreActions.DELTA_HISTORY, history);
					resolve(res);
				})
		})

	}

	async changePermissions(account, keys){
		if(!keys) return;
		return new Promise(async (resolve, reject) => {
			const signProvider = payload => this.signerWithPopup(payload, account, reject);
			const network = account.network();
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});


			const perms = Object.keys(keys).map(permission => {
				if(!keys[permission] || !keys[permission].length) return;

				const keyOrAccount = keys[permission];
				let auth = {
					accounts:[],
					keys:[],
					threshold:1,
					waits:[],
				};

				// Public Key
				if(this.validPublicKey(keyOrAccount)) auth.keys.push({
					key:keyOrAccount,
					weight:1
				});

				// Account
				else {
					const [actor, perm] = keyOrAccount.split('@');
					auth.accounts.push({
						actor,
						permission:perm ? perm : 'active'
					})
				}

				const parent = permission === 'owner' ? '' : 'owner';

				return {
					account:account.name,
					permission,
					parent,
					auth,
				}
			}).filter(x => !!x);

			const hasOwner = (keys.hasOwnProperty('owner') && keys.owner.length) || account.authorities().map(x => x.authority).includes('owner');
			const options = {authorization:[`${account.name}@${hasOwner?'owner':'active'}`]};
			return eos.transaction(tr => perms.map(perm => tr.updateauth(perm, options)))
				.catch(res => {
					popupError(res);
					reject(false)
				})
				.then(async res => {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, res.transaction_id));

					const authorities = Object.keys(keys).filter(x => keys[x].length);
					const accounts = StoreService.get().getters.accounts.filter(x => x.identifiable() === account.identifiable() && authorities.includes(x.authority));
					await AccountService.removeAccounts(accounts);

					const addAccount = async (keypair, authority) => {
						const acc = account.clone();
						acc.publicKey = keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key,
						acc.keypairUnique = keypair.unique();
						acc.authority = authority;
						return AccountService.addAccount(acc);
					};

					const activeKeypair = StoreService.get().state.scatter.keychain.getKeyPairByPublicKey(keys.active);
					const ownerKeypair = StoreService.get().state.scatter.keychain.getKeyPairByPublicKey(keys.owner);
					if(activeKeypair) await addAccount(activeKeypair, 'active');
					if(ownerKeypair) await addAccount(ownerKeypair, 'owner');
					const history = new HistoricAction(account, 'permissions', res.transaction_id);
					StoreService.get().dispatch(StoreActions.DELTA_HISTORY, history);
					resolve(true)
				});
		})

	}

	accountActions(account){
		const accounts = StoreService.get().state.scatter.keychain.accounts.filter(x => x.identifiable() === account.identifiable() && x.keypairUnique === account.keypairUnique);

		const {EOS} = LANG_KEYS.KEYPAIR.ACCOUNTS.ACTIONS;


		let availableActions = [
			new AccountAction(localizedState(EOS.UnlinkAccountButton, null), 'Unlink', 'icon-trash', () => new Promise(resolve => {
				PopupService.push(Popup.unlinkAccount(account, removed => resolve(removed)));
			}))
		];

		const nonWatchActions = [
			new AccountAction(localizedState(EOS.ChangePermissionsButton, null), 'Change', 'icon-key', () => new Promise(resolve => {
				PopupService.push(Popup.verifyPassword(verified => {
					if(!verified) return resolve(false);
					PopupService.push(Popup.eosChangePermissions(account, async permissions => {
						resolve(await this.changePermissions(account, permissions));
					}));
				}));
			}), true),
			new AccountAction(localizedState(EOS.ProxyVotesButton, null), 'Proxy', 'icon-heart-1', () => new Promise(resolve => {
				PopupService.push(Popup.eosProxyVotes(account, () => resolve(true)));
			})),
			new AccountAction('Create Account', 'Create', 'icon-user-add', () => new Promise(resolve => {
				PopupService.push(Popup.eosCreateAccount(account, () => resolve(true)));
			})),
		];

		// Adding owner only actions.
		if(accounts.some(x => x.authority !== 'watch'))
			availableActions = nonWatchActions.concat(availableActions);

		return availableActions;
	}

	async refund(account){
		return new Promise(async (resolve, reject) => {
			const signProvider = payload => this.signerWithPopup(payload, account, reject);
			const network = account.network();
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
			return await eos.refund(account.name, {authorization:[account.formatted()]})
				.catch(res => reject(popupError(res)))
				.then(res => {
					const history = new HistoricAction(account, 'refund', res.transaction_id);
					StoreService.get().dispatch(StoreActions.DELTA_HISTORY, history);
					resolve(res)
				});
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
				actionText:localizedState(LANG_KEYS.KEYPAIR.ACCOUNTS.EOSClaimRefundButton, null),
			}
		}

		const actionText = localizedState(LANG_KEYS.GENERIC.Manage, null);
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

			const returnResult = tx => resolve(tx)

			if(['CPU', 'NET'].includes(name))
				PopupService.push(Popup.eosModerateCpuNet(account, returnResult));

			if(name === 'RAM')
				PopupService.push(Popup.eosModerateRam(account, returnResult));

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
		const symbol = account.network().systemToken().symbol;
		return await eos.delegatebw(account.name, account.name, `0.0000 ${symbol}`, `0.1000 ${symbol}`, 0, { authorization:[account.formatted()] })
			.catch(res => {
				popupError(res);
				return false;
			})
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

	isValidRecipient(name){ return /(^[a-z1-5]{1}([a-z1-5.]{0,10}[a-z1-5])?$)/g.test(name); }
	privateToPublic(privateKey, prefix = null){ return ecc.PrivateKey(privateKey).toPublic().toString(prefix ? prefix : Blockchains.EOSIO.toUpperCase()); }
	validPrivateKey(privateKey){ return privateKey.length >= 50 && ecc.isValidPrivate(privateKey); }
	validPublicKey(publicKey, prefix = null){
		try {
			return ecc.PublicKey.fromStringOrThrow(publicKey, prefix ? prefix : Blockchains.EOSIO.toUpperCase());
		} catch(e){
			return false;
		}
	}

	randomPrivateKey(){ return ecc.randomKey(); }

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

	hasUntouchableTokens(){ return true; }
	async untouchableBalance(account){
		const getCpuAndNet = async () => {
			const accData = await this.accountData(account).catch(() => null);
			if(!accData || !accData.hasOwnProperty('self_delegated_bandwidth') || !accData.self_delegated_bandwidth) return null;
			const token = account.network().systemToken().clone();
			token.amount = parseFloat(parseFloat(accData.self_delegated_bandwidth.cpu_weight.split(' ')[0]) + parseFloat(accData.self_delegated_bandwidth.net_weight.split(' ')[0])).toFixed(token.decimals);
			token.unusable = 'CPU / NET';
			return token;
		}

		const getRex = async () => {
			if(account.network().chainId !== mainnetChainId) return null;
			return fetch(`${account.network().fullhost()}/v1/chain/get_table_rows`, {
				method:"POST",
				body:JSON.stringify({
					code: "eosio",
					index_position: 1,
					json: true,
					limit: 1,
					lower_bound: account.name,
					scope: "eosio",
					table: "rexbal",
				})
			}).then(x => x.json()).then(result => {
				if(!result) return null;
				const rex = result.rows[0];
				if(rex.owner !== account.name) return null;
				const token = account.network().systemToken().clone();
				token.symbol = 'REX';
				token.amount = parseFloat(rex.rex_balance.split(' ')[0]).toFixed(4);
				token.unusable = 'REX';
				return token;
			}).catch(() => null)
		}

		const cpunet = await getCpuAndNet();
		const rex = await getRex();
		return [cpunet, rex].filter(x => !!x);
	}

	async balanceFor(account, token){
		const eos = getCachedInstance(account.network());

		const balances = await Promise.race([
			new Promise(resolve => setTimeout(() => resolve([]), 10000)),
			eos.getTableRows({
				json:true,
				code:token.contract,
				scope:account.name,
				table:'accounts',
				limit:500
			}).then(res => res.rows).catch(() => [])
		]);

		const row = balances.find(row => row.balance.split(" ")[1].toLowerCase() === token.symbol.toLowerCase());
		return row ? row.balance.split(" ")[0] : 0;
	}

	async balancesFor(account, tokens, fallback = false){
		if(!fallback && this.isEndorsedNetwork(account.network())){
			const balances = await EosTokenAccountAPI.getAllTokens(account);
			if(!balances) return this.balanceFor(account, tokens, true);
			const blacklist = StoreService.get().getters.blacklistTokens.filter(x => x.blockchain === Blockchains.EOSIO).map(x => x.unique());
			return balances.filter(x => !blacklist.includes(x.unique()));
		}


		return (await Promise.all(tokens.map(async token => {
			const t = token.clone();
			t.amount = await this.balanceFor(account, token);
			t.chainId = account.network().chainId;
			return t;
		})));
	}

	defaultDecimals(){ return 4; }
	defaultToken(){ return new Token(Blockchains.EOSIO, 'eosio.token', 'EOS', 'EOS', this.defaultDecimals(), 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906') }

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
			const signProvider = payload => this.signerWithPopup(payload, creator, reject);
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});

			const coreSymbol = network.systemToken().symbol;

			const net = (eosUsed/4).toFixed(creator.network().systemToken().decimals);
			const cpu = (eosUsed-net).toFixed(creator.network().systemToken().decimals);

			if(net <= 0 || cpu <= 0) return reject(localizedState(LANG_KEYS.CREATE_EOS.ERRORS.InvalidResources, null));

			const options = {authorization:[creator.formatted()]};

			eos.transaction(tr => {
				tr.newaccount({
					creator: creator.name,
					name: name,
					owner,
					active
				}, options);
				tr.buyrambytes({
					payer:creator.name,
					receiver:name,
					bytes:4096
				}, options);
				tr.delegatebw({
					from: creator.name,
					receiver: name,
					stake_net_quantity: `${net} ${coreSymbol}`,
					stake_cpu_quantity: `${cpu} ${coreSymbol}`,
					transfer: 1
				}, options)
			}, options)
				.then(trx => resolve(trx.transaction_id))
				.catch(res => {
					popupError(res);
					reject(false);
				});
		})
	}


	async stakeOrUnstake(account, cpu, net, network, staking = true){
		return new Promise(async (resolve, reject) => {
			const signProvider = payload => this.signerWithPopup(payload, account, reject);

			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
			if(staking) resolve(await eos.delegatebw(account.name, account.name, net, cpu, 0, { authorization:[account.formatted()] })
				.then(res => res)
				.catch(res => {
					popupError(res);
					return false;
				}))

			else resolve(await eos.undelegatebw(account.name, account.name, net, cpu, { authorization:[account.formatted()] })
				.then(res => res)
				.catch(res => {
					popupError(res);
					return false;
				}))
		})
	}

	async buyOrSellRAM(account, bytes, network, buying = true){
		return new Promise(async (resolve, reject) => {
			const signProvider = payload => this.signerWithPopup(payload, account, reject);

			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});

			if(buying) resolve(await eos.buyrambytes(account.name, account.name, bytes, { authorization:[account.formatted()] })
				.then(res => res)
				.catch(res => {
					popupError(res);
					return false;
				}))

			else resolve(await eos.sellram(account.name, bytes, { authorization:[account.formatted()] })
				.then(res => res)
				.catch(res => {
					popupError(res);
					return false;
				}))
		})
	}

	async transfer({account, to, amount, token, memo, promptForSignature = true}){
		if(!this.isValidRecipient(to)) return {error:'Invalid recipient account name'};

		amount = parseFloat(amount).toFixed(token.decimals);
		const {contract, symbol} = token;
		return new Promise(async (resolve, reject) => {
			const signProvider = promptForSignature
				? payload => this.signerWithPopup(payload, account, reject)
				: payload => this.signer(payload, account.publicKey, false, false, account);

			const eos = Eos({httpEndpoint:account.network().fullhost(), chainId:account.network().chainId, signProvider});
			const contractObject = await eos.contract(contract);
			const amountWithSymbol = amount.indexOf(symbol) > -1 ? amount : `${amount} ${symbol}`;
			resolve(await contractObject.transfer(account.name, to, amountWithSymbol, memo, { authorization:[account.formatted()] })
				.catch(error => {
					console.error('error', error);
					try {
						return {error:JSON.parse(error).error.details[0].message.replace('assertion failure with message:', '').trim()}
					} catch(e){
						return {error};
					}
				})
				.then(result => result));
		})
	}



	async signerWithPopup(payload, accounts, rejector){
		return new Promise(async resolve => {

			if(accounts instanceof Account){
				accounts = [accounts];
			}


			payload.messages = await this.requestParser(payload, Network.fromJson(accounts[0].network()));
			if(!payload.messages) return rejector({error:'Error re-parsing transaction buffer'});
			payload.identityKey = StoreService.get().state.scatter.keychain.identities[0].publicKey;
			payload.participants = accounts;
			payload.network = accounts[0].network();
			payload.origin = 'Scatter';
			const request = {
				payload,
				origin:payload.origin,
				blockchain:'eos',
				requiredFields:{},
				type:Actions.SIGN,
				id:1,
			}

			PopupService.push(Popup.popout(request, async ({result}) => {
				if(!result || (!result.accepted || false)) return rejector({error:'Could not get signature'});

				let signatures = [];
				for(let i = 0; i < accounts.length; i++){
					let account = accounts[i];
					signatures.push(await this.signer(KeyPairService.isHardware(account.publicKey) ? payload : {data:payload.buf}, account.publicKey, true, false, account));

					if(signatures.length !== i+1) return rejector({error:'Could not get signature'});
				}

				signatures = signatures.reduce((acc,x) => {
					if(!acc.includes(x)) acc.push(x);
					return acc;
				}, []);

				resolve(signatures);
			}, true));
		})
	}

	async signer(payload, publicKey, arbitrary = false, isHash = false, account = null){
		if(account && KeyPairService.isHardware(publicKey))
			return await HardwareService.sign(account, payload);

		let privateKey = await KeyPairService.publicToPrivate(publicKey);
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
					console.error('err', e);
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
		try {
			const {transaction} = payload;

			const eos = getCachedInstance(network);

			const contracts = ObjectHelpers.distinct(transaction.actions.map(action => action.account));
			const abis = await this.getAbis(contracts, network, eos);

			const results = await Promise.all(transaction.actions.map(async (action, index) => {
				const contractAccountName = action.account;

				let abi = abis[contractAccountName];

				const typeName = abi.abi.actions.find(x => x.name === action.name).type;
				const data = abi.fromBuffer(typeName, action.data);
				const actionAbi = abi.abi.actions.find(fcAction => fcAction.name === action.name);
				let ricardian = actionAbi ? actionAbi.ricardian_contract : null;
				eos.fc.abiCache.abi(contractAccountName, abi.abi);

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

			if(results.length !== transaction.actions.length){
				console.error(`Invalid parsed actions, message array doesn't match actions length.`, transaction);
			}

			if(!transaction.hasOwnProperty('max_net_usage_words')) transaction.max_net_usage_words = 0;
			payload.buf = Buffer.concat([Buffer.from(network.chainId, 'hex'), eos.fc.toBuffer("transaction", transaction), Buffer.from(new Uint8Array(32))]);

			return results;
		} catch(e){
			console.error(e);
			return null;
		}
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
		});

		payload.buf = Buffer.concat([
			new Buffer(transaction.chainId, "hex"),         // Chain ID
			buffer,                                         // Transaction
			new Buffer(new Uint8Array(32)),                 // Context free actions
		]);

		payload.transaction.parsed = Object.assign({}, parsed);
		payload.transaction.parsed.actions = await api.serializeActions(parsed.actions);
		delete payload.transaction.abis;

		return parsed.actions;
	}

	async requestParser(payload, network){
		if(payload.transaction.hasOwnProperty('serializedTransaction'))
			return this.parseEosjs2Request(payload, network);
		else return this.parseEosjsRequest(payload, network);
	}
}
