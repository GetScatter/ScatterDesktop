import Network from './Network';
import {LANG} from '../localization/locales';
import PluginRepository from '../plugins/PluginRepository';
import Token from "./Token";
import Explorer from "./Explorer";

export const BACKUP_STRATEGIES = {
    MANUAL:'manual',
    AUTOMATIC:'auto'
}

export default class Settings {

    constructor(){
        this.networks = [];
        this.language = LANG.ENGLISH;
        this.autoBackup = BACKUP_STRATEGIES.AUTOMATIC;
        this.backupLocation = '';
        this.explorers = PluginRepository.defaultExplorers();
        this.displayToken = null;
        this.tokens = [];
        this.blacklistTokens = [];
        this.showNotifications = true;
    }

    static placeholder(){ return new Settings(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('networks')) p.networks = json.networks.map(x => Network.fromJson(x));
        if(json.hasOwnProperty('tokens')) p.tokens = json.tokens.map(x => Token.fromJson(x));
        if(json.hasOwnProperty('blacklistTokens')) p.blacklistTokens = json.blacklistTokens.map(x => Token.fromJson(x));
        if(json.hasOwnProperty('explorers')) p.explorers = Object.keys(json.explorers).reduce((acc, blockchain) => {
            acc[blockchain] = Explorer.fromJson(json.explorers[blockchain]);
            return acc;
        }, {});
        return p;
    }

    updateOrPushNetwork(network){
        this.networks.find(n => n.id === network.id)
            ? this.networks = this.networks.map(n => n.id === network.id ? network : n)
            : this.networks.unshift(network);
    }

    removeNetwork(network){
        this.networks = this.networks.filter(n => n.id !== network.id);
    }
}
