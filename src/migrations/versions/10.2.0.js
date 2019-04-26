import PluginRepository from '../../plugins/PluginRepository';
import Explorer from "../../models/Explorer";
import {Blockchains, BlockchainsArray} from "../../models/Blockchains";
import KeyPairService from "../../services/secure/KeyPairService";
import IdGenerator from "../../util/IdGenerator";

export const m10_2_0 = async scatter => {

	////////////////////////////////////////////
	// Changing identity linking to unique ids instead of keypairs
	////////////////////////////////////////////

    scatter.keychain.identities.map(identity => {
    	if(!identity.hasOwnProperty('id')){
    		identity.id = IdGenerator.text(24);
	    }
    });

    const getIdentityByKey = key => scatter.keychain.identities.find(x => x.publicKey === key);

    scatter.keychain.permissions.map(perm => {
    	if(perm.identity.length){
    		const isKey = PluginRepository.plugin(Blockchains.EOSIO).validPublicKey(perm.identity);
    		if(isKey) perm.identity = getIdentityByKey(perm.identity).id;
	    }
    });

    return true;
};