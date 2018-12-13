require('jsdom-global')();

window.require = require;
window.crypto = {
	getRandomValues:(arr) => arr.fill(Math.round(Math.random() * 90000000000 + 10000000000), 0, 10)
};
window.HTMLCanvasElement.prototype.getContext = () => {};

process.on('unhandledRejection', error => {
	console.error(error);
});

process.env.NODE_ENV = 'testing';

// global.window = {
// 	require,
// };