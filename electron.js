const {app, BrowserWindow, Tray, Menu, MenuItem} = require('electron')
const path = require("path");
const url = require("url");

let tray = null;
let win = null;

const setupMenu = () => {
    const menu = new Menu();

    menu.append(new MenuItem({
        label: 'Print',
        accelerator: 'CmdOrCtrl+Shift+D',
        click: () => { win.toggleDevTools(); }
    }));

    // Menu.setApplicationMenu(menu)
    win.setMenu(menu);


  const template = [{
    label: "Application",
    submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
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

    setupMenu();



});

// app.on('activate', () => {
//     if (win === null) {
//         createWindow()
//     }
// });

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    const isLocal = url.startsWith('https://127.0.0.1');
    if (isLocal) {
        event.preventDefault()
        callback(true)
    } else {
        callback(false)
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
