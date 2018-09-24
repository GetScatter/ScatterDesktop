import { assert } from 'chai';
import 'mocha';
import Crypto from '../src/util/Crypto';


describe('Crypto', () => {
    it('should get key material', done => {
        new Promise(async () => {
            const material = await Crypto.generatePrivateKey();
            console.log('Generated buffer key from entropy', material);
            console.log('EOS Key from buffer', Crypto.bufferToPrivateKey(material, 'eos'))
            console.log('ETH Key from buffer', Crypto.bufferToPrivateKey(material, 'eth'))
            console.log('EOS Private key back to buffer', Crypto.privateKeyToBuffer(Crypto.bufferToPrivateKey(material, 'eos'), 'eos'))
            console.log('ETH Private key back to buffer', Crypto.privateKeyToBuffer(Crypto.bufferToPrivateKey(material, 'eth'), 'eth'))
            done();
        })
    })
})