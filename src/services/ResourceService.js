import PluginRepository from '../plugins/PluginRepository';
import {Blockchains} from '../models/Blockchains';
import Account from '../models/Account';
import PopupService from './PopupService';
import {Popup} from '../models/popups/Popup';

export default class ResourceService {

    static async transactionNeedsResources(accounts){
        const accountsNeedingResources = (await Promise.all(accounts.map(async account => {
            account = Account.fromJson(account);
            if(await ResourceService.needsResources(account)) return account;
            else return false;
        }))).filter(x => !!x);

        if(!accountsNeedingResources.length) return false;

        return new Promise(resolve => {
            PopupService.push(Popup.prompt('You need resources!',
                'This transaction would deplete your resources. Do you want to allocate some more now?', async bool => {
                    if(!bool) return resolve(false);
                    resolve(accountsNeedingResources);
                }))
        });
    }

    static usesResources(account){
        account = Account.fromJson(account);
        const plugin = PluginRepository.plugin(account.blockchain());
        return plugin.usesResources();
    }

    static async needsResources(account){
        account = Account.fromJson(account);
        const plugin = PluginRepository.plugin(account.blockchain());
        if(!plugin.usesResources()) return false;
        return plugin.needsResources(account);
    }

    static async addResources(account){
        account = Account.fromJson(account);
        const plugin = PluginRepository.plugin(account.blockchain());
        if(!plugin.usesResources()) return false;
        return plugin.addResources(account);
    }

    static async getResourcesFor(account){
        account = Account.fromJson(account);
        const plugin = PluginRepository.plugin(account.blockchain());
        if(!plugin.usesResources()) return [];
        return plugin.getResourcesFor(account);
    }

    static async moderateResource(resource, account){
        account = Account.fromJson(account);
        const plugin = PluginRepository.plugin(account.blockchain());
        if(!plugin.usesResources()) return [];
        return plugin.moderateResource(resource, account);
    }

}