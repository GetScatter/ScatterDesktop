import Hasher from "./Hasher";
import bip39 from 'bip39'
import bip32 from 'bip32'
import entropy from 'more-entropy';
import IdGenerator from "./IdGenerator";
import {Blockchains, BlockchainsArray} from "../models/Blockchains";
import PluginRepository from "../plugins/PluginRepository";

export class Mnemonic {

    /***
     * Generates a mnemonic from a password
     * @param password
     * @param salt
     * @returns {[string,string]}
     */
    static async generateMnemonic(password, salt = null) {
        const hash = await Hasher.secureHash(password, salt);
        let mnemonic = bip39.entropyToMnemonic(hash);
        return [mnemonic, bip39.mnemonicToSeedHex(mnemonic)];
    }

    static mnemonicToSeedHex(mnemonic){
        return bip39.mnemonicToSeedHex(mnemonic);
    }

    static seedHexToMnemonic(seed){
        return bip39.entropyToMnemonic(Buffer.from(seed, 'hex'));
    }

    static mnemonicKey(seed, index){
    	if(seed.indexOf(' ') > -1) seed = this.mnemonicToSeedHex(seed);
	    const node = bip32.fromSeed(Buffer.from(seed, 'hex'));
	    // return BlockchainsArray.map(({value:blockchain}) => {
		//     return {blockchain, buffer:node.derivePath(`${PluginRepository.plugin(blockchain).bip()}${index}`).privateKey}
	    // });
	    return node.derivePath(`${PluginRepository.plugin(Blockchains.EOSIO).bip()}${index}`).privateKey;
    }

    static async randomMnemonic(){
	    const gen = new entropy.Generator();
	    const e = (await new Promise(resolve => {
		    gen.generate(1000, vals => {
			    vals = vals.map(x => IdGenerator.text(Math.abs(x) > 128 ? 128 : Math.abs(x)) + vals);
			    resolve(vals)
		    });
	    })).join('');
	    const hash = await Hasher.secureHash(e, e.substr(Math.round(Math.random() * 100 + 1), 1000), 32);
        return bip39.entropyToMnemonic(hash);
    }
}

export default Mnemonic;