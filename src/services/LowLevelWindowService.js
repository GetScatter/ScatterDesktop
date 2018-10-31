const path = require("path");
const url = require("url");

const {app, BrowserWindow} = require('electron');


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

let waitingPopup;// = getWindow(1024, 800);
let mainWindow;

module.exports = class WindowService {

    static async setMainWindow(w){
      mainWindow = w;
      waitingPopup = await getWindow(1,1);
    }

    static async openPopOut(onReady = () => {}, onClosed = () => {}, width = 800, height = 600){

        let win = waitingPopup;
        if(!win) win = await getWindow();
        else waitingPopup = null;
        win.setSize(width, height);
        win.center();

        const show = () => {
          onReady(win);
          win.show();
          win.setAlwaysOnTop(true);
          win.focus();
          win.setAlwaysOnTop(false);
        };

        show();

        // if(win.ready){
        //   show();
        // } else {
        //   win.once('ready-to-show', () => {
        //     show();
        //   });
        // }



        win.once('closed', async () => {
            onClosed(win);
            win = null;
            waitingPopup = await getWindow(1, 1);
            if (process.platform === 'darwin') {
              mainWindow.hide();
              app.hide();
            }
        });





        return win;
    }

}
