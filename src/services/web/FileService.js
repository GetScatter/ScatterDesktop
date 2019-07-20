// const fs = require('fs');

export const getFileLocation = (extensions) => {
	// todo:
	// remote.dialog.showOpenDialog({ filters: [ { name: 'only', extensions } ] });
}

export const getFolderLocation = () => {
	// todo:
	// remote.dialog.showOpenDialog({properties: ['openDirectory']});
}

export const saveFile = (path, name, data, encoding = 'utf-8') => {
	// todo:
	// return new Promise(resolve => {
	// 	try {
	// 		fs.writeFileSync(`${path}/${name}`, data, encoding);
	// 		resolve(true);
	// 	}
	// 	catch(e) {
	// 		// TODO:
	// 		// console.error('Error saving file', e);
	// 		resolve(false);
	// 	}
	// })
};

export const uploadAvatar = () => {
	return true;
}