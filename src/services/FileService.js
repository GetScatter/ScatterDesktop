const {remote} = window.require('electron');
import * as Actions from '../store/constants';
const fs = window.require('fs');

const saveFile = (data, _filename) => {
    return new Promise(resolve => {
        const date = new Date();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();
        const file = JSON.stringify(data);
        const filename = `${_filename}_${month}-${year}.txt`
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

const getFilename = () => {
    const filename = remote.dialog.showOpenDialog({properties: ['openFile']});
    if(!filename) return false;
    return filename[0];
}

export default class FileService {

    static getLocation(){
        const location = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        if(!location) return false;
        return location[0];
    }

    static exportData(data, _filename, location = this.getLocation()){
        const filename = `${location}/${_filename}`;

        return saveFile(data, filename);
    }

}
