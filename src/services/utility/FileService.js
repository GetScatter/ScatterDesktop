import {remote} from '../../util/ElectronHelpers';
const fs = window.require('fs');

export const getFileLocation = (extensions) => remote.dialog.showOpenDialog({ filters: [ { name: 'only', extensions } ] });
export const getFolderLocation = () => remote.dialog.showOpenDialog({properties: ['openDirectory']});

export const saveFile = (path, name, data, encoding = 'utf-8') => {
    return new Promise(resolve => {
	    try {
		    fs.writeFileSync(`${path}/${name}`, data, encoding);
		    resolve(true);
	    }
	    catch(e) {
		    console.error('Error saving file', e);
		    resolve(false);
	    }
    })
};