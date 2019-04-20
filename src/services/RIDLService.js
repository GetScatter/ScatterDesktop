import ridl, {FRAG_TYPES} from 'ridl';
import Network from "../models/Network";
import murmur from 'murmurhash';
import PluginRepository from "../plugins/PluginRepository";
import {Blockchains} from "../models/Blockchains";
import {store} from "../store/store";
import * as Actions from "../store/constants";
import NetworkService from "./NetworkService";
import Keypair from "../models/Keypair";
import KeyPairService from "./KeyPairService";
import IdGenerator from "../util/IdGenerator";
import AccountService from "./AccountService";
import BalanceService from "./BalanceService";
import PopupService from "./PopupService";
import {Popup} from "../models/popups/Popup";
import Account from "../models/Account";
import ecc from 'eosjs-ecc';
import Eos from 'eosjs';
const {format} = Eos.modules;

// export const RIDL_WEB_HOST = `http://localhost:8081`;
export const RIDL_WEB_HOST = `https://api.ridl.network`;
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
		return network.unique();
	}

	static async hasNetwork(){
		if(!network) await this.init();
		return !!store.state.scatter.settings.networks.find(x => x.chainId === network.chainId);
	}

	static async addNetwork(){
		if(await this.hasNetwork()) return true;
		return NetworkService.addNetwork(network, false);
	}

	static async checkAccounts(){
		if(checkedAccounts) return;
		checkedAccounts = true;
		const n = store.state.scatter.settings.networks.find(x => x.chainId === network.chainId);
		if(!n) return console.error("No RIDL network found!");

		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const accounts = store.state.scatter.keychain.accounts.filter(x => x.networkUnique === n.unique()).reduce((acc,x) => {
			if(acc.find(y => y.name === x.name)) return acc;
			acc.push(x);
			return acc;
		}, []);
		return await Promise.all(accounts.map(async account => {
			const data = await plugin.accountData(account, network);
			if(!data) await AccountService.removeAccounts([account]);
			return true;
		}));
	}

	static getAccount(){
		const n = store.state.scatter.settings.networks.find(x => x.chainId === network.chainId);
		if(!n) return console.error("No RIDL network found!");
		return store.state.scatter.keychain.accounts.find(x => x.networkUnique === n.unique());
	}

    static async checkApp(app){
		if(!store.state.scatter.settings.firewall.enabled) return;
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
	    if(!store.state.scatter.settings.firewall.enabled) return;
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
		const ridlNetwork = store.state.scatter.settings.networks.find(x => x.chainId === network.chainId);

		let keypair = store.state.scatter.keychain.keypairs.find(x => x.name.indexOf('RIDL Key') > -1);
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
		const encoded = str => format.encodeName(str, false);
		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const network = store.state.scatter.settings.networks.find(x => x.chainId === plugin.getEndorsedNetwork().chainId);

		const accounts = store.state.scatter.keychain.accounts.filter(x => x.networkUnique === network.unique()).reduce((arr,account) => {
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
					scope:encoded(account.name),
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
		const network = store.state.scatter.settings.networks.find(x => x.chainId === plugin.getEndorsedNetwork().chainId);

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
			const network = store.state.scatter.settings.networks.find(x => x.chainId === plugin.getEndorsedNetwork().chainId);
			const provider = async payload => plugin.signerWithPopup(payload, account, reject);
			const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider:provider});

			eos.transfer(account.name, 'scatterfunds', quantity, 'Donated to Scatter', {authorization:[`${account.name}@${account.authority}`]}).then(trx => {
				resolve(trx);
			}).catch(error => {
				console.error(error);
				reject(null);
			})
		})
	}

	static async getLastKnownBlock(){
		if(!network) return null;
		const headBlock = await fetch(`${network.fullhost()}/v1/chain/get_info`).then(x => x.json()).then(x => x.head_block_num).catch(() => null);
		const clone = store.state.scatter.clone();
		clone.settings.firewall.lastKnownBlock = headBlock;
		return store.dispatch(Actions.SET_SCATTER, clone);
	}


}