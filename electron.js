const {app, BrowserWindow, Tray, Menu, MenuItem} = require('electron');
const path = require("path");
const url = require("url");


let tray, mainWindow;

const setupMenu = () => {
    const menu = new Menu();
    mainWindow.setMenu(menu);

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
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        frame: false,
        radii: [5,5,5,5],
        icon:'static/icons/icon.png',
        resizable: true,
        minWidth: 620,
        minHeight:580
    });

    mainWindow.openDevTools();

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
    mainWindow.loadURL(mainUrl);

    mainWindow.on('closed', () => mainWindow = null);
    mainWindow.on('close', () => app.quit());

    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Open', type: 'normal', click:() => {
            mainWindow.show();
            if(mainWindow.isMinimized()) mainWindow.restore();
        }},
        {label: 'Exit', type: 'normal', click:() => app.quit()}
    ]);
    tray.setToolTip('Scatter Desktop Companion');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
	    mainWindow.show();
	    if(mainWindow.isMinimized()) mainWindow.restore();
    })

    setupMenu();

    LowLevelWindowService.onMainWindowReady();
};

const activateInstance = e => {
    if(e) e.preventDefault();
    if(!mainWindow) return;
    mainWindow.restore();
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
    if (mainWindow) activateInstance();
})

if (shouldQuit) app.quit();

app.on('will-finish-launching', () => {
    app.on('open-url', (e, url) => {
        e.preventDefault();
        callDeepLink(url)
    })
});






const getWindow = (width = 800, height = 600) => {
  return new Promise(resolve => {
    const win = new BrowserWindow({
      width,
      height,
      frame: false,
      radii: [5,5,5,5],
      icon:'assets/icon.png',
      show:false,
    });

    if(process.mainModule.filename.indexOf('app.asar') === -1){
      win.loadURL('http://localhost:8080/#/popout');
    } else {
      win.loadURL(url.format({
        pathname: path.join(app.getAppPath(), "dist", "index.html"),
        protocol: "file:",
        slashes: true,
        hash: '/popout'
      }));
    }

    win.once('ready-to-show', () => {
      resolve(win);
    });
  })
}

let waitingPopup;

class LowLevelWindowService {

  static async onMainWindowReady(){
    waitingPopup = await getWindow(1,1);
  }

  static async openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600){

    let win = waitingPopup;
    if(!win) win = await getWindow();
    else waitingPopup = null;
    win.setSize(width, height);
    win.center();

    onReady(win);
    win.show();
    win.setAlwaysOnTop(true);
    win.focus();
    win.setAlwaysOnTop(false);

    win.once('closed', async () => {
      if (process.platform === 'darwin') {
        mainWindow.hide();
        app.hide();
      }

      onClosed(win);
      win = null;
      waitingPopup = await getWindow(1, 1);

    });

    return win;
  }

}



const notifier = require("node-notifier");

let notificationIcon = '';
if(process.mainModule.filename.indexOf('app.asar') === -1){
	notificationIcon = 'static/icons/icon.png';
} else {
	notificationIcon = __dirname + '/static/icons/icon.png';
}

class NotificationService {
	static pushNotification(title, body){

		notifier.notify({
			message:body,
			title,
			appID:'com.get-scatter.server',
			sound: false,
			icon : 'static/icons/icon.png',
			wait:false
		});
	}

}


const Transport = require('@ledgerhq/hw-transport-node-hid');
global.appShared = { Transport, ApiWatcher:null, LowLevelWindowService, NotificationService };


