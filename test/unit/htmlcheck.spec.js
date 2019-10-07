require('dotenv').config()

const {assert} = require('chai');
require('electron-mocha');
require('isomorphic-fetch');

const htmlcheck = require('../../electron/services/htmlcheck');


describe('htmlcheck', () => {

	it('should check the sources for embed', done => {
		new Promise(async() => {
			const result = await htmlcheck.check(null);
			console.log('result', result);
			done();
		})
	})


});
