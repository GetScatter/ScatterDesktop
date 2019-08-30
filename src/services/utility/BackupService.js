import * as Actions from '@walletpack/core/store/constants';
import {BACKUP_STRATEGIES} from '@walletpack/core/models/Settings';
import StorageService from '../../services/electron/StorageService';
import {store} from "../../store/store";

const saveBackup = (filepath) => {
	const scatter = StorageService.getScatter();
	const date = new Date();
	const month = date.getUTCMonth();
	const year = date.getUTCFullYear();
	const salt = StorageService.getSalt();
	const file = scatter + '|SLT|' + salt;
	const name = `scatter__${store.state.scatter.hash.substr(0,4)}-${store.state.scatter.hash.slice(-4)}__${store.state.scatter.meta.version}__${month}-${year}.json`;

	return StorageService.saveFile(filepath, name, file);
};

export default class BackupService {

	static async setBackupStrategy(strategy){
		const scatter = store.state.scatter.clone();
		scatter.settings.autoBackup = strategy;
		return store.dispatch(Actions.SET_SCATTER, scatter);
	}

	static async createBackup(){

		const location = StorageService.getFolderLocation();
		if(! location) return false;

		return await saveBackup(location[0]);
	}

	static async setBackupLocation(location = null){
		if(!location) location = (() => {
			const f = StorageService.getFolderLocation();
			if(f) return f[0];
			return null;
		})();
		if(!location) return false;
		const scatter = store.state.scatter.clone();
		scatter.settings.backupLocation = location;
		return store.dispatch(Actions.SET_SCATTER, scatter);
	}

	static async setDefaultBackupLocation(){
		const defaultPath = StorageService.getDefaultPath();
		const backupPath = `${defaultPath}/scatter_backups`;
		// TODO: Check if this works without mkdir.
		//if(!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);
		return this.setBackupLocation(backupPath);
	}

	static async createAutoBackup(){
		if(!store.state.scatter || !store.state.scatter.settings) return;
		const strategy = store.state.scatter.settings.autoBackup;
		if(!strategy || !strategy.length || strategy === BACKUP_STRATEGIES.MANUAL) return;

		const backupLocation = store.state.scatter.settings.backupLocation;
		if(!backupLocation || !backupLocation.length) return false;


		return await saveBackup(backupLocation);
	}

}