import Configs from "../../configs";

const baseUrl = Configs.api;

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

const timeout = (rq, caughtValue = null) => Promise.race([
	new Promise(resolve => setTimeout(() => resolve(caughtValue), 10000)),
	rq.catch(() => caughtValue)
])

export default class ExchangeService {

	static async pairs(token){
		return timeout(POST('/exchange/pairs', {token}));
	}

	static async rate(token, other, service){
		return timeout(POST('/exchange/rate', {token, other, service}));
	}

	static async order(service, token, other, amount, from, to){
		return timeout(POST('/exchange/order', {service, token, other, amount, from, to}));
	}

	static async accepted(id){
		return timeout(GET(`/exchange/accepted/${id}`));
	}

	static async cancelled(id){
		return timeout(GET(`/exchange/cancelled/${id}`));
	}

}