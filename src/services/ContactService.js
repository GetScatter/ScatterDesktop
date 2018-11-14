import Contact from '../models/Contact'
import {store} from '../store/store';
import * as Actions from '../store/constants'

import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup';

export default class ContactService {

    constructor(){}

    static async add(recipient, name){
        recipient = recipient.trim();
	    name = name.trim();

        const scatter = store.state.scatter.clone();

        if(scatter.contacts.find(x => x.recipient.toLowerCase() === recipient.toLowerCase()))
            return PopupService.push(Popup.prompt('Contact Exists', 'Another contact already has this recipient account.', 'attention', 'Okay'))

	    if(scatter.contacts.find(x => x.name.toLowerCase() === name.toLowerCase()))
		    return PopupService.push(Popup.prompt('Contact Name Exists', 'Another contact already has this name.', 'attention', 'Okay'))

	    scatter.contacts.push(new Contact(name, recipient));
	    return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async remove(contact){
        PopupService.push(Popup.prompt('Removing Contact', 'Are you sure you want to remove this contact?', 'attention', 'Yes', async bool => {
            if(bool){
                const scatter = store.state.scatter.clone();
                scatter.contacts = scatter.contacts.filter(x => x.id !== contact.id);
                return store.dispatch(Actions.SET_SCATTER, scatter);
            }
        }, 'No'))

    }

}