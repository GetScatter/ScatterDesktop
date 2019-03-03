import ridl, {FRAG_TYPES} from 'ridl';
import Network from "../models/Network";
import murmur from 'murmurhash';

export const RIDL_WEB_HOST = `http://localhost:8081`;

export const network = Network.fromJson({
	host:'192.168.1.5',
	port:8888,
	protocol:'http',
	chainId:'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
	blockchain:'eos',
});

// export const network = Network.fromJson({
// 	host:'ridlnet.get-scatter.com',
// 	port:80,
// 	protocol:'http',
// 	chainId:'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
// 	blockchain:'eos',
// });

ridl.init(network);

const finger = x => murmur.v2(x);

//TODO: GET FROM API
const dangerFrags = [
	finger('scam'),
	finger('dangerous'),
	finger('privacy'),
];

let dangerFragTypes = null;
const fillFrags = async reputable => {
	const fragments = reputable.reputation.fragments.filter(x => dangerFrags.includes(x.fingerprint));
	const fragTypes = !dangerFragTypes ? await ridl.reputation.getFragmentsFor(reputable) : dangerFragTypes;

	fragments.map(frag => {
		const typed = fragTypes.find(x => x.fingerprint === frag.fingerprint);
		frag.upTag = typed ? typed.upTag : 'good';
		frag.downTag = typed ? typed.downTag : 'bad';
	});

	return fragments;
}

export default class RIDLService {

    static async checkApp(app){
        console.log(FRAG_TYPES.APPLICATION, app);
        await ridl.init(network);
        const reputable = await ridl.reputation.searchByFingerprint(FRAG_TYPES.APPLICATION, app.trim());
        if(!reputable) return;

        const fragments = await fillFrags(reputable);

        return {
	        decimal:reputable.decimalReputation(true, dangerFrags),
	        fragments,
	        reputable
        };
    }

    static async checkContracts(contractNetwork, contracts){
    	console.log(contractNetwork, contracts);
	    await ridl.init(network);

    	const networkId = `${contractNetwork.blockchain}::${contractNetwork.chainId}`;
    	let fragTypes = [];

    	const reputables = await Promise.all(contracts.map(({code:contract, type:action}) => {
		    return ridl.reputation.searchByFingerprint(FRAG_TYPES.BLOCKCHAIN_ADDR, contract.toLowerCase(), networkId).then(async reputable => {
		    	reputable.code = contract;
			    reputable.decimal = reputable.decimalReputation(true, dangerFrags);
			    reputable.children = (await this.getChildren(reputable)).filter(x => x.entity.toLowerCase() === action.toLowerCase());
			    reputable.children.map(child => {
			    	child.code = contract+action;
				    child.decimal = child.decimalReputation(true, dangerFrags);
			    });
			    await fillFrags(reputable);
			    return reputable;
		    });
	    }));

    	let total = 0;
    	let actionables = [];
    	reputables.map(reputable => {
    		if(reputable.children.length){
			    reputable.children.map(child => {
				    total += parseFloat(child.decimal);
				    actionables.push(child);
			    })
		    }
		    else {
		    	total += parseFloat(reputable.decimal);
			    actionables.push(reputable);
		    }
	    });

    	return {
    		decimal:parseFloat(total).toFixed(1),
		    reputables:actionables,
	    }

    }

	static async getChildren(reputable){
		await ridl.canConnect()
		return ridl.reputation.searchByParent(reputable.id);
	}


}