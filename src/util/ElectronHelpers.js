const {clipboard, shell} = window.require('electron');
const remote = window.require('electron').remote;

export default class ElectronHelpers {

    static copy(txt){
        clipboard.writeText(txt);
    }

    static openLinkInBrowser(link){
        shell.openExternal(link);
    }

    static bindContextMenu(){
        const Menu = remote.Menu;

        const InputMenu = Menu.buildFromTemplate([{
            label: 'Cut',
            role: 'cut',
        }, {
            label: 'Copy',
            role: 'copy',
        }, {
            label: 'Paste',
            role: 'paste',
        }, {
            type: 'separator',
        }, {
            label: 'Select all',
            role: 'selectall',
        },
        ]);

        document.body.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let node = e.target;

            while (node) {
                if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
                    InputMenu.popup(remote.getCurrentWindow());
                    break;
                }
                node = node.parentNode;
            }
        });
    }

}