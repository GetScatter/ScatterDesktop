const IdGenerator = require("@walletpack/core/util/IdGenerator").default;
const ecc = require('eosjs-ecc');

const baseUrl = process.env.API_HOST;
const PROOF_KEYS = process.env.PROOF_KEYS.split(',');

const getHeaders = () => {
	const proof = IdGenerator.text(64);
	return [proof, {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		proof,
	}]
};

const validate = (proof, res) => {
	try {
		const signedProof = res.headers.get('proof');
		if(!signedProof) throw 'Invalid API Request';

		let proven = false;
		for(let i = 0; i < PROOF_KEYS.length; i++){
			if(ecc.recover(signedProof, proof) === PROOF_KEYS[i]) {
				proven = true;
				break;
			}
		}
		if(!proven) throw 'Invalid API Request';

		return res.json();
	} catch(e){
		throw "Invalid API Request";
	}
};

const GET = route => {
	const [proof, headers] = getHeaders();
	return fetch(`${baseUrl}${route}`, {
		method:'GET',
		mode:'cors',
		headers
	}).then(res => validate(proof,res))
};

const POST = (route, data) => {
	const [proof, headers] = getHeaders();
	return fetch(`${baseUrl}${route}`, {
		method:'POST',
		mode:'cors',
		headers,
		body:JSON.stringify(data),
	}).then(res => validate(proof,res))
};

module.exports = {
	GET,
	POST,
}
