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
        if(this.data.type === ApiActions.GET_OR_REQUEST_IDENTITY)   return {width:440, height:560};
        if(this.data.type === ApiActions.REQUEST_SIGNATURE)         return {width:1024, height:800};
        if(this.data.type === ApiActions.REQUEST_ADD_NETWORK)       return {width:440, height:360};
        if(this.data.type === 'linkApp')                            return {width:440, height:360};

        return {width:800, height:600};
    }

    static prompt(title, description, icon, buttonText, callback, denyButtonText = null){
        let params = { title, description, icon, buttonText };
        if(denyButtonText) params = Object.assign(params, {denyButtonText});
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.PROMPT, params, callback))
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

    static buySellRAM(account, callback){
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.BUY_SELL_RAM, { account }, callback))
    }

    static delegateResources(account, callback){
        return new Popup(PopupDisplayTypes.POP_IN, new PopupData(PopupTypes.DELEGATE_RESOURCES, { account }, callback))
    }

    static popout(data, callback){
        return new Popup(PopupDisplayTypes.POP_OUT, new PopupData(data.type, data, callback))
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

    static invalidIdentityName(){
        return Popup.snackbar("The name you entered is invalid. Names but be between 3-20 characters and include only a-Z, 0-9 and - or _", "ban");
    };

}

export const PopupTypes = {
    MNEMONIC:'mnemonic',
    PROMPT:'prompt',
    TEXT_PROMPT:'textPrompt',
    SELECTOR:'selector',
    BUY_SELL_RAM:'buySellRAM',
    DELEGATE_RESOURCES:'delegateResources',
    TX_SUCCESS:'txSuccess',
};

export class PopupData {

    constructor(_type, _props, _callback = () => {}){
        this.type = _type;
        this.props = _props;
        this.callback = _callback;
    }

}
