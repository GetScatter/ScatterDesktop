import {assert} from 'chai';
import 'mocha';
import WebHashChecker from "../../src/services/utility/WebHashChecker";
import "isomorphic-fetch";

describe('Web Hash', () => {

	it('should get the web hash', done => {
		new Promise(async() => {
			console.log(await WebHashChecker.check());
			done();
		})
	})

});
