import ridl, {FRAG_TYPES} from 'ridl';
import Network from "@walletpack/core/models/Network";
import murmur from 'murmurhash';
import PluginRepository from "@walletpack/core/plugins/PluginRepository";
import {Blockchains} from "@walletpack/core/models/Blockchains";
import * as Actions from "@walletpack/core/store/constants";
import NetworkService from "@walletpack/core/services/blockchain/NetworkService";
import Keypair from "@walletpack/core/models/Keypair";
import KeyPairService from "@walletpack/core/services/secure/KeyPairService";
import IdGenerator from "@walletpack/core/util/IdGenerator";
import AccountService from "@walletpack/core/services/blockchain/AccountService";
import PopupService from "../../services/utility/PopupService";
import {Popup} from "../../models/popups/Popup";
import Account from "@walletpack/core/models/Account";
import ecc from 'eosjs-ecc';
import StoreService from "@walletpack/core/services/utility/StoreService";

export const RIDL_API = `https://api.ridl.network/v1`;

const RIDL_NET_NAME = `RIDL Network`;
export let network;

const finger = x => murmur.v2(x);

//TODO: GET FROM API
const dangerFrags = [
	finger('scam'),
	finger('dangerous'),
	finger('privacy'),
];

let dangerFragTypes = null;
const fillFrags = async reputable => {
	const fragments = reputable.reputation.fragments.filter(x => dangerFrags.includes(x.fingerprint));
	const fragTypes = !dangerFragTypes ? await ridl.reputation.getFragmentsFor(reputable) : dangerFragTypes;

	fragments.map(frag => {
		const typed = fragTypes.find(x => x.fingerprint === frag.fingerprint);
		frag.upTag = typed ? typed.upTag : 'good';
		frag.downTag = typed ? typed.downTag : 'bad';
	});

	return fragments;
};

const fetchChainId = network => {
	return fetch(`${network.fullhost()}/v1/chain/get_info`).then(x => x.json()).then(x => x.chain_id).catch(() => null);
};

let isConnected = false;
let checkedAccounts = false;
export default class RIDLService {

	static async init(){
		if(isConnected) return;
		const n = await fetch(`${RIDL_API}/network`).then(x => x.json()).then(x => Network.fromJson(x)).catch(() => null);
		if(!n) return console.error('Could not fetch RIDL Network');

		n.name = RIDL_NET_NAME;
		n.chainId = await fetchChainId(n);
		network = n;

		await RIDLService.addNetwork();

		await ridl.init(network);
		isConnected = true;
		return true;
	}

	static networkUnique(){
		if(!network) return;
		return network.unique();
	}

	static async hasNetwork(){
		if(!network) await this.init();
		return !!StoreService.get().state.scatter.settings.networks.find(x => x.chainId === network.chainId);
	}

	static async addNetwork(){
		if(await this.hasNetwork()) return true;
		return NetworkService.addNetwork(network, false);
	}

	static async checkAccounts(){
		if(checkedAccounts) return;
		checkedAccounts = true;
		const n = StoreService.get().state.scatter.settings.networks.find(x => x.chainId === network.chainId);
		if(!n) return console.error("No RIDL network found!");

		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const accounts = StoreService.get().state.scatter.keychain.accounts.filter(x => x.networkUnique === n.unique()).reduce((acc, x) => {
			if(acc.find(y => y.name === x.name)) return acc;
			acc.push(x);
			return acc;
		}, []);

		await Promise.all(accounts.map(async account => {
			const data = await plugin.accountData(account, network);
			if(!data) await AccountService.removeAccounts([account]);
			return true;
		}));

		const identity = StoreService.get().state.scatter.keychain.identities[0];
		if(identity.ridl !== -1){
			const exists = await RIDLService.identityNameIsAvailable(identity.name);
			if(!exists || exists.id !== identity.ridl){
				const scatter = StoreService.get().state.scatter.clone();
				scatter.keychain.identities[0].ridl = -1;
				await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
			}
		}

		return true;
	}

	static getAccount(){
		const n = StoreService.get().state.scatter.settings.networks.find(x => x.chainId === network.chainId);
		if(!n) return console.error("No RIDL network found!");
		return StoreService.get().state.scatter.keychain.accounts.find(x => x.networkUnique === n.unique());
	}

	static async checkApp(app){
		if(!StoreService.get().state.scatter.settings.firewall.enabled) return;
		await this.init();
		const reputable = await ridl.reputation.searchByFingerprint(FRAG_TYPES.APPLICATION, app.trim());
		if(!reputable) return;

		const fragments = await fillFrags(reputable);

		return {
			decimal:reputable.decimalReputation(true, dangerFrags),
			fragments,
			reputable
		};
	}

	static async checkContracts(contractNetwork, contracts){
		if(!StoreService.get().state.scatter.settings.firewall.enabled) return;
		await this.init();

		const networkId = `${contractNetwork.blockchain}::${contractNetwork.chainId}`;
		let fragTypes = [];

		const reputables = await Promise.all(contracts.map(({code:contract, type:action}) => {
			return ridl.reputation.searchByFingerprint(FRAG_TYPES.BLOCKCHAIN_ADDR, contract.toLowerCase(), networkId).then(async reputable => {
				reputable.code = contract;
				reputable.decimal = reputable.decimalReputation(true, dangerFrags);
				reputable.children = (await this.getChildren(reputable)).filter(x => x.entity.toLowerCase() === action.toLowerCase());
				reputable.children.map(child => {
					child.code = contract+action;
					child.decimal = child.decimalReputation(true, dangerFrags);
				});
				await fillFrags(reputable);
				return reputable;
			});
		}));

		let total = 0;
		let actionables = [];
		reputables.map(reputable => {
			if(reputable.children.length){
				reputable.children.map(child => {
					total += parseFloat(child.decimal);
					actionables.push(child);
				})
			}
			else {
				total += parseFloat(reputable.decimal);
				actionables.push(reputable);
			}
		});

		return {
			decimal:parseFloat(total).toFixed(1),
			reputables:actionables,
		}

	}

	static async getChildren(reputable){
		await ridl.canConnect()
		return ridl.reputation.searchByParent(reputable.id);
	}

	static isValidName(name){
		return ridl.identity.validName(name);
	}

	static async identityNameIsAvailable(name){
		return ridl.identity.get(name);
	}

	static async setSignatureProvider(reject){
		const account = this.getAccount();
		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const provider = () => payload => {
			return plugin.signerWithPopup(payload, account, reject);
		};
		await ridl.init( network, account, provider() );
		return true;
	}

	static async identify(username, publicKey){
		return new Promise(async (resolve, reject) => {
			await this.setSignatureProvider(reject);
			const identified = await ridl.identity.payAndIdentify(username, publicKey).then(() => true).catch(() => false);
			setTimeout(async () => {
				const identity = await ridl.identity.get(username);
				if(!identity) return resolve(false);
				resolve(identity);
			}, 1000);
		})
	}

	static async changeAccount(username, newAccountName){
		return new Promise(async (resolve, reject) => {
			await this.setSignatureProvider(reject);
			const identified = await ridl.identity.changeacc(username, newAccountName).then(() => true).catch(() => false);
			setTimeout(async () => {
				const identity = await ridl.identity.get(username);
				if(!identity) return resolve(false);
				resolve(identity);
			}, 1000);
		})
	}

	static async claim(username, publicKey){
		return new Promise(async (resolve, reject) => {
			await this.setSignatureProvider(reject);
			const plugin = PluginRepository.plugin(Blockchains.EOSIO);
			const signature = await plugin.signer({data:ecc.sha256('ridl')}, publicKey, true, true);
			const identified = await ridl.identity.claim(username, publicKey, signature).then(() => true).catch(() => false);
			resolve(identified);
		})
	}

	static async changeKey(username, publicKey){
		return new Promise(async (resolve, reject) => {
			await this.setSignatureProvider(reject);
			const changed = await ridl.identity.changekey(username, publicKey).then(() => true).catch(() => false);
			resolve(changed);
		})
	}

	static async createAccount(){
		await this.addNetwork();
		const ridlNetwork = StoreService.get().state.scatter.settings.networks.find(x => x.chainId === network.chainId);

		let keypair = StoreService.get().state.scatter.keychain.keypairs.find(x => x.name.indexOf('RIDL Key') > -1);
		if(!keypair){
			keypair = Keypair.placeholder();
			keypair.blockchains = [Blockchains.EOSIO];
			await KeyPairService.generateKeyPair(keypair);
			await KeyPairService.makePublicKeys(keypair);
			keypair.name = `RIDL Key-${IdGenerator.text(5)}`;
			await KeyPairService.saveKeyPair(keypair);
		}

		const publicKey = keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO).key;
		const created = await fetch(`${RIDL_API}/create/${publicKey}`).then(x => x.json());

		if(!created){
			PopupService.push(Popup.snackbar('Could not create account on the RIDL network. Please try again soon.'))
			return false;
		}

		const account = Account.fromJson(created);
		account.networkUnique = ridlNetwork.unique();
		account.keypairUnique = keypair.unique();
		await AccountService.addAccount(account);

		return account;
	}

	static getRidlCycle(){
		const started = 1531720800;
		return Math.floor(((+new Date()/1000 - started) / 3600) / 12);
	}

	static async getRidlContributions(){
		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const network = StoreService.get().state.scatter.settings.networks.find(x => x.chainId === plugin.getEndorsedNetwork().chainId);

		const accounts = StoreService.get().state.scatter.keychain.accounts.filter(x => x.networkUnique === network.unique()).reduce((arr, account) => {
			if(arr.find(x => x.name === account.name)) return arr;
			arr.push(account);
			return arr;
		}, []);

		return (await Promise.all(accounts.map(account => {
			return fetch(`${network.fullhost()}/v1/chain/get_table_rows`, {
				method:"POST",
				body:JSON.stringify({
					json:true,
					code:'scatterfunds',
					scope:account.name,
					table:'claimables'
				})
			}).then(x => x.json()).then(x => {
				return {
					account:account.name,
					rows:x.rows,
				};
			}).catch(error => {
				return {
					account:account.name,
					rows:[],
				};
			})
		}))).filter(x => x.rows.length)


	}

	static async getCycleData(){

		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const network = StoreService.get().state.scatter.settings.networks.find(x => x.chainId === plugin.getEndorsedNetwork().chainId);

		const cycle = this.getRidlCycle();

		return fetch(`${network.fullhost()}/v1/chain/get_table_rows`, {
			method:"POST",
			body:JSON.stringify({
				json:true,
				code:'scatterfunds',
				scope:cycle,
				table:'cycles'
			})
		}).then(x => x.json()).then(x => {
			if(!x.rows.length) return {cycle, tokens:'0.0000 EOS'};
			return x.rows[0];
		}).catch(error => {
			return {cycle, tokens:'0.0000 EOS'};
		})
	}

	static async donateToScatter(account, quantity){

		quantity = parseFloat(quantity.split(' ')[0]).toFixed(4) + ' EOS';

		return new Promise(async (resolve, reject) => {
			const plugin = PluginRepository.plugin(Blockchains.EOSIO);
			const eos = plugin.getSignableEosjs(account, reject);

			await eos.transact({
				actions:[{
					account: 'eosio.token',
					name:'transfer',
					authorization: [{
						actor: account.sendable(),
						permission: account.authority,
					}],
					data:{
						from:account.name,
						to:'scatterfunds',
						quantity,
						memo:'Donated to Scatter'
					},
				}]
			}, {
				blocksBehind: 3,
				expireSeconds: 30,
			})
				.then(trx => {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, trx.transaction_id));
					resolve(trx);
				})
				.catch(res => {
					console.error(error);
					reject(null);
				})
		})
	}

	static async claimRidlTokens(accounts){
		return new Promise(async (resolve, reject) => {
			const plugin = PluginRepository.plugin(Blockchains.EOSIO);
			const eos = plugin.getSignableEosjs(accounts, reject);

			const actions = accounts.map(account => {
				return {
					account: 'scatterfunds',
					name:'claim',
					authorization: [{
						actor: account.sendable(),
						permission: account.authority,
					}],
					data:{
						owner:account.name
					},
				}
			});

			await eos.transact({ actions }, { blocksBehind: 3, expireSeconds: 30, })
				.then(res => {
					PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, res.transaction_id));
					resolve(res);
				}).catch(err => reject(err));
		})
	}

	static async getLastKnownBlock(){
		if(!network) return null;
		const headBlock = await fetch(`${network.fullhost()}/v1/chain/get_info`).then(x => x.json()).then(x => x.head_block_num).catch(() => null);
		const clone = StoreService.get().state.scatter.clone();
		clone.settings.firewall.lastKnownBlock = headBlock;
		return StoreService.get().dispatch(Actions.SET_SCATTER, clone);
	}


}