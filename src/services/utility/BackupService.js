import * as Actions from '@walletpack/core/store/constants';
import StorageService from '../../services/electron/StorageService';
import {store} from "../../store/store";

export default class BackupService {

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

}