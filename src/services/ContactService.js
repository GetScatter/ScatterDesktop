import Contact from '../models/Contact'
import {store} from '../store/store';
import * as Actions from '../store/constants'

import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup';
import {localizedState} from "../localization/locales";
import LANG_KEYS from "../localization/keys";

export default class ContactService {

    constructor(){}

    static async add(recipient, name){
        recipient = recipient.trim();
	    name = name.trim();

        const scatter = store.state.scatter.clone();

        if(scatter.contacts.find(x => x.recipient.toLowerCase() === recipient.toLowerCase()))
            return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.ContactExists)))

	    if(scatter.contacts.find(x => x.name.toLowerCase() === name.toLowerCase()))
		    return PopupService.push(Popup.snackbar(localizedState(LANG_KEYS.SNACKBARS.ContactNameExists)))

	    scatter.contacts.push(new Contact(name, recipient));
	    return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async remove(contact){
        return new Promise(async resolve => {
	        PopupService.push(Popup.prompt('Removing Contact', 'Are you sure you want to remove this contact?', async bool => {
	        	if(!bool) return resolve(false);
		        const scatter = store.state.scatter.clone();
		        scatter.contacts = scatter.contacts.filter(x => x.id !== contact.id);
		        return resolve(store.dispatch(Actions.SET_SCATTER, scatter));
	        }))
        })

    }

}