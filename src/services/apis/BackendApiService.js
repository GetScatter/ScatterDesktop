import IdGenerator from "../../util/IdGenerator";
import ecc from 'eosjs-ecc';
import StoreService from "../utility/StoreService";

// const baseUrl = `http://localhost:6547/v1/`;
const baseUrl = `https://api.get-scatter.com/v1/`;
const PROOF_KEY = 'EOS62b3WxfuRyP7JYaDbF3gr49joLWYpsF3kPmo2HPxPuGRDiRUwj';

const getHeaders = () => {
	const proof = IdGenerator.text(64);
	return [proof, {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		proof,
	}]
};

// All API requests must come back signed with the known
// public key associated with the Scatter API
const validate = (proof, res) => {
	try {
		const signedProof = res.headers.get('proof');
		if(!signedProof) throw 'Invalid API Request';
		if(ecc.recover(signedProof, proof) !== PROOF_KEY) throw 'Invalid API Request';
		return res.json();
	} catch(e){
		throw "Invalid API Request";
	}
};

export const GET = route => {
	const [proof, headers] = getHeaders();
	return fetch(`${baseUrl}${route}`, {
		method:'GET',
		headers
	}).then(res => validate(proof,res))
};

export const POST = (route, data) => {
	const [proof, headers] = getHeaders();
	return fetch(`${baseUrl}${route}`, {
		method:'POST',
		headers,
		body:JSON.stringify(data),
	}).then(res => validate(proof,res))
};

export default class BackendApiService {
	static async apps(){
		const ac = StoreService.get().getters.accounts.reduce((acc,x) => { if(!acc.includes(x.sendable())) acc.push(x.sendable()); return acc; }, []).length;
		return GET(`apps?flat=true&ac=${ac}`);
	}

	// ACCOUNT CREATION
	static async checkMachineId(id){ return GET(`machine/${id}`); }
	static async createAccount(payload){ return POST(`create_bridge`, payload); }

}