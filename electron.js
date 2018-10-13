const {app, BrowserWindow, Tray, Menu, MenuItem} = require('electron');
const path = require("path");
const url = require("url");

const Transport = require('@ledgerhq/hw-transport-node-hid');
global.appShared = { Transport, ApiWatcher:null };

let tray, win;

const setupMenu = () => {
    const menu = new Menu();
    win.setMenu(menu);

    const template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: () => { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const createScatterInstance = () => {
    app.setAsDefaultProtocolClient('scatter');

    // Initialize the window to our specified dimensions
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        frame: false,
        radii: [5,5,5,5],
        icon:'assets/icon.png'
    });

    // win.openDevTools();

    let mainUrl = '';
    let trayIcon = '';
    if(process.mainModule.filename.indexOf('app.asar') === -1){
        mainUrl = 'http://localhost:8080/';
        trayIcon = 'static/icons/icon-tray.png';
    } else {
        mainUrl = url.format({
            pathname: path.join(__dirname, "dist", "index.html"),
            protocol: "file:",
            slashes: true
        });
        trayIcon = __dirname + '/static/icons/icon-tray.png';
    }
    win.loadURL(mainUrl);

    win.on('closed', () => win = null);
    win.on('close', () => app.quit());

    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Open', type: 'normal', click:() => {
            win.show();
            if(win.isMinimized()) win.restore();
        }},
        {label: 'Exit', type: 'normal', click:() => app.quit()}
    ]);
    tray.setToolTip('Scatter Desktop Companion');
    tray.setContextMenu(contextMenu);

    setupMenu();
};

const activateInstance = e => {
    if(e) e.preventDefault();
    if(!win) return;
    win.restore();
};

app.on('ready', createScatterInstance);
app.on('activate', activateInstance);
app.on('window-all-closed', () => app.quit())

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    const isLocal = url.startsWith('https://127.0.0.1');
    if (isLocal) {
        event.preventDefault()
        callback(true)
    } else {
        callback(false)
    }
})

const callDeepLink = url => {
    if(global.appShared.ApiWatcher !== null)
        global.appShared.ApiWatcher(url);
}

const shouldQuit = app.makeSingleInstance(argv => {
    if (process.platform === 'win32') callDeepLink(argv.slice(1))
    if (win) activateInstance();
})

if (shouldQuit) app.quit();

app.on('will-finish-launching', () => {
    app.on('open-url', (e, url) => {
        e.preventDefault();
        callDeepLink(url)
    })
});


