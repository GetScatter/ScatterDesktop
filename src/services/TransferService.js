import {Blockchains, BlockchainsArray} from '../models/Blockchains'
import PluginRepository from '../plugins/PluginRepository';
import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup'
import BigNumber from 'bignumber.js';

/***
 * Some blockchains need the amount to be parsed into a
 * string multiplied by their decimals.
 * @param amount
 * @param token
 * @returns {string}
 */
const formatAmount = (amount, token) => {
    let decimalString = '';
    for(let i = 0; i < token.decimals; i++){ decimalString += '0'; }
    return new BigNumber(amount.toString(10), 10).times(`1${decimalString}`).toString(10);
};

export default class TransferService {

    static async [Blockchains.ETH](params){
	    params.amount = formatAmount(params.amount, params.token);
        return this.baseTransfer(params);
    }

    static async [Blockchains.TRX](params){
        params.amount = formatAmount(params.amount, params.token);
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
                switch(token.blockchain){
                    case Blockchains.EOSIO:
                        PopupService.push(Popup.transactionSuccess(token.blockchain, transfer.transaction_id))
                        break;
                    case Blockchains.TRX:
                        PopupService.push(Popup.transactionSuccess(token.blockchain, transfer.txID))
                        break;
                    case Blockchains.ETH:
                        PopupService.push(Popup.transactionSuccess(token.blockchain, transfer.transactionHash))
                        break;
                }

                return true;
            }
        }

    }

}