import IdGenerator from '../../util/IdGenerator';
import * as ApiActions from '../api/ApiActions';
import {localizedState} from "../../localization/locales";
import LANG_KEYS from "../../localization/keys";

import {remote} from '../../util/ElectronHelpers';
const NotificationService = () => remote ? remote.getGlobal('appShared').NotificationService : null;

export const PopupDisplayTypes = {
    POP_IN:'popin',
    POP_OUT:'popout',
    POP_SIDE:'popside',
    SNACKBAR:'snackbar',
};

export class Popup {

    constructor(_displayType = PopupDisplayTypes.POP_IN, _data = new PopupData(), internal = false){
        this.id = IdGenerator.numeric(24);
        this.displayType = _displayType;
        this.data = _data;
        this.internal = internal;
    }

	static fromJson(json){ return Object.assign(new Popup(), json); }

    dimensions(){
    	switch (this.data.type) {
		    case ApiActions.GET_OR_REQUEST_IDENTITY:
		    case ApiActions.REQUEST_TRANSFER:
		    case ApiActions.GET_PUBLIC_KEY:
			    return {width:420, height:600};
		    case ApiActions.REQUEST_SIGNATURE:
			    return {width:920, height:600};
		    case 'linkApp':
			    return {width:420, height:500};
		    default:
			    return {width:800, height:600};
	    }
    }



	appData(){ return this.data.props.appData }
	payload(){ return this.data.props.payload }
	origin(){
    	const app = this.appData();
    	if(app) return app.name;
		return this.data.props.plugin
	}



    // FULL POP OUT ( external window )
	static popout(data, callback, internal = false){
		return new Popup(PopupDisplayTypes.POP_OUT, new PopupData(data.type, data, callback), internal)
	}







    static prompt(title, description, callback, acceptDeny = false){
        let params = { title, description, acceptDeny };
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.PROMPT, params, callback))
    }

	static selector(title, items, callback){
		let params = { title, items };
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECTOR, params, callback))
	}

    static transactionSuccess(blockchain, tx, callback){
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.TX_SUCCESS, {blockchain, tx}, callback))
    }

    static snackbar(message, icon, timeout = 3000){
        return new Popup(PopupDisplayTypes.SNACKBAR, new PopupData('', { message, icon, timeout }))
    }

	static enterPIN(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.ENTER_PIN, {}, callback))
	}

	static removeApp(origin, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.REMOVE_APP, {origin}, callback))
	}

	static updateAvailable(update, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.UPDATE_AVAILABLE, {update}, callback))
	}



    /*****************************************/
    /*********      SNACKBARS      ***********/
    /*****************************************/

	static snackbarBadPassword(timeout = 3000){
		const message = localizedState(LANG_KEYS.SNACKBARS.BadPassword);
		return new Popup(PopupDisplayTypes.SNACKBAR, new PopupData('', { message, icon:'attention', timeout }))
	}


    /*****************************************/
    /*********   FULLSCREEN POPINS ***********/
    /*****************************************/

	static verifyPassword(callback, returnOnly = false){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.VERIFY_PASSWORD, {returnOnly}, callback))
	}

	static eosChangePermissions(account, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_CHANGE_PERMISSIONS, {account}, callback))
	}

	static eosProxyVotes(account, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_PROXY_VOTES, {account}, callback))
	}

	static eosModerateRam(account, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_MODERATE_RAM, {account}, callback))
	}

	static eosModerateCpuNet(account, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_MODERATE_CPU_NET, {account}, callback))
	}

	static eosCreateAccount(activePublicKey, ownerPublicKey, activeId, ownerId, showKeys = false, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_CREATE_ACCOUNT, {
			activePublicKey,
			ownerPublicKey,
			activeId,
			ownerId,
			showKeys
		}, callback))
	}

	static unlinkAccount(account, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.UNLINK_ACCOUNT, {account}, callback))
	}

	static unlinkBlockchain(keypair, blockchain, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.UNLINK_BLOCKCHAIN, {keypair, blockchain}, callback))
	}

	static removeKeypair(keypair, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.REMOVE_KEYPAIR, {keypair}, callback))
	}

	static importMnemonic(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.IMPORT_MNEMONIC, {}, callback))
	}

	static mnemonic(mnemonic){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.MNEMONIC, {mnemonic}, () => {}))
	}

	static removeLocation(identity, location, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.REMOVE_LOCATION, {identity, location}, callback))
	}

	static destroyScatter(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.DESTROY_SCATTER, {}, callback))
	}

	static checkHardwareWalletScreen(){
		NotificationService().pushNotification('Check Hardware', 'Please check your hardware screen.');
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.CHECK_HARDWARE, {}, () => {}))
	}

	static enableWhitelist(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.ENABLE_WHITELIST, {}, callback))
	}

	static selectAccount(callback, accountsOnly = false, account = null, blockchain = null, hideWatch = false){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_ACCOUNT, {accountsOnly, account, blockchain, hideWatch}, callback))
	}

	static confirmExchange(accounts, symbols, order, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.CONFIRM_EXCHANGE, {accounts, symbols, order}, callback))
	}

	static confirmTransfer(from, to, token, memo, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.CONFIRM_TRANSFER, {from, to, token, memo}, callback))
	}

				// {history, token, account}
	static exchange(params, callback = () => {}){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EXCHANGE, params, callback))
	}

				// {history, token, account}
	static stabilize(params, callback = () => {}){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.STABILIZE, params, callback))
	}

	static history(filter, callback = () => {}){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.HISTORY, {filter}, callback))
	}

	static setDisplayToken(callback = () => {}){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.DISPLAY_TOKEN, {}, callback))
	}

}

export const PopupTypes = {
    // OVERLAYS
    PROMPT:'prompt',
	SELECTOR:'selector',
    ENTER_PIN:'enterPIN',
    REMOVE_APP:'removeApp',
    UPDATE_AVAILABLE:'updateAvailable',

    // FULLSCREEN
    VERIFY_PASSWORD:'verifyPassword',
    EOS_CHANGE_PERMISSIONS:'eosChangePermissions',
	EOS_PROXY_VOTES:'eosProxyVotes',
	EOS_MODERATE_RAM:'eosModerateRam',
	EOS_MODERATE_CPU_NET:'eosModerateCpuNet',
	EOS_CREATE_ACCOUNT:'eosCreateAccount',
	UNLINK_ACCOUNT:'unlinkAccount',
	UNLINK_BLOCKCHAIN:'unlinkBlockchain',
	REMOVE_KEYPAIR:'removeKeypair',
	IMPORT_MNEMONIC:'importMnemonic',
	MNEMONIC:'mnemonic',
	REMOVE_LOCATION:'removeLocation',
	DESTROY_SCATTER:'destroyScatter',
	CHECK_HARDWARE:'checkHardware',
	ENABLE_WHITELIST:'enableWhitelist',
	SELECT_ACCOUNT:'selectAccount',
	CONFIRM_EXCHANGE:'confirmExchange',
	CONFIRM_TRANSFER:'confirmTransfer',
	EXCHANGE:'exchange',
	STABILIZE:'stabilize',
	HISTORY:'history',
	DISPLAY_TOKEN:'displayToken',

    TX_SUCCESS:'txSuccess',
};

export const isFullscreen = popup => {
    return [
        PopupTypes.VERIFY_PASSWORD,
        PopupTypes.EOS_CHANGE_PERMISSIONS,
        PopupTypes.EOS_PROXY_VOTES,
        PopupTypes.UNLINK_ACCOUNT,
        PopupTypes.UNLINK_BLOCKCHAIN,
        PopupTypes.REMOVE_KEYPAIR,
        PopupTypes.EOS_MODERATE_RAM,
        PopupTypes.EOS_MODERATE_CPU_NET,
        PopupTypes.EOS_CREATE_ACCOUNT,
        PopupTypes.IMPORT_MNEMONIC,
        PopupTypes.MNEMONIC,
        PopupTypes.REMOVE_LOCATION,
        PopupTypes.DESTROY_SCATTER,
        PopupTypes.CHECK_HARDWARE,
        PopupTypes.ENABLE_WHITELIST,
        PopupTypes.SELECT_ACCOUNT,
        PopupTypes.CONFIRM_EXCHANGE,
        PopupTypes.CONFIRM_TRANSFER,
        PopupTypes.EXCHANGE,
        PopupTypes.STABILIZE,
        PopupTypes.HISTORY,
        PopupTypes.DISPLAY_TOKEN,
    ].includes(popup.data.type);


}

export class PopupData {

    constructor(_type, _props, _callback = () => {}){
        this.type = _type;
        this.props = _props;
        this.callback = _callback;
    }

}
