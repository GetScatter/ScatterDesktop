import ElectronHelpers from "../../util/ElectronHelpers";

export default class Injectable {

	static async appPath(){
		return ElectronHelpers.getDefaultPath();
	}

	static async openLink(link, filepath = false){
		console.log('opening link')
		return ElectronHelpers.openLinkInBrowser(link, filepath);
	}

	static async copy(text){
		return ElectronHelpers.copy(text);
	}

}