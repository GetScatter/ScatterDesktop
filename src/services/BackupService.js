import {store} from '../store/store';
import * as Actions from '../store/constants';
import {BACKUP_STRATEGIES} from '../models/Settings';
import StorageService from './StorageService';
import FileService from './FileService';

const getLatestScatter = () => StorageService.getScatter();
const exportFile = (filepath = undefined) => {
      const scatter = getLatestScatter();
      const salt = StorageService.getSalt();
      const file = scatter + '|SLT|' + salt;
      return FileService.exportData(file, 'scatter_backup', filepath);
};

export default class BackupService {

    static async setBackupStrategy(strategy){
        const scatter = store.state.scatter.clone();
        scatter.settings.autoBackup = strategy;
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async createBackup(){
        await exportFile();
    }

    static async setBackupLocation(){
        const scatter = store.state.scatter.clone();
        scatter.settings.backupLocation = FileService.getLocation();
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async createAutoBackup(){
        if(!store.state.scatter || !store.state.scatter.settings) return;
        const strategy = store.state.scatter.settings.autoBackup;
        if(!strategy || !strategy.length || strategy === BACKUP_STRATEGIES.MANUAL) return;

        const backupLocation = store.state.scatter.settings.backupLocation;
        if(!backupLocation || !backupLocation.length) return false;

        await exportFile(backupLocation);
    }

}
