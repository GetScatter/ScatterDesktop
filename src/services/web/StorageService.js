import {RUNNING_TESTS, TestStore} from "scatter-core/util/TestingHelper";

const ABIS_NAME = 'abi';
const HISTORIES_NAME = 'histories';
const TRANSLATION_NAME = 'translation';
const SCATTER_DATA_NAME = 'scatter';
const SCATTER_INTERMED_NAME = 'scatter_intermed';

import {isWeb} from "../../util/WebOrWrapper";
import Helpers, {ipcFaF} from '../../util/WebHelpers';
import {AES} from "aes-oop";
import {HISTORY_TYPES} from "scatter-core/models/histories/History";
import HistoricTransfer from "scatter-core/models/histories/HistoricTransfer";
import HistoricExchange from "scatter-core/models/histories/HistoricExchange";
import HistoricAction from "scatter-core/models/histories/HistoricAction";
import Seeder from "scatter-core/services/secure/Seeder";
import {saveFile} from "./FileService";

const isPopup = location.hash.indexOf('popout') > -1;

export default class StorageService {

	constructor(){}

	static async getDefaultPath(){
		return Helpers.getDefaultPath()
	};

	static async saveFile(...params){
		return saveFile(...params);
	};

	static async setScatter(scatter){
		if(isPopup) return;
		return this.setLocalScatter(scatter);
	};

	static getScatter() {
		return window.localStorage.getItem('scatter');
	}

	static removeScatter(){
		if(isPopup) return;
		window.localStorage.clear();
		ipcFaF('key', null);
		return true;
	}

	static cacheABI(contractName, chainId, abi){
		return window.localStorage.setItem(`abis.${contractName}_${chainId}`, abi);
	}

	static getCachedABI(contractName, chainId){
		return window.localStorage.getItem(`abis.${contractName}_${chainId}`);
	}

	static getSalt(){
		return window.localStorage.getItem('salt') || 'SALT_ME';
	}

	static setSalt(salt){
		return window.localStorage.setItem('salt', salt);
	}

	static async getTranslation(){
		let translation = window.localStorage.getItem('translation');
		if(!translation) return null;
		return AES.decrypt(translation, await Seeder.getSeed());
	}

	static async setTranslation(translation){
		const encrypted = AES.encrypt(translation, await Seeder.getSeed());
		return window.localStorage.setItem('translation', encrypted);
	}

	static async getHistory(){
		let history = window.localStorage.getItem('history');
		if(!history) return [];
		history = AES.decrypt(history, await Seeder.getSeed());

		history = history.map(x => {
			if(x.type === HISTORY_TYPES.Transfer) return HistoricTransfer.fromJson(x);
			if(x.type === HISTORY_TYPES.Exchange) return HistoricExchange.fromJson(x);
			if(x.type === HISTORY_TYPES.Action) return HistoricAction.fromJson(x);
			return null;
		}).filter(x => x);

		return history;
	}

	static async updateHistory(x){
		let history = await this.getHistory();
		if(history.find(h => h.id === x.id)) history = history.filter(h => h.id !== x.id);
		history.unshift(x);
		const encrypted = AES.encrypt(history, await Seeder.getSeed());
		return window.localStorage.setItem('history', encrypted);
	}

	static async deltaHistory(x){
		let history = await this.getHistory();
		if(x === null) history = [];
		else {
			if(history.find(h => h.id === x.id)) history = history.filter(h => h.id !== x.id);
			else history.unshift(x);
		}

		const encrypted = AES.encrypt(history, await Seeder.getSeed());
		return window.localStorage.setItem('history', encrypted);
	}

	static async swapHistory(history){
		const encrypted = AES.encrypt(history, await Seeder.getSeed());
		return window.localStorage.setItem('history', encrypted);
	}


	static async setLocalScatter(scatter){
		window.localStorage.setItem('scatter', scatter);
		return true;
	}

	static getLocalScatter(){
		return window.localStorage.getItem('scatter');
	}
}