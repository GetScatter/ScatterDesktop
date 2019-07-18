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

export const uploadAvatar = () => {
	// TODO: FIX!
	return true;
	// //TODO: I'm not sure this is the best way to go about this.
	// /***
	//  * It's possible that this could inflate the saved json and backups significantly.
	//  * It might be best to have it as images, but that wouldn't persist for backups.
	//  * Need to give this a think.
	//  */
	//
	// let filepath = await getFileLocation(['jpg', 'png', 'jpeg']);
	// if(!filepath || !filepath.length) return;
	// filepath = filepath[0];
	// let ext = filepath.split('.');
	// ext = ext[ext.length-1];
	//
	// const base64 = fs.readFileSync(filepath, { encoding: 'base64' });
	// if(!base64) return PopupService.push(Popup.snackbar("Error converting image file."));
	//
	// // Resizing to 350x350 MAX (ratio preserved)
	// // -------------------------------------------
	// const canvas = document.createElement("canvas");
	// const ctx = canvas.getContext("2d");
	// const image = new Image();
	//
	// image.onload = e => {
	// 	const calculateAspectRatioFit = () => {
	// 		const ratio = Math.min(350 / image.width, 350 / image.height);
	// 		return { width: Math.round(image.width*ratio), height: Math.round(image.height*ratio) };
	// 	}
	//
	// 	canvas.height = calculateAspectRatioFit().height;
	// 	canvas.width = calculateAspectRatioFit().width;
	//
	// 	ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, calculateAspectRatioFit().width, calculateAspectRatioFit().height);
	// 	const resized = new Image();
	// 	resized.src = canvas.toDataURL(`image/${ext}`);
	//
	// 	const scatter = this.scatter.clone();
	// 	scatter.keychain.avatars[this.identity.id] = resized.src;
	// 	this[Actions.SET_SCATTER](scatter);
	// };
	//
	// image.src = `data:image/${ext};base64, ${base64}`;
	// // -------------------------------------------
}