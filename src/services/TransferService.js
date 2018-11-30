import {Blockchains, BlockchainsArray} from '../models/Blockchains'
import PluginRepository from '../plugins/PluginRepository';
import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup'
import BigNumber from 'bignumber.js';
import TokenService from "./TokenService";

export default class TransferService {

    static async [Blockchains.ETH](params){
	    params.amount = TokenService.formatAmount(params.amount, params.token);
        return this.baseTransfer(params);
    }

    static async [Blockchains.TRX](params){
        params.amount = TokenService.formatAmount(params.amount, params.token);
        return this.baseTransfer(params);
    }

    static async [Blockchains.EOSIO](params){
        return this.baseTransfer(params);
    }

    static async baseTransfer(params){
        let {account, recipient, amount, memo, token } = params;
        const plugin = PluginRepository.plugin(account.blockchain());

        const transfer = await PluginRepository.plugin(account.blockchain())
            .transfer({
                account,
                to:recipient,
                amount,
                token,
                memo
            }).catch(x => x);


        if(transfer !== null) {
            if (transfer.hasOwnProperty('error')) {
                PopupService.push(Popup.snackbar(transfer.error, "attention-circled"));
                return false;
            }
            else {
                this.transferSuccessPopup(transfer, token.blockchain);
                return true;
            }
        }

    }

    static transferSuccessPopup(transfer, blockchain){
	    switch(blockchain){
		    case Blockchains.EOSIO:
			    PopupService.push(Popup.transactionSuccess(blockchain, transfer.transaction_id))
			    break;
		    case Blockchains.TRX:
			    PopupService.push(Popup.transactionSuccess(blockchain, transfer.txID))
			    break;
		    case Blockchains.ETH:
			    PopupService.push(Popup.transactionSuccess(blockchain, transfer.transactionHash))
			    break;
	    }
    }

}