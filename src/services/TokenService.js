import {store} from '../store/store';
import * as Actions from '../store/constants';
import PopupService from "./PopupService";
import {Popup} from "../models/popups/Popup";

const filterOutToken = (scatter, token) => {
	scatter.settings.tokens = scatter.settings.tokens.filter(x => x.unique() !== token.unique());
	scatter.settings.blacklistTokens = scatter.settings.blacklistTokens.filter(x => x.unique() !== token.unique());
}

export default class TokenService {

    static async addToken(token, blacklist = false){
	    const scatter = store.state.scatter.clone();

	    // Never adding system tokens.
	    if(store.getters.networkTokens.find(x => x.unique() === token.unique())) return true;

        if(!token.symbol.length) return PopupService.push(Popup.prompt('Token Symbol Error', 'You must add a token symbol.', 'attention', 'Okay'));
        if(!token.contract.length) return PopupService.push(Popup.prompt('Token Contract Error', 'You must add a token contract.', 'attention', 'Okay'));

        if(!blacklist && scatter.settings.tokens.find(x => x.unique() === token.unique()))
            return PopupService.push(Popup.prompt('Token Exists', 'This token already exists in your added tokens.', 'attention', 'Okay'));

        if(blacklist && scatter.settings.blacklistTokens.find(x => x.unique() === token.unique()))
            return PopupService.push(Popup.prompt('Token Exists', 'This token already exists in your filtered tokens.', 'attention', 'Okay'));

        if(!token.name.trim().length) token.name = token.symbol;


	    filterOutToken(scatter, token);

        if(!blacklist) scatter.settings.tokens.unshift(token);
        else scatter.settings.blacklistTokens.unshift(token);

        await store.dispatch(Actions.SET_SCATTER, scatter);
        PopupService.push(Popup.snackbar(`Token added.`));
        return true;
    }

    static removeToken(token){
	    const scatter = store.state.scatter.clone();

	    // Never removing system tokens.
	    if(store.getters.networkTokens.find(x => x.unique() === token.unique())) return true;

	    PopupService.push(Popup.prompt('Removing Token', 'Are you sure?', 'trash', 'Yes', async removed => {
	        if(!removed) return false;

		    filterOutToken(scatter, token);
		    store.dispatch(Actions.SET_SCATTER, scatter);
        }, 'No'))
    }

}