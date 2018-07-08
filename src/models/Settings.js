import Network from './Network';
import {LANG} from '../localization/locales';

export const BACKUP_STRATEGIES = {
    MANUAL:'manual',
    AUTOMATIC:'auto'
}

export default class Settings {

    constructor(){
        this.networks = [];
        this.language = LANG.ENGLISH;
        this.autoBackup = BACKUP_STRATEGIES.MANUAL;
        this.backupLocation = '';
    }

    static placeholder(){ return new Settings(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        if(json.hasOwnProperty('networks')) p.networks = json.networks.map(x => Network.fromJson(x));
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