import ElectronHelpers from "../../util/ElectronHelpers";

export default class Injectable {

	static async appPath(){
		return ElectronHelpers.getDefaultPath();
	}

	static async openLink(link){
		return ElectronHelpers.openLinkInBrowser(link);
	}

	static async copy(text){
		return ElectronHelpers.copy(text);
	}

}