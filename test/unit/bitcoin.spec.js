import '../helpers';
import {assert} from 'chai';
import 'mocha';

import Crypto from '../../src/util/Crypto';
import BTC from '../../src/plugins/defaults/btc'
import Keypair from "../../src/models/Keypair";
import KeyPairService from "../../src/services/secure/KeyPairService";
import {Blockchains} from "../../src/models/Blockchains";
const btc = new BTC();

describe('Bitcoin', () => {

	it('should set scatter', done => {
		new Promise(async() => {
			// const bufkey = await Crypto.generatePrivateKey();
			// assert(btc.validPrivateKey(bufkey), "Invalid private key");
			//
			// const wif = btc.bufferToHexPrivate(bufkey);
			// assert(btc.validPrivateKey(wif), "Invalid wif key")
			//
			// const address = btc.privateToPublic(bufkey);
			// assert(btc.validPublicKey(address), "Invalid Bitcoin address");
			// console.log(address);
			//
			// const balance = await btc.balancesFor({publicKey:address});
			// console.log(balance);

			// const account = {
			// 	publicKey:'18nmYzniAo18UrsztXzqgVF8WRsU5mbpHn',
			// 	network:() => btc.getEndorsedNetwork(),
			// }
			//
			// const balanceKnown = await btc.balancesFor(account);
			// console.log(balanceKnown);
			//
			// // Can't test transfer from units since it relies on data structures (store)
			// const testTransfer = await btc.transfer({
			// 	account,
			// 	to:address,
			// 	amount:200000,
			// 	promptForSignature:false,
			// })



			done();
		})
	})

});