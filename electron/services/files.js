const {dialog, app} = require('electron');
const fs = require('fs');

const getDefaultPath = () => process.env.TESTING ? './test/exports' : app.getPath('userData');
const getFileLocation = (extensions) => dialog.showOpenDialog({ filters: [ { name: 'only', extensions } ] });
const getFolderLocation = () => dialog.showOpenDialog({properties: ['openDirectory']});

let internals = true;
const toggleAllowInternals = (bool) => internals = bool;
const saveFile = (path, name, data, encoding = 'utf-8') => {
	if(`${path}/${name}` === `${getDefaultPath()}/scatter.json`) {
		console.error('cannot manually overwrite scatter.json data');
		return false;
	}

	if(name.indexOf('.') === -1) {
		console.error('File must be [html, js, jpg]');
		return false;
	}

	const lastPeriod = name.lastIndexOf('.');
	const ext = name.substring(lastPeriod+1,name.length);
	const allowed = internals ? ['html', 'js', 'css', 'json', 'jpg', 'timestamp'] : ['json', 'jpg'];
	if(!allowed.includes(ext)){
		console.error('Cannot save files that are not', JSON.stringify(allowed));
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
				if(err) return resolve(null);
				resolve(data);
			});
		}
		catch(e) {
			console.error('Error opening file', e);
			resolve(null);
		}
	})
};

const removeFile = path => {
	if(path.indexOf(getDefaultPath()) !== 0) return console.error('Cannot remove files from outside the default directory');
	return new Promise(resolve => {
		try {
			fs.unlink(path, (err) => {
				if(err) return resolve(null);
				resolve(true);
			});
		}
		catch(e) {
			console.error('Error removing file', e);
			resolve(null);
		}
	});
}

const exists = path => {
	return fs.existsSync(path);
}

const existsOrMkdir = (path) => {
	if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
	return true;
};

const getFilesForDirectory = async (path) => {
	return fs.readdirSync(path);
};

module.exports = {
	toggleAllowInternals,
	getDefaultPath,
	getFileLocation,
	getFolderLocation,
	exists,
	existsOrMkdir,
	saveFile,
	openFile,
	getFilesForDirectory,
	removeFile
}
