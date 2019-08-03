import Eos from 'eosjs';
const {ecc} = Eos.modules;
import murmur from 'murmurhash';
import {Blockchains} from "../../models/Blockchains";
import PluginRepository from "../../plugins/PluginRepository";

import {remote} from '../../util/ElectronHelpers';
import BackendApiService from "../apis/BackendApiService";
const NodeMachineId = () => remote ? remote.getGlobal('appShared').NodeMachineId : null;

const fingerprinted = s => murmur.v2(s);

export default class EosAccountService {

	static async allowsFreeAccounts(network){
		const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});
		const getRows = id => {
			return eos.getTableRows({
				json:true,
				code:'createbridge',
				scope:'createbridge',
				table:'balances',
				lower_bound:fingerprinted(id)
			}).then(x => {
				return x.rows.length && parseFloat(x.rows[0].balance.split(' ')[0]) > 2
			}).catch(() => false);
		};

		if(await getRows('get-scatter.com::free')) return true;
		if(await getRows('free')) return true;
		return false;
	}

	static async getMachineId(){
		return await NodeMachineId().machineId();
	}

	static async canMakeFreeAccount(id){
		return await BackendApiService.checkMachineId(id).catch(error => ({error}));
	}

	static async createAccount(key, name, free = false){
		const machineId = await this.getMachineId();
		const plugin = PluginRepository.plugin(Blockchains.EOSIO);
		const signature = await plugin.signer({data:ecc.sha256(free ? key+machineId+name : key)}, key, true, true);

		const payload = { signature, key, name, machineId, free };
		return await BackendApiService.createAccount(payload).catch(error => ({error}));
	}

}