import ecc from 'eosjs-ecc';
const {PrivateKey} = ecc;
const ecurve = require('ecurve');
const Point = ecurve.Point;
const secp256k1 = ecurve.getCurveByName('secp256k1');
const BigInteger = require('bigi');
const ByteBuffer = require('bytebuffer')
const createHash = require('create-hash');
import AES from 'aes-oop';
const crypto = require('crypto');

import PluginRepository from '../plugins/PluginRepository';

const sha512 = s => createHash('sha512').update(s).digest('hex');
const toBinaryBuffer = o => (o ? Buffer.isBuffer(o) ? o : new Buffer(o, 'binary') : o)


export default class Crypto {

    static async generatePrivateKey(){
        return (await PrivateKey.randomKey()).toBuffer();
    }

    static bufferToPrivateKey(buffer, blockchain){
        return PluginRepository.plugin(blockchain).bufferToHexPrivate(buffer);
    }

    static privateKeyToBuffer(privateKey, blockchain){
        return PluginRepository.plugin(blockchain).hexPrivateToBuffer(privateKey);
    }

    static bufferToHash(buffer){
        return ecc.sha256(buffer);
    }

    static getEncryptionKey(privateKeyBuffer, publicKey, nonce){
        const sharedKey = Crypto.sharedSecret(privateKeyBuffer, publicKey);
        let ebuf = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
        ebuf.writeUint64(nonce)
        ebuf.append(sharedKey.toString('binary'), 'binary')
        ebuf = new Buffer(ebuf.copy(0, ebuf.offset).toBinary(), 'binary')
        return sha512(ebuf)
    }

    static sharedSecret(privateKeyBuffer, publicKey){
        let publicKeyBuffer = Buffer.from(publicKey);
        let keyBufferPoint = Point.fromAffine(
            secp256k1,
            BigInteger.fromBuffer( publicKeyBuffer.slice( 1,33 )), // x
            BigInteger.fromBuffer( publicKeyBuffer.slice( 33,65 )) // y
        )
        let P = keyBufferPoint.multiply(BigInteger.fromBuffer(privateKeyBuffer));
        let S = P.affineX.toBuffer({size: 32});
        return sha512(S)
    }

}