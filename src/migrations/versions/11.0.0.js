import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {Blockchains, BlockchainsArray} from "../../models/Blockchains";
import KeyPairService from "../../services/secure/KeyPairService";
import IdGenerator from "../../util/IdGenerator";

export const m11_0_0 = async scatter => {

	scatter.keychain.keypairs.map(keypair => {
		delete keypair.keyHash;
	})


    return true;
};