
// const baseUrl = 'https://api.get-scatter.com/v1';
const baseUrl = 'http://localhost:6544/v1';

const GET = (route) => {
	return fetch(`${baseUrl}${route}`).then(x => x.json())
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
		return POST('/exchange/pairs', {token});
	}

	static async rate(token, other, service){
		return POST('/exchange/rate', {token, other, service});
	}

	static async order(service, token, other, amount, from, to){
		return POST('/exchange/order', {service, token, other, amount, from, to});
	}

	static async accepted(id){
		return GET(`/exchange/accepted/${id}`);
	}

	static async cancelled(id){
		return GET(`/exchange/cancelled/${id}`);
	}

}