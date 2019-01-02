import {blockchainName, Blockchains, BlockchainsArray} from "../models/Blockchains";
import PluginRepository from "../plugins/PluginRepository";
import Explorer from "../models/Explorer";
import {store} from "../store/store";
import * as Actions from "../store/constants";
import Configs from "../../configs";

let checked = false;

export default class LanguageService {

	static getLanguageNames(){
		return fetch(`${Configs.api}/languages?names=1`).then(r => r.json())
			.catch(err => {
			return ["English"];
		})
	}

	static getLanguage(name){
		return fetch(`${Configs.api}/languages?name=${name}`).then(r => r.json())
		.then(res => {
			if(!this.validateLanguage(res)) return;
			return res;
		})
		.catch(err => {
			return null;
		})
	}

	static regenerateLanguage(){
		if(checked) return false;
		checked = true;
		if(!store.state.language || !store.state.language.json) return;
		this.getLanguage(store.state.scatter.settings.language.json).then(res => {
			if(!res) return;
			if(store.state.language.json.raw !== JSON.stringify(res)){
				res.raw = JSON.stringify(res);
				if(!this.validateLanguage(res)) return;
				store.dispatch(Actions.SET_LANGUAGE, res);
			}

		})
	}


	// So basic checks against long methods which could expose
	// data if DNS based attacks happen. This prevents any
	// powerful method from being eval'ed within Scatter.
	static validateLanguage(json){
		return json.methods.every(x => {
			return x.body.toString().length <= 100;
		})
	}

}