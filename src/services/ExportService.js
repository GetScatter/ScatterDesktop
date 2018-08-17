const {remote} = window.require('electron');
import * as Actions from '../store/constants';
const fs = window.require('fs');

const getLocation = () => remote.dialog.showOpenDialog({properties: ['openDirectory']});
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
    })
};

export default class ExportService {

    static exportData(data, _filename){
        const location = getLocation();
        if(! location) return false;
        const filename = `${location[0]}/${_filename}`;

        return saveFile(data, filename);
    }

}
