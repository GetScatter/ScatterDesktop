import IdGenerator from '../../util/IdGenerator';
import * as ApiActions from '../api/ApiActions';
import {localizedState} from "../../localization/locales";
import LANG_KEYS from "../../localization/keys";

import {remote} from '../../util/ElectronHelpers';
import {BlockchainsArray} from "../Blockchains";
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
		    case ApiActions.LOGIN:
		    case ApiActions.LOGIN_ALL:
		    case ApiActions.GET_PUBLIC_KEY:
		    case ApiActions.TRANSFER:
			    return {width:600, height:600};
		    case ApiActions.UPDATE_IDENTITY:
			    return {width:420, height:600};
		    case ApiActions.SIGN:
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







    static prompt(title, description, callback, acceptDeny = false, inputField = false){
        let params = { title, description, acceptDeny, inputField };
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.PROMPT, params, callback))
    }

    static selectFromList(title, list, callback){
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_FROM_LIST, {title, list}, callback))
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

	static enterSecurityCode(subtitle, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SECURITY_CODE, {subtitle}, callback))
	}

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

	static eosCreateAccount(account, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_CREATE_ACCOUNT, { account }, callback))
	}

	static eosLinkAccount(keypair, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EOS_LINK_ACCOUNT, { keypair }, callback))
	}

	static addCustomNetwork(blockchain, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.ADD_CUSTOM_NETWORK, {blockchain}, callback))
	}

	static addNewContact(blockchain, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.ADD_NEW_CONTACT, {blockchain}, callback))
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

	static removeLocation(identity, location, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.REMOVE_LOCATION, {identity, location}, callback))
	}

	static destroyScatter(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.DESTROY_SCATTER, {}, callback))
	}

	static importFullBackup(options, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.IMPORT_FULL_BACKUP, {options}, callback))
	}

	static importKeypair(options, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.IMPORT_KEYPAIR, {options}, callback))
	}

	static generateKeypair(options, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.GENERATE_KEYPAIR, {options}, callback))
	}

	static checkHardwareWalletScreen(){
		NotificationService().pushNotification('Check Hardware', 'Please check your hardware screen.');
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.CHECK_HARDWARE, {}, () => {}))
	}

	static enableWhitelist(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.ENABLE_WHITELIST, {}, callback))
	}

	static selectTokenAndAccount(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_TOKEN_AND_ACCOUNT, {}, callback))
	}

	static selectAccount(callback, validAccounts = null){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_ACCOUNT, {validAccounts}, callback))
	}

	static selectKeypair(callback, blockchains = BlockchainsArray.map(x => x.value)){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_KEYPAIR, {blockchains}, callback))
	}

	static selectRecipient(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_RECIPIENT, {}, callback))
	}

	static selectToken(tokens, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_TOKEN, {tokens}, callback))
	}

	static selectBlockchain(callback, blockchains = BlockchainsArray.map(x => x.value)){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECT_BLOCKCHAIN, {blockchains}, callback))
	}

	static confirmExchange(accounts, symbols, order, pair, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.CONFIRM_EXCHANGE, {accounts, symbols, order, pair}, callback))
	}

	static confirmTransfer(from, to, token, memo, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.CONFIRM_TRANSFER, {from, to, token, memo}, callback))
	}

	static exportPrivateKey(keypair, callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.EXPORT_PRIVATE_KEY, {keypair}, callback))
	}

	static setDisplayToken(callback = () => {}){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.DISPLAY_TOKEN, {}, callback))
	}

}

export const PopupTypes = {
    // OVERLAYS
    PROMPT:'prompt',
	SELECT_FROM_LIST:'select_from_list',
    ENTER_PIN:'enterPIN',
    REMOVE_APP:'removeApp',
    UPDATE_AVAILABLE:'updateAvailable',
	TX_SUCCESS:'txSuccess',
	SELECT_TOKEN_AND_ACCOUNT:'selectTokenAndAccount',
	SELECT_ACCOUNT:'selectAccount',
	SELECT_KEYPAIR:'selectKeypair',
	SELECT_RECIPIENT:'selectRecipient',
	SELECT_TOKEN:'selectToken',
	SELECT_BLOCKCHAIN:'selectBlockchain',
	EOS_LINK_ACCOUNT:'eosLinkAccount',

    // FULLSCREEN
	SECURITY_CODE:'securityCode',
    VERIFY_PASSWORD:'verifyPassword',
    EOS_CHANGE_PERMISSIONS:'eosChangePermissions',
	EOS_PROXY_VOTES:'eosProxyVotes',
	EOS_MODERATE_RAM:'eosModerateRam',
	EOS_MODERATE_CPU_NET:'eosModerateCpuNet',
	EOS_CREATE_ACCOUNT:'eosCreateAccount',
	ADD_CUSTOM_NETWORK:'addCustomNetwork',
	ADD_NEW_CONTACT:'addNewContact',
	UNLINK_ACCOUNT:'unlinkAccount',
	UNLINK_BLOCKCHAIN:'unlinkBlockchain',
	REMOVE_KEYPAIR:'removeKeypair',
	MNEMONIC:'mnemonic',
	REMOVE_LOCATION:'removeLocation',
	DESTROY_SCATTER:'destroyScatter',
	CHECK_HARDWARE:'checkHardware',
	ENABLE_WHITELIST:'enableWhitelist',
	CONFIRM_EXCHANGE:'confirmExchange',
	CONFIRM_TRANSFER:'confirmTransfer',
	EXPORT_PRIVATE_KEY:'exportPrivateKey',
	DISPLAY_TOKEN:'displayToken',
	GENERATE_KEYPAIR:'generateKeypair',
	IMPORT_KEYPAIR:'importKeypair',
	IMPORT_FULL_BACKUP:'importFullBackup',

};

export const isFullscreen = popup => {
    return ![
        PopupTypes.PROMPT,
        PopupTypes.SELECT_FROM_LIST,
        PopupTypes.ENTER_PIN,
        PopupTypes.REMOVE_APP,
        PopupTypes.UPDATE_AVAILABLE,
        PopupTypes.TX_SUCCESS,
        PopupTypes.SELECT_TOKEN_AND_ACCOUNT,
        PopupTypes.SELECT_ACCOUNT,
        PopupTypes.SELECT_KEYPAIR,
        PopupTypes.SELECT_RECIPIENT,
        PopupTypes.SELECT_TOKEN,
        PopupTypes.SELECT_BLOCKCHAIN,
        PopupTypes.CONFIRM_TRANSFER,
        PopupTypes.CONFIRM_EXCHANGE,
        PopupTypes.EOS_LINK_ACCOUNT,
    ].includes(popup.data.type);


}

export class PopupData {

    constructor(_type, _props, _callback = () => {}){
        this.type = _type;
        this.props = _props;
        this.callback = _callback;
    }

}
