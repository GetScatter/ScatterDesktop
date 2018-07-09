const {clipboard, shell} = window.require('electron');

export default class ElectronHelpers {

    static copy(txt){
        clipboard.writeText(txt);
    }

    static openLinkInBrowser(link){
        shell.openExternal(link);
    }

}