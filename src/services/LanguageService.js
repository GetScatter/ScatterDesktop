import {blockchainName, Blockchains, BlockchainsArray} from "../models/Blockchains";
import PluginRepository from "../plugins/PluginRepository";
import Explorer from "../models/Explorer";
import {store} from "../store/store";
import * as Actions from "../store/constants";

let checked = false;

export default class LanguageService {

	static getLanguageNames(){
		return fetch(`https://api.get-scatter.com/v1/languages?names=1`).then(r => r.json())
			.catch(err => {
			return ["English"];
		})
	}

	static getLanguage(name){
		return fetch(`https://api.get-scatter.com/v1/languages?name=${name}`).then(r => r.json())
		.catch(err => {
			return null;
		})
	}

	static regenerateLanguage(){
		if(checked) return false;
		checked = true;
		if(!store.state.language) return;
		this.getLanguage(store.state.scatter.settings.language).then(res => {
			if(!res) return;
			if(store.state.language.raw !== JSON.stringify(res)){
				res.raw = JSON.stringify(res);
				store.dispatch(Actions.SET_LANGUAGE, res);
			}

		})
	}

}