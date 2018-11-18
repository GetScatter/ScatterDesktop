import '../helpers';
import {testScatter, mockEosAccount, mockTrxAccount} from '../mocks'

import {assert} from 'chai';
import 'mocha';
import AccountService from "../../src/services/AccountService";
import {store} from "../../src/store/store";
import {SET_SCATTER} from "../../src/store/constants";
import {Blockchains} from "../../src/models/Blockchains";
import PluginRepository from "../../src/plugins/PluginRepository";

const scatter = () => store.state.scatter;
describe('AccountService', async () => {

	it('should set scatter', done => {
		new Promise(async() => {
			store.dispatch(SET_SCATTER, await testScatter({
				withAccounts:false
			}));
			done();
		})
	})

	it('should be able to add an account', done => {
		new Promise(async() => {
			assert(scatter().keychain.accounts.length === 0, `Keychain already had accounts`);
			await AccountService.addAccount(mockEosAccount);
			assert(scatter().keychain.accounts.length === 1, `Could not add account`);
			done();
		})
	});

	it('should be able to remove an account', done => {
		new Promise(async() => {
			await AccountService.removeAccounts([scatter().keychain.accounts[0]]);
			assert(scatter().keychain.accounts.length === 0, `Could not remove account`);
			done();
		})
	});

	it('should be able to add all accounts for a keypair', done => {
		new Promise(async() => {
			await AccountService.importAllAccounts(scatter().keychain.keypairs[0]);

			// Accounts length is subject to change and should be checked periodically
			// to align tests with the real accounts connected.
			// TODO: Create real test key with a fixed amount of accounts perpetually.

			// 5 == 2 EOS accounts with 2 authorities, + 1 trx account.
			// https://bloks.io/key/EOS7w5aJCv5B7y3a6f4WCwPSvs6TpCAoRGnGpiLMsSWbmxaZdKigd
			// https://tronscan.org/#/address/TF2quv1hTipcZ8FJ8FRsXXLSiJ1C15dqkW
			assert(scatter().keychain.accounts.length === 5, `Could not import all accounts`);
			await AccountService.removeAccounts(scatter().keychain.accounts);
			assert(scatter().keychain.accounts.length === 0, `Could not remove all imported accounts`);
			done();
		})
	});

	it('should be able to get all accounts from a network', done => {
		new Promise(async() => {
			const plugin = PluginRepository.plugin(Blockchains.EOSIO);
			const networks = scatter().settings.networks;
			const accounts = [];
			const keypair = scatter().keychain.keypairs[0];
			await AccountService.accountsFrom(plugin, networks, accounts, keypair);
			assert(accounts.length === 4, `Could not import all accounts`);
			done();
		})
	});

	it('should be able to add all accounts for a network', done => {
		new Promise(async() => {
			const eosNetwork = scatter().settings.networks.find(x => x.blockchain === Blockchains.EOSIO);
			await AccountService.importAllAccountsForNetwork(eosNetwork);
			assert(scatter().keychain.accounts.length === 4, `Could not import all accounts`);
			done();
		})
	});

});