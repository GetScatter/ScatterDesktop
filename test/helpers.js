require('jsdom-global')();

window.require = require;

process.env.NODE_ENV = 'testing';

// global.window = {
// 	require,
// };