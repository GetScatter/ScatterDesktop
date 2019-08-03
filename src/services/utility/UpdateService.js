import {mathematicalVersion} from '../../migrations/migrator';
import * as Actions from '../../store/constants';
import PopupService from './PopupService';
import {Popup} from '../../models/popups/Popup'
import ElectronHelpers from '../../util/ElectronHelpers'
import StoreService from "./StoreService";
import {GET} from "../apis/BackendApiService";

export default class UpdateService {

    static updateUrl(){ return `https://github.com/GetScatter/ScatterDesktop/releases` }

    static async needsUpdate(){
        const scatter = StoreService.get().state.scatter.clone();
        const update = await this.needsUpdateNoPrompt();

        if(update){
	        const {version, body, name} = update;

	        // Not setting last version anymore.
	        // We want to always pop it up to annoy users
	        // whenever they open Scatter so that they update
	        // since there's often security updates.
	        // --------------------------------------
	        // scatter.meta.lastSuggestedVersion = version;
	        // StoreService.get().dispatch(Actions.SET_SCATTER, scatter);

            PopupService.push(Popup.updateAvailable(update, updated => {

            }));
        }
    }

    static async needsUpdateNoPrompt(useLastVersion = true){

        // Always getting update from backend
	    const {version, details, name} = await GET(`version`).catch(() => {});

        const scatter = StoreService.get().state.scatter.clone();
        let lastSuggested = scatter.meta.lastSuggestedVersion;

        if(mathematicalVersion(scatter.meta.version) < version && (!useLastVersion || (!lastSuggested || lastSuggested !== version)))
            return {version, url:this.updateUrl(), name, body:details};

        return false;
    }

}