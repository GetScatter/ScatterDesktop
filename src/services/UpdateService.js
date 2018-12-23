import {mathematicalVersion} from '../migrations/migrator';
import {store} from '../store/store';
import * as Actions from '../store/constants';
import PopupService from '../services/PopupService';
import {Popup} from '../models/popups/Popup'
import ElectronHelpers from '../util/ElectronHelpers'

export default class UpdateService {

    static updateUrl(){ return `https://github.com/GetScatter/ScatterDesktop/releases` }

    static async needsUpdate(){
        const scatter = store.state.scatter.clone();
        const update = await this.needsUpdateNoPrompt();

        if(update){
	        const {version, body, prerelease, name} = update;
	        if(prerelease) return;

	        scatter.meta.lastSuggestedVersion = version;
	        store.dispatch(Actions.SET_SCATTER, scatter);

            PopupService.push(Popup.updateAvailable(update, updated => {

            }));
        }
    }

    static async needsUpdateNoPrompt(useLastVersion = true){
        const {version, stringVersion, body, prerelease, name} = await fetch('https://api.github.com/repos/GetScatter/ScatterDesktop/releases/latest').then(res => res.json()).then(x => ({
	        name:x.name,
            version:mathematicalVersion(x.tag_name),
            stringVersion:x.tag_name,
	        prerelease:x.prerelease,
	        body:x.body,
        }));

        if(prerelease) return false;

        const scatter = store.state.scatter.clone();
        let lastSuggested = scatter.meta.lastSuggestedVersion;

        if(mathematicalVersion(scatter.meta.version) < version && (!useLastVersion || (!lastSuggested || lastSuggested !== version)))
            return {version, stringVersion, url:this.updateUrl(), prerelease, name, body};

        return false;
    }

}