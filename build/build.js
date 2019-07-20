const rm = require('rimraf')

rm('./dist', done => {
	require('./webpack.config.prod')
});