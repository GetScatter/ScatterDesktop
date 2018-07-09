const {app, BrowserWindow, Tray, Menu} = require('electron')
const path = require("path");
const url = require("url");

let tray = null;
let win = null;

app.on('ready', function () {

    // Initialize the window to our specified dimensions
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        // width: 800,
        // height: 600,
        frame: false,
        radii: [5,5,5,5],
        icon:'assets/icon.png'
    });

    // win.openDevTools();

    let mainUrl = '';
    let trayIcon = '';
    if(process.mainModule.filename.indexOf('app.asar') === -1){
        mainUrl = 'http://localhost:8080/';
        trayIcon = 'static/icons/icon.png';
    } else {
        mainUrl = url.format({
            pathname: path.join(__dirname, "dist", "index.html"),
            protocol: "file:",
            slashes: true
        });
        trayIcon = __dirname + '/static/icons/icon.png';
    }
    win.loadURL(mainUrl);



    // win.loadURL('http://localhost:8080/');
    // win.loadURL('http://localhost:8080/#/popout');

    win.on('closed', () => {
        win = null;
    });

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

    // win.setMenu(null);

});

// app.on('activate', () => {
//     if (win === null) {
//         createWindow()
//     }
// });

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});