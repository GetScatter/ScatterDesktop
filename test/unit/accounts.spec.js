import '../helpers';
import {testScatter, mockKeypair, mockEosAccount, mockTrxAccount, mockNetworks} from '../mocks'

import {assert} from 'chai';
import 'mocha';
import AccountService from "../../src/services/blockchain/AccountService";
import {store} from "../../src/store/store";
import {SET_SCATTER} from "../../src/store/constants";
import {Blockchains} from "../../src/models/Blockchains";
import PluginRepository from "../../src/plugins/PluginRepository";
import Account from "../../src/models/Account";

const scatter = () => store.state.scatter;
describe('Account Model', () => {

	it('should set scatter', done => {
		new Promise(async() => {
			store.dispatch(SET_SCATTER, await testScatter({
				withAccounts:false
			}));
			done();
		})
	})

	it('should create a placeholder account', () => {
		const placeholder = Account.placeholder();
		assert(placeholder instanceof Account, `placeholder was not an instance of account`);
	});

	it('should create a network from JSON', () => {
		const account = Account.fromJson(mockEosAccount);
		assert(account instanceof Account, `placeholder was not an instance of account`);
		assert(account.name === mockEosAccount.name, `Account names did not match`);
		assert(account.publicKey === mockEosAccount.publicKey, `Account keys did not match`);
	});

	it('should get a new unique identifier for each network, but the same for ones with the same data', () => {
		const sameAsEos = Account.fromJson(mockEosAccount);
		assert(sameAsEos.unique() === mockEosAccount.unique(), `Account uniques did not match`);
		assert(mockEosAccount.unique() !== mockTrxAccount.unique(), `Account uniques matched`);
	});

	it('should be able to get a network from an account', () => {
		const eosNetwork = mockNetworks.find(x => x.blockchain === Blockchains.EOSIO);
		assert(mockEosAccount.network().unique() === eosNetwork.unique(), `Invalid network from account`)
	});

	it('should be able to get a keypair from an account', () => {
		assert(mockEosAccount.keypair().unique() === mockKeypair.unique(), `Invalid keypair from account`)
	});

	it('should be able to get a blockchain from an account', () => {
		assert(mockEosAccount.blockchain() === Blockchains.EOSIO, `Invalid blockchain from account`)
	});

	it('should be able to get a sendable name', () => {
		assert(mockEosAccount.sendable() !== `${mockEosAccount.name}@${mockEosAccount.authority}`, `Got malformed sendable (EOSIO)`);
		assert(mockEosAccount.sendable() === mockEosAccount.name, `Invalid sendable name (EOSIO)`);
		assert(mockTrxAccount.sendable() === mockTrxAccount.publicKey, `Invalid sendable name (Tron)`);
	});

	it('should be able to get a formatted name', () => {
		assert(mockEosAccount.formatted() === `${mockEosAccount.name}@${mockEosAccount.authority}`, `Got malformed formatted (EOSIO)`);
		assert(mockEosAccount.formatted() !== mockEosAccount.name, `Invalid formatted name (EOSIO)`);
		assert(mockTrxAccount.formatted() === mockTrxAccount.publicKey, `Invalid formatted name (Tron)`);
	});

	it('should be able to get an identifier which is the same for same accounts with different authorities', () => {
		const ownerEos = mockEosAccount.clone();
		ownerEos.authority = 'owner';
		assert(mockEosAccount.identifiable() === ownerEos.identifiable(), `Identifiers did not match`)
	});

	it('should be able to get a returnable account json based on blockchain', () => {
		const eosReturnable = mockEosAccount.asReturnable();
		assert(eosReturnable.hasOwnProperty('name'), `Invalid EOSIO returnable (name)`);
		assert(eosReturnable.hasOwnProperty('authority'), `Invalid EOSIO returnable (authority)`);
		assert(eosReturnable.hasOwnProperty('publicKey'), `Invalid EOSIO returnable (publicKey)`);
		assert(eosReturnable.hasOwnProperty('blockchain'), `Invalid EOSIO returnable (blockchain)`);
		assert(!eosReturnable.hasOwnProperty('address'), `Invalid EOSIO returnable (address)`);


		const trxReturnable = mockTrxAccount.asReturnable();
		assert(trxReturnable.hasOwnProperty('address'), `Invalid Tron returnable (address)`);
		assert(trxReturnable.hasOwnProperty('blockchain'), `Invalid Tron returnable (blockchain)`);
		assert(!trxReturnable.hasOwnProperty('publicKey'), `Invalid Tron returnable (publicKey)`);
	});

});

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