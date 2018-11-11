import IdGenerator from "../util/IdGenerator";
import {store} from "../store/store";
import * as Actions from '../store/constants';

export const PROCESS_TYPES = {
	IMPORT_ACCOUNTS:'import_accounts',
	LOAD_TOKENS:'load_tokens',
};

export default class Process {

	constructor(type, title, identifier){
		this.id = IdGenerator.text(12);
		this.type = type;
		this.title = title;
		this.identifier = identifier;
		this.subTitle = null;
		this.progress = 0;

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

	updateProgress(delta){
		this.progress += delta;
		store.dispatch(Actions.SET_PROCESS, this);
	}

	kill(){
		store.dispatch(Actions.RELEASE_PROCESS, this);
	}


	static isProcessRunning(identifier){
		return !!this.getProcessFromIdentifier(identifier);
	}

	static getProcessFromIdentifier(identifier){
		return store.state.processes.find(x => x.identifier === identifier);
	}

	static importAccounts(identifier){
		let process = new Process(PROCESS_TYPES.IMPORT_ACCOUNTS, `Importing Accounts`, identifier)
		store.dispatch(Actions.SET_PROCESS, process);
		return process;
	}

	static loadTokens(identifier){
		let process = new Process(PROCESS_TYPES.LOAD_TOKENS, `Loading Tokens and Balances`, identifier)
		store.dispatch(Actions.SET_PROCESS, process);
		return process;
	}

}