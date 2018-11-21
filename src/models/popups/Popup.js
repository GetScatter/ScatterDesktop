import IdGenerator from '../../util/IdGenerator';
import * as ApiActions from '../api/ApiActions';

export const PopupDisplayTypes = {
    POP_IN:'popin',
    POP_OUT:'popout',
    POP_SIDE:'popside',
    SNACKBAR:'snackbar',
};

export class Popup {

    constructor(_displayType = PopupDisplayTypes.POP_IN, _data = new PopupData()){
        this.id = IdGenerator.numeric(24);
        this.displayType = _displayType;
        this.data = _data;
    }

    dimensions(){
        if(this.data.type === ApiActions.GET_OR_REQUEST_IDENTITY)   return {width:420, height:550};
        if(this.data.type === ApiActions.REQUEST_TRANSFER)          return {width:440, height:560};
        if(this.data.type === ApiActions.REQUEST_SIGNATURE)         return {width:1024, height:800};
        if(this.data.type === ApiActions.SUGGEST_NETWORK)       return {width:440, height:360};
        if(this.data.type === ApiActions.LINK_ACCOUNT)              return {width:440, height:360};
        if(this.data.type === ApiActions.GET_PUBLIC_KEY)            return {width:440, height:600};
        if(this.data.type === 'linkApp')                            return {width:440, height:360};

        return {width:800, height:600};
    }




    // FULL POP OUT ( external window )
	static popout(data, callback){
		return new Popup(PopupDisplayTypes.POP_OUT, new PopupData(data.type, data, callback))
	}







    static prompt(title, description, icon, buttonText, callback, denyButtonText = null){
        let params = { title, description, icon };
        if(buttonText) params.buttonText = buttonText;
        if(denyButtonText) params.denyButtonText = denyButtonText;
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.PROMPT, params, callback))
    }

    static checkHardwareWalletScreen(){
        return Popup.prompt('Check Hardware Wallet', 'Please check your hardware wallet screen.', 'eye');
    }

    static transactionSuccess(blockchain, tx, callback){
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.TX_SUCCESS, {blockchain, tx}, callback))
    }

    static textPrompt(title, description, icon, buttonText, input, callback){
        let params = { title, description, icon, buttonText, input };
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.TEXT_PROMPT, params, callback))
    }

    static selector(title, description, icon, items, parser, callback, warning = false){
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.SELECTOR, { title, description, icon, items, parser, warning }, callback))
    }

    static snackbar(message, icon, timeout = 3000){
        return new Popup(PopupDisplayTypes.SNACKBAR, new PopupData('', { message, icon, timeout }))
    }

    static mnemonic(phrase){
        const data = {
            phrase,
            icon:'key',
            title:'Your Password Backup',
            description:'This Mnemonic phrase is only a backup for your password, it will not regenerate your keys.',
            buttonText:'Okay'
        };
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.MNEMONIC, data, () => {}))
    };



    /*****************************************/
    /*********   FULLSCREEN POPINS ***********/
    /*****************************************/

	static verifyPassword(callback){
		return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.VERIFY_PASSWORD, {}, callback))
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

}

export const PopupTypes = {
    // OVERLAYS
    MNEMONIC:'mnemonic',
    PROMPT:'prompt',
    TEXT_PROMPT:'textPrompt',
    SELECTOR:'selector',

    // FULLSCREEN
    VERIFY_PASSWORD:'verifyPassword',
    EOS_CHANGE_PERMISSIONS:'eosChangePermissions',
	EOS_PROXY_VOTES:'eosProxyVotes',
	EOS_MODERATE_RAM:'eosModerateRam',
	EOS_MODERATE_CPU_NET:'eosModerateCpuNet',
	EOS_CREATE_ACCOUNT:'eosCreateAccount',
	UNLINK_ACCOUNT:'unlinkAccount',
	UNLINK_BLOCKCHAIN:'unlinkBlockchain',

    TX_SUCCESS:'txSuccess',
};

export const isFullscreen = popup => {
    return [
        PopupTypes.VERIFY_PASSWORD,
        PopupTypes.EOS_CHANGE_PERMISSIONS,
        PopupTypes.EOS_PROXY_VOTES,
        PopupTypes.UNLINK_ACCOUNT,
        PopupTypes.UNLINK_BLOCKCHAIN,
        PopupTypes.EOS_MODERATE_RAM,
        PopupTypes.EOS_MODERATE_CPU_NET,
        PopupTypes.EOS_CREATE_ACCOUNT,
    ].includes(popup.data.type);


}

export class PopupData {

    constructor(_type, _props, _callback = () => {}){
        this.type = _type;
        this.props = _props;
        this.callback = _callback;
    }

}
