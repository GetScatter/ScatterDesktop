import Hasher from "./Hasher";
import bip39 from 'bip39'

export class Mnemonic {

    /***
     * Generates a mnemonic from a password
     * @param password
     * @returns {[string,string]}
     */
    static async generateMnemonic(password) {
        const hash = await Hasher.secureHash(password);
        let mnemonic = bip39.entropyToMnemonic(hash);
        return [mnemonic, bip39.mnemonicToSeedHex(mnemonic)];
    }

    static async mnemonicToSeed(mnemonic){
        return bip39.mnemonicToSeedHex(mnemonic);
    }

    /***
     * Generates a random mnemonic
     * @returns {[string,string]}
     */
    static generateDanglingMnemonic() {
        let mnemonic = bip39.generateMnemonic();
        return [mnemonic, bip39.mnemonicToSeedHex(mnemonic)];
    }
}

export default Mnemonic;