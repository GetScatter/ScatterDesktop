const {clipboard} = window.require('electron');

export default class ElectronHelpers {

    static copy(txt){
        clipboard.writeText(txt);
    }

}