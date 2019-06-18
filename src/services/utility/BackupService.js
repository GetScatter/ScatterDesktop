import {remote} from '../../util/ElectronHelpers';
import * as Actions from '../../store/constants';
import {BACKUP_STRATEGIES} from '../../models/Settings';
import StorageService from './StorageService';
import StoreService from "./StoreService";
import ElectronHelpers from "../../util/ElectronHelpers";
import {getFolderLocation, saveFile} from "./FileService";
const fs = window.require('fs');

const getLatestScatter = () => StorageService.getScatter();

const saveBackup = (filepath) => {
	const scatter = getLatestScatter();
	const date = new Date();
	const month = date.getUTCMonth();
	const year = date.getUTCFullYear();
	const salt = StorageService.getSalt();
	const file = scatter + '|SLT|' + salt;
	const name = `scatter__${StoreService.get().state.scatter.hash.substr(0,4)}-${StoreService.get().state.scatter.hash.slice(-4)}__${StoreService.get().state.scatter.meta.version}__${month}-${year}.json`;

	return saveFile(filepath, name, file);
};

export default class BackupService {

    static async setBackupStrategy(strategy){
        const scatter = StoreService.get().state.scatter.clone();
        scatter.settings.autoBackup = strategy;
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async createBackup(){
        const location = getFolderLocation();
        if(! location) return false;

        return await saveBackup(location[0]);
    }

    static async setBackupLocation(location = null){
	    if(!location) location = (() => {
	        const f = getFolderLocation();
	        if(f) return f[0];
	        return null;
        })();
        if(!location) return false;
        const scatter = StoreService.get().state.scatter.clone();
        scatter.settings.backupLocation = location;
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async setDefaultBackupLocation(){
        const defaultPath = ElectronHelpers.getDefaultPath();
        const backupPath = `${defaultPath}/scatter_backups`;
        if(!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);
        return this.setBackupLocation(backupPath);
    }

    static async createAutoBackup(){
        if(!StoreService.get().state.scatter || !StoreService.get().state.scatter.settings) return;
        const strategy = StoreService.get().state.scatter.settings.autoBackup;
        if(!strategy || !strategy.length || strategy === BACKUP_STRATEGIES.MANUAL) return;

        const backupLocation = StoreService.get().state.scatter.settings.backupLocation;
        if(!backupLocation || !backupLocation.length) return false;


        return await saveBackup(backupLocation);
    }

}