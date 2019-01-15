import '../helpers';

import {assert} from 'chai';
import 'mocha';

// Just exports the built-in locale as JSON


import english from '../../src/localization/languages/english'
const flatEnglish = Object.keys(english).reduce((acc,x) => {
	acc[x] = english[x]('{x}');
	return acc;
}, {});



describe('Locales', async () => {

	it('should export json file', done => {
		new Promise(async() => {
			var fs = require('fs');
			fs.writeFile("test/unit/english.json", JSON.stringify(flatEnglish), function(err) {
				if (err) {
					console.log(err);
				}
				done();
			});
		})
	})



});

