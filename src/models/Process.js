import IdGenerator from "../util/IdGenerator";
import * as Actions from '../store/constants';
import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";
import StoreService from "../services/utility/StoreService";

export const PROCESS_TYPES = {
	SAVING_DATA:'saving_data',
	IMPORT_ACCOUNTS:'import_accounts',
	LOAD_RESOURCES:'load_resources',
};

export default class Process {

	constructor(type, title, identifier, display = true){
		this.id = IdGenerator.text(12);
		this.type = type;
		this.title = title;
		this.identifier = identifier;
		this.subTitle = null;
		this.progress = 0;
		this.isKilled = false;
		this.display = display;

		let interval = setInterval(() => {
			if(this.progress >= 100) {
				clearInterval(interval);
				setTimeout(() => {
					this.kill();
				}, 1500);
			}
		}, 250);
	}

	static placeholder(){ return new Process(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }

	kill(){
		this.isKilled = true;
		StoreService.get().dispatch(Actions.RELEASE_PROCESS, this);
	}

	updateProgress(delta){
		if(this.isKilled) return;
		this.progress += delta;
		StoreService.get().dispatch(Actions.SET_PROCESS, this);
	}

	setSubTitle(subTitle){
		if(this.isKilled) return;
		this.subTitle = subTitle;
	}


	static isProcessRunning(identifier){
		return !!this.getProcessFromIdentifier(identifier);
	}

	static getProcessFromIdentifier(identifier){
		return StoreService.get().state.processes.find(x => x.identifier === identifier);
	}

	static savingData(){
		let process = new Process(PROCESS_TYPES.SAVING_DATA, 'Saving', PROCESS_TYPES.SAVING_DATA)
		process.id = PROCESS_TYPES.SAVING_DATA;
		StoreService.get().dispatch(Actions.SET_PROCESS, process);
		return process;
	}

	static importAccounts(identifier){
		let process = new Process(PROCESS_TYPES.IMPORT_ACCOUNTS, localizedState(LANG_KEYS.PROCESSES.ImportingAccounts), identifier, true)
		StoreService.get().dispatch(Actions.SET_PROCESS, process);
		return process;
	}

	static loadResources(identifier, display = true){
		let process = new Process(PROCESS_TYPES.LOAD_RESOURCES, localizedState(LANG_KEYS.PROCESSES.LoadingResources), identifier, display)
		StoreService.get().dispatch(Actions.SET_PROCESS, process);
		return process;
	}

}