const {remote} = window.require('electron');
import * as Actions from '../store/constants';
const fs = window.require('fs');

const saveFile = (data, _filename) => {
    return new Promise(resolve => {
        const date = new Date();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();
        const file = JSON.stringify(data);
        const filename = `${_filename}_${month}-${year}.json`
        try {
            fs.writeFileSync(filename, file, 'utf-8');
            resolve(true);
        }
        catch(e) {
            console.error('Error saving file', e);
            resolve(false);
        }
    });
};

const getLocation = (location) => {
    if(!location) return false;
    return location[0];
}

export default class FileService {

    static getFileLocation(){
        const location = remote.dialog.showOpenDialog({ filters: [ { name: 'JSON', extensions: ['json'] } ] });
        return getLocation(location);
    }

    static getFolderLocation(){
        const location = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        return getLocation(location);
    }

    static exportData(data, _filename, location = this.getFolderLocation()){
        const filename = `${location}/${_filename}`;
        return saveFile(data, filename);
    }

}
