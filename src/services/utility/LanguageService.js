import {GET} from "@walletpack/core/services/apis/BackendApiService";
import StoreService from "@walletpack/core/services/utility/StoreService";
import * as UIActions from "../../store/ui_actions";

let checked = false;

export default class LanguageService {

	static getLanguageNames(){
		return GET(`languages?names=1`)
			.catch(err => {
				return ["English"];
			})
	}

	static getLanguage(name){
		return GET(`languages?name=${name}`)
			.then(res => {
				if(!this.validateLanguage(res)) return;
				return res;
			})
			.catch(err => {
				console.error('err', err);
				return null;
			})
	}

	static regenerateLanguage(){
		if(checked) return false;
		checked = true;
		if(!StoreService.get().state.language || !StoreService.get().state.language.json) return;
		this.getLanguage(StoreService.get().state.scatter.settings.language.json).then(res => {
			if(!res) return;
			if(StoreService.get().state.language.json.raw !== JSON.stringify(res)){
				res.raw = JSON.stringify(res);
				if(!this.validateLanguage(res)) return;
				StoreService.get().dispatch(UIActions.SET_LANGUAGE, res);
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