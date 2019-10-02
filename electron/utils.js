const path = require("path");
const url = require("url");

const isDev = process.mainModule.filename.indexOf('app.asar') === -1;

let icon = isDev
	? 'static/icons/icon.png'
	: __dirname + '/../static/icons/icon.png';

let trayIcon = isDev
	? 'static/icons/icon-tray.png'
	: __dirname + '/../static/icons/icon-tray.png';

// let mainUrl = isPopup => isDev ? `http://localhost:8080/${isPopup ? '/#/popout' : ''}` : url.format({
// 	pathname:  __dirname + '/../dist/index.html',
// 	protocol: "file:",
// 	slashes: true,
// 	hash:isPopup ? '/popout' : null
// });

let mainUrl = (isPopup = false, html = 'index') => url.format({
	pathname:  `${__dirname}/../html/${html}.html`,
	protocol: "file:",
	slashes: true,
	hash:isPopup ? '/popout' : null
});

module.exports = {
	isDev,
	mainUrl,
	icon,
	trayIcon,

}