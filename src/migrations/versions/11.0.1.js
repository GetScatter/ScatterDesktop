import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {blockchainName, Blockchains, BlockchainsArray} from "../../models/Blockchains";
import KeyPairService from "../../services/secure/KeyPairService";
import IdGenerator from "../../util/IdGenerator";
import {LANG} from "../../localization/locales";
import {LocationInformation} from "../../models/Identity";

export const m11_0_0 = async scatter => {

	scatter.keychain.identities.map(identity => {
		const location = identity.locations.length ? identity.locations[0] : LocationInformation.fromJson({name:`Location for ${identity.name}`});
		scatter.keychain.locations.push(location);
		identity.location = location.id;
		delete identity.locations;
	});


    return true;
};