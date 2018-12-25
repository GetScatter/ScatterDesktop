
// const baseUrl = 'https://api.get-scatter.com/v1';
const baseUrl = 'http://localhost:6544/v1';

const GET = (route) => {

};

const POST = (route, data) => {
	return fetch(`${baseUrl}${route}`, {
		method:'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data)
	}).then(x => x.json())
};

export default class ExchangeService {

	static async pairs(token){
		return POST('/exchange/pairs', {token}).then(res => res.map(x => x.destinationCoin.toUpperCase()));
	}

	static async rate(token, other){
		return POST('/exchange/rate', {token, other});
	}

}