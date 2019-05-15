import * as Actions from '../../store/constants';
import PopupService from "./PopupService";
import {Popup} from "../../models/popups/Popup";
import PriceService from "../apis/PriceService";
import BigNumber from "bignumber.js";
import {localizedState} from "../../localization/locales";
import LANG_KEYS from "../../localization/keys";
import Token from "../../models/Token";
import StoreService from "./StoreService";

const filterOutToken = (scatter, token) => {
	scatter.settings.tokens = scatter.settings.tokens.filter(x => x.unique() !== token.unique());
	scatter.settings.blacklistTokens = scatter.settings.blacklistTokens.filter(x => x.unique() !== token.unique());
	if(scatter.settings.displayToken === token.unique()) scatter.settings.displayToken = null;
}

export default class TokenService {

    static async addToken(token, blacklist = false, showNotification = true){
	    const scatter = StoreService.get().state.scatter.clone();

	    // Never adding system tokens.
	    if(StoreService.get().getters.networkTokens.find(x => x.unique() === token.unique())) return true;

        if(!token.symbol.length) return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.TOKENS.MissingSymbol)));
        if(token.needsContract() && !token.contract.length) return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.TOKENS.MissingContract)));

        if(!blacklist && scatter.settings.tokens.find(x => x.unique() === token.unique()))
            return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.TOKENS.TokenExistsAdded)));

        if(blacklist && scatter.settings.blacklistTokens.find(x => x.unique() === token.unique()))
            return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.TOKENS.TokenExistsFiltered)));

        if(!token.name.trim().length) token.name = token.symbol;


	    filterOutToken(scatter, token);

        if(!blacklist) scatter.settings.tokens.unshift(token);
        else scatter.settings.blacklistTokens.unshift(token);

        await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
        if(showNotification) PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.TokenAdded), 'check'));
        return true;
    }

    static removeToken(token){
	    const scatter = StoreService.get().state.scatter.clone();

	    // Never removing system tokens.
	    if(StoreService.get().getters.networkTokens.find(x => x.unique() === token.unique())) return true;

	    filterOutToken(scatter, token);
	    StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static hasToken(token){
    	const scatter = StoreService.get().state.scatter.clone();

    	return !!StoreService.get().getters.fullTotalBalances.totals[token.unique()] ||
		    !!scatter.settings.tokens.find(x => x.unique() === token.unique()) ||
		    !!scatter.settings.blacklistTokens.find(x => x.unique() === token.unique());
    }

    static async setDisplayCurrency(ticker){
	    const scatter = StoreService.get().state.scatter.clone();
	    scatter.settings.displayCurrency = ticker;
	    return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

	static async setDisplayToken(token){
		const scatter = StoreService.get().state.scatter.clone();
		scatter.settings.displayToken = token instanceof Token ? token.uniqueWithChain() : token;
		return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	}


	static formatAmount(amount, token, div = false){
    	const operator = div ? 'div' : 'times';
		let decimalString = '';
		for(let i = 0; i < token.decimals; i++){ decimalString += '0'; }
		return new BigNumber(amount.toString(10), 10)[operator](`1${decimalString}`).toString(10);
	}

}