import '../helpers';
import {testScatter} from '../mocks'

import {assert} from 'chai';
import 'mocha';
import {store} from "../../src/store/store";
import {SET_SCATTER} from "../../src/store/constants";
import Locale from "../../src/models/Locale";

// Just exports the built-in locale as JSON


import english from '../../src/localization/languages/english'
const flatEnglish = Object.keys(english).reduce((acc,x) => {
	acc[x] = english[x]('{x}');
	return acc;
}, {});

var fs = require('fs');
fs.writeFile("test/unit/english.json", JSON.stringify(flatEnglish), function(err) {
	if (err) {
		console.log(err);
	}
});

