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

    static async [Blockchains.EOSIO](params){
        let {account, recipient, amount, memo, token } = params;
        const network = account.network();
        const plugin = PluginRepository.plugin(account.blockchain());

        const decimals = PriceService.tokenDecimals(token);

        amount = parseFloat(amount).toFixed(decimals);
        this.amount = amount;
        const transfer = await PluginRepository.plugin(account.blockchain())
            .transfer(
                account,
                recipient,
                amount,
                network,
                token.account,
                token.symbol,
                memo
            ).catch(x => x);

        if(transfer !== null) {
            if (transfer.hasOwnProperty('error')) PopupService.push(Popup.prompt("Transfer Error", transfer.error, "ban", "Okay"));
            else PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, transfer.transaction_id))
        }

        return true;
    }

}