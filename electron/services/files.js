const {dialog, app} = require('electron');
const fs = require('fs');

const getDefaultPath = () => app.getPath('userData');
const getFileLocation = (extensions) => dialog.showOpenDialog({ filters: [ { name: 'only', extensions } ] });
const getFolderLocation = () => dialog.showOpenDialog({properties: ['openDirectory']});

const saveFile = (path, name, data, encoding = 'utf-8') => {
	if(`${path}/${name}` === `${getDefaultPath()}/scatter.json`) {
		console.error('cannot manually overwrite scatter.json data');
		return false;
	}

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

const openFile = (path, encoding = 'utf-8') => {
	return new Promise(resolve => {
		try {
			fs.readFile(path, encoding, (err, data) => {
				if(err) {
					console.error('err', err);
					resolve(null);
				}

				resolve(data);
			});
		}
		catch(e) {
			console.error('Error opening file', e);
			resolve(null);
		}
	})
};

const existsOrMkdir = (path) => {
	if(!fs.existsSync(path)) fs.mkdirSync(path);
	return true;
}

module.exports = {
	getDefaultPath,
	getFileLocation,
	getFolderLocation,
	existsOrMkdir,
	saveFile,
	openFile
}