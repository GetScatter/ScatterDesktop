import '../helpers';
import {testScatter, mockEosAccount, mockTrxAccount, mockNetworks} from '../mocks'

import {assert} from 'chai';
import 'mocha';
import {store} from "../../src/store/store";
import {SET_SCATTER} from "../../src/store/constants";
import {Blockchains} from "../../src/models/Blockchains";
import PluginRepository from "../../src/plugins/PluginRepository";
import NetworkService from "../../src/services/NetworkService";
import Network from "../../src/models/Network";
import Token from "../../src/models/Token";

const jungleNetwork = Network.fromJson({
	name:'Jungle',
	blockchain:Blockchains.EOSIO,
	host:'dev.cryptolions.io',
	port:18888,
	protocol:'http',
	chainId:'038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
});

describe('Network Model', () => {

	it('should create a placeholder network', () => {
		const placeholder = Network.placeholder();
		assert(placeholder instanceof Network, `placeholder was not an instance of network`);
	});

	it('should create a network from JSON', () => {
		const network = Network.fromJson(jungleNetwork);
		assert(network instanceof Network, `placeholder was not an instance of network`);
		assert(network.chainId === jungleNetwork.chainId, `Network chain ids did not match`);
	});

	it('should create a network from a unique identifier', () => {
		const unique = jungleNetwork.unique();
		const network = Network.fromUnique(unique);
		assert(network instanceof Network, `placeholder was not an instance of network`);
		assert(network.blockchain === jungleNetwork.blockchain, `Network blockchains did not match`);
		assert(network.chainId === jungleNetwork.chainId, `Network chain ids did not match`);
	});

	it('should get a new unique identifier for each network, but the same for ones with the same data', () => {
		const sameAsJungle = Network.fromJson(jungleNetwork);
		const tronNetwork = mockNetworks.find(x => x.blockchain === Blockchains.TRX);
		assert(sameAsJungle.unique() === jungleNetwork.unique(), `Network uniques did not match`);
		assert(jungleNetwork.unique() !== tronNetwork.unique(), `Network uniques matched`);
	});

	it('should get a properly formatted fullhost from a network', () => {
		const fullhost = `${jungleNetwork.protocol}://${jungleNetwork.host}:${jungleNetwork.port}`;
		assert(jungleNetwork.fullhost() === fullhost, `Full host was invalid.`)
	});

	it('should know if a network is valid', () => {
		let network;
		const reset = () => network = jungleNetwork.clone();
		reset();

		assert(network.isValid(), `Network should have been valid`);

		network.blockchain = 'none';
		assert(!network.isValid(), `Network should have been invalid (blockchain)`);
		reset();

		network.host = '';
		assert(!network.isValid(), `Network should have been invalid (host)`);
		reset();

		network.chainId = '';
		assert(!network.isValid(), `Network should have been invalid (chainId)`);

		network = Network.placeholder();
		assert(!network.isValid(), `Network should have been invalid (placeholder)`);
	});

	it('should set the port if undefined', () => {
		const network = jungleNetwork.clone();
		network.port = null;
		network.protocol = 'http';
		network.setPort();
		assert(network.port === 80, `Network port was improperly set.`);

		network.port = null;
		network.protocol = 'https';
		network.setPort();
		assert(network.port === 443, `Network port was improperly set.`);
	});

	it('should get a default system token if none is specified', () => {
		const defaultToken = PluginRepository.plugin(Blockchains.EOSIO).defaultToken();
		const systemToken = jungleNetwork.systemToken();
		assert(defaultToken.unique() === systemToken.unique(), `System token was not default token`);
	});

	it('should get a specified system token', () => {
		const defaultToken = PluginRepository.plugin(Blockchains.EOSIO).defaultToken();

		const network = jungleNetwork.clone();

		const customToken = defaultToken.clone();
		customToken.symbol = 'TEST';
		network.token = customToken;

		const systemToken = network.systemToken();
		assert(defaultToken.unique() !== systemToken.unique(), `System token was not default token`);
	});

});

const scatter = () => store.state.scatter;
describe('NetworkService', async () => {

	it('should set scatter', done => {
		new Promise(async() => {
			store.dispatch(SET_SCATTER, await testScatter({
				withNetworks:false,
			}));
			done();
		})
	});

	it('should be able to add a network', done => {
		new Promise(async() => {
			assert(scatter().settings.networks.length === 0, `Already has networks`);
			const network = mockNetworks.find(x => x.blockchain === Blockchains.EOSIO);
			await NetworkService.addNetwork(network);
			assert(scatter().settings.networks.length === 1, `Did not add 1 network`);
			assert(scatter().keychain.accounts.length === 4, `Did not add accounts for keypair from new network.`);
			done();
		})
	});

	it('should be able to add another network', done => {
		new Promise(async() => {
			await NetworkService.addNetwork(jungleNetwork);
			assert(scatter().settings.networks.length === 2, `Did not add 1 network`);
			assert(scatter().keychain.accounts.length === 8, `Did not add accounts for keypair from new network.`);
			done();
		})
	});

	it(`should be able to update a network`, done => {
		new Promise(async() => {
			jungleNetwork.name = 'TEST';
			await NetworkService.updateNetwork(jungleNetwork);
			assert(scatter().settings.networks.find(x => x.chainId === jungleNetwork.chainId).name === 'TEST', `Did not update network`);
			done();
		})
	});

	it(`should be able to remove a network and all of it's accounts`, done => {
		new Promise(async() => {
			await NetworkService.removeNetwork(jungleNetwork);
			assert(scatter().settings.networks.length === 1, `Did not remove 1 network`);
			assert(scatter().keychain.accounts.length === 4, `Did not remove accounts for removed network.`);
			done();
		})
	});

});