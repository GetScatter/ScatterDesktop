import {mathematicalVersion} from '../migrations/migrator';
import {store} from '../store/store';
import * as Actions from '../store/constants';
import PopupService from '../services/PopupService';
import {Popup} from '../models/popups/Popup'
import ElectronHelpers from '../util/ElectronHelpers'

export default class UpdateService {

    static async needsUpdate(){
        const scatter = store.state.scatter.clone();
        const update = await this.needsUpdateNoPrompt();
        if(update) PopupService.push(Popup.prompt('New Update!', 'There is a new Scatter update available. Do you want to download it?', 'download', 'Yes', accepted => {
            if(accepted) ElectronHelpers.openLinkInBrowser(update[2]);
            else {
                scatter.meta.lastSuggestedVersion = update[1];
                store.dispatch(Actions.SET_SCATTER, scatter);
            }
        }, 'No'));
        else return false;
    }

    static async needsUpdateNoPrompt(){
        const {version, url} = await fetch('https://api.github.com/repos/GetScatter/ScatterDesktop/releases/latest').then(res => res.json()).then(x => ({
            version:mathematicalVersion(x.tag_name),
            url:x.html_url
        }));

        const scatter = store.state.scatter.clone();
        let lastSuggested = scatter.meta.lastSuggestedVersion;

        if(mathematicalVersion(scatter.meta.version) < version && (!lastSuggested || lastSuggested !== version))
            return [version, url];
        return false;
    }

}