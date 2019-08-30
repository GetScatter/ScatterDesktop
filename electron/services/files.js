const {remote} = require('electron');
const fs = require('fs');

const getFileLocation = (extensions) => remote.dialog.showOpenDialog({ filters: [ { name: 'only', extensions } ] });
const getFolderLocation = () => remote.dialog.showOpenDialog({properties: ['openDirectory']});

const saveFile = (path, name, data, encoding = 'utf-8') => {
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

module.exports = {
	getFileLocation,
	getFolderLocation,
	saveFile
}