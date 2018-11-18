import '../helpers';
import {testScatter} from '../mocks'

import {assert} from 'chai';
import 'mocha';
import BalanceService from "../../src/services/BalanceService";
import {store} from "../../src/store/store";
import {SET_SCATTER} from "../../src/store/constants";
import KeyPairService from "../../src/services/KeyPairService";

let scatter;
describe('BalanceService', async () => {

	it('should set scatter', done => {
		new Promise(async() => {
			scatter = await testScatter();
			store.dispatch(SET_SCATTER, scatter);
			done();
		})
	})

	it('should be able to get balances for a single account', done => {
		new Promise(async() => {
			assert(Object.keys(store.state.balances).length === 0, 'Already had balances');
			await BalanceService.loadBalancesFor(scatter.keychain.accounts[0]);
			assert(Object.keys(store.state.balances).length === 1, `Didn't add balances`);
			done();
		})
	});

	it('should be able to get all balances for all accounts', done => {
		new Promise(async() => {
			await BalanceService.loadAllBalances();
			assert(Object.keys(store.state.balances).length === 2, `Didn't add balances`);
			done();
		})
	});

	it('should be able to remove balances after removing a key', done => {
		new Promise(async() => {
			await KeyPairService.removeKeyPair(scatter.keychain.keypairs[0]);
			assert(store.state.scatter.keychain.keypairs.length === 0, 'Did not remove keypair');

			await BalanceService.removeStaleBalances();
			assert(Object.keys(store.state.balances).length === 0, `Didn't remove balances`);
			done();
		})
	});

});