import '../helpers';

import {assert} from 'chai';
import 'mocha';
import StorageService from "../../src/services/StorageService";


describe('BalanceService', () => {


	it('should work', done => {
		new Promise(async() => {
			await StorageService.setScatter({hi:'byte'});
			const scatter = await StorageService.getScatter();
			console.log('scatter', scatter);
			done();
		})
	})

});