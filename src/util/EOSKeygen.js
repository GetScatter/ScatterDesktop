import Keypair from '../models/Keypair';
import Mnemonic from './Mnemonic';
import {PrivateKey} from 'eosjs-ecc';

export default class EOSKeygen {

    /***
     * Generates a Keypair
     * @returns {Keypair}
     */
    static generateKeys(){
        let [mnemonic, seed] = Mnemonic.generateDanglingMnemonic();
        let privateKey = EOSKeygen.generatePrivateKey(seed);
        let publicKey = EOSKeygen.privateToPublic(privateKey);
        return Keypair.fromJson({publicKey, privateKey})
    }

    /***
     * Generates only a private key
     * @param seed - The seed to build the key from
     * @returns {wif}
     */
    static generatePrivateKey(seed) {
        return PrivateKey.fromSeed(seed).toWif()
    }

    /***
     * Converts a private key to a public key
     * @param privateKey - The private key to convert
     */
    static privateToPublic(privateKey) {
        return PrivateKey.fromWif(privateKey).toPublic().toString()
    }

    /***
     * Checks if a private key is a valid EOS private key
     * @param privateKey - The private key to check
     * @returns {boolean}
     */
    static validPrivateKey(privateKey){
        return PrivateKey.isValid(privateKey);
    }

}