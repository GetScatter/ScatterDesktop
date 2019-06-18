import Contact from '../../models/Contact'
import * as Actions from '../../store/constants'

import PopupService from './PopupService';
import {Popup} from '../../models/popups/Popup';
import {localizedState} from "../../localization/locales";
import LANG_KEYS from "../../localization/keys";
import StoreService from "./StoreService";
import {BlockchainsArray} from "../../models/Blockchains";
import PluginRepository from "../../plugins/PluginRepository";

export default class ContactService {

    constructor(){}

    static async addOrUpdate(contact){
	    contact.recipient = contact.recipient.trim();
	    contact.name = contact.name.trim();
	    const scatter = StoreService.get().state.scatter.clone();

	    if(!contact.name.length) return PopupService.push(Popup.snackbar('Invalid contact name'));
	    if(!contact.recipient.length) return PopupService.push(Popup.snackbar('Invalid contact account / address'));

	    if(scatter.contacts.find(x => x.id !== contact.id && x.recipient.toLowerCase() === contact.recipient.toLowerCase()))
		    return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.ContactExists)))

	    if(scatter.contacts.find(x => x.id !== contact.id && x.name.toLowerCase() === contact.name.toLowerCase()))
		    return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.ContactNameExists)))


	    const c = scatter.contacts.find(x => x.id === contact.id);
	    if(c){
		    c.recipient = contact.recipient;
		    c.name = contact.name;
		    c.blockchain = contact.blockchain;
	    } else {
		    scatter.contacts.push(contact);
	    }

	    return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async remove(contact){
	    const scatter = StoreService.get().state.scatter.clone();
	    scatter.contacts = scatter.contacts.filter(x => x.id !== contact.id);
	    return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static validate(blockchain, contact){
    	// You can add unsupported blockchains which we have no logic for,
	    // so we will always default to true for those.
    	if(!BlockchainsArray.map(x => x.value).includes(blockchain)) return true;

    	return PluginRepository.plugin(blockchain).isValidRecipient(contact);
    }

}