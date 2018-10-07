import {Blockchains, BlockchainsArray} from '../models/Blockchains'
import {store} from '../store/store';
import * as Actions from '../store/constants';
import PluginRepository from '../plugins/PluginRepository';
import PopupService from './PopupService';
import PriceService from './PriceService';
import {Popup} from '../models/popups/Popup'

export default class TransferService {

    static blockchainFromRecipient(recipient){
        let blockchain;
        BlockchainsArray.map(({value}) => {
            if(blockchain) return;
            if(PluginRepository.plugin(value).isValidRecipient(recipient))
                blockchain = value;
        });
        return blockchain;
    }

    static async [Blockchains.ETH](params){
        return this.baseTransfer(params, false);
    }

    static async [Blockchains.TRX](params){
        return this.baseTransfer(params);
    }

    static async [Blockchains.EOSIO](params){
        return this.baseTransfer(params);
    }

    static async baseTransfer(params, parseDecimals = true){
        let {account, recipient, amount, memo, token } = params;
        const plugin = PluginRepository.plugin(account.blockchain());


        if(parseDecimals) {
            const decimals = PriceService.tokenDecimals(token);
            amount = parseFloat(amount).toFixed(decimals);
        }

        const transfer = await PluginRepository.plugin(account.blockchain())
            .transfer({
                account,
                to:recipient,
                amount,
                contract:token.account,
                symbol:token.symbol,
                memo
            }).catch(x => x);

        if(transfer !== null) {
            if (transfer.hasOwnProperty('error')) {
                PopupService.push(Popup.prompt("Transfer Error", transfer.error, "ban", "Okay"));
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