require('dotenv').config()

const {assert} = require('chai');
require('electron-mocha');
require('isomorphic-fetch');

const embedder = require('../../electron/services/embedder');


describe('embedder', () => {

	it('should check the sources for embed', done => {
		new Promise(async() => {
			const result = await embedder.cacheEmbedFiles(null);
			console.log('result', result);
			done();
		})
	})


});
