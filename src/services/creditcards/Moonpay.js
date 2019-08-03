import StoreService from "../utility/StoreService";
import PopupService from "../utility/PopupService";
import {Popup} from "../../models/popups/Popup";

const API_PUB_KEY = 'pk_test_uQlwYQs3jLbrl53VWKv1xW1XZ7eHsr65';

let token;
const BASE = `https://api.moonpay.io/v2`;
const POST = (route,body, method = "POST") => fetch(`${BASE}/${route}`, {
	method,
	headers: {
		"Authorization":token ? `Bearer ${token}` : null,
		"Content-Type": "application/json",
	},
	body:JSON.stringify(body),
}).then(x => x.json());
const GET = (route) => fetch(`${BASE}/${route}`, {
	headers:{
		"Authorization":token ? `Bearer ${token}` : null,
		"Content-Type": "application/json",
	}
}).then(x => x.json());


export default class Moonpay {

	static async isAvailable(){
		return GET('ip_address').then(x => x.isAllowed).catch(() => {
			console.error(`Can't reach moonpay API`);
			return false;
		})
	}

	static async login(identity){
		if(token) return GET(`customers/me`);
		return new Promise(async resolve => {

			if(!identity.personal.email.length) return resolve(PopupService.push(Popup.snackbar("You must have an email on the identity linked to this card.")));

			const check = securityCode => POST(`customers/email_login?apiKey=pk_test_uQlwYQs3jLbrl53VWKv1xW1XZ7eHsr65`, {
				email:identity.personal.email,
				securityCode
			})

			const prelim = await check(null);
			if(prelim.hasOwnProperty('preAuthenticated')){
				PopupService.push(Popup.enterSecurityCode(`Check your email for a security code from Moonpay.`, async code => {
					if(!code) resolve(PopupService.push(Popup.snackbar("No security code provided.")));
					const authenticated = await check(code);
					if(!authenticated.hasOwnProperty('token')) return resolve(PopupService.push(Popup.snackbar("There was an error authenticating with Moonpay.")));
					token = authenticated.token;
					resolve(authenticated.customer);
				}))
			}
		})
	}

	static cardToCustomer(card){
		const identity = StoreService.get().getters.identities.find(x => x.id === card.identityId);
		const location = identity.locations.find(x => x.id === card.locationId) || identity.locations[0];
		return {
			firstName:identity.personal.firstname,
			lastName:identity.personal.lastname,
			address:{
				street:location.address,
				subStreet:null,
				town:location.state,
				postCode:location.zipcode,
				country:location.country,
			},
		}
	}

	static async updateCustomer(identity, card){
		const location = identity.locations.find(x => x.id === card.locationId) || identity.locations[0];
		return POST(`customers/me`, {
			firstName:identity.personal.firstname.split(' ')[0], // TODO: Fix for moonpay, might fail actual authentication
			lastName:identity.personal.lastname,
			address:{
				street:location.address,
				subStreet:null,
				town:location.state,
				postCode:location.zipcode,
				country:location.country,
			},
		}, "PATCH")
	}

	static async buy(amount, token, account, card){
		const identity = StoreService.get().getters.identities.find(x => x.id === card.identityId);
		if(!identity) return console.error(`Couldn't find card's identity.`);

		const customer = await this.login(identity);
		if(!customer) return;

		const cardCustomer = this.cardToCustomer(card);
		const customerHasChanged = Object.keys(cardCustomer).some(key => customer[key] !== cardCustomer[key]);
		if(customerHasChanged) {
			const updated = await this.updateCustomer(identity, card);
			console.log('updated', updated);
		}

		const availableCards = await GET(`cards`);
		console.log(availableCards);

		if(!availableCards.find(x => x.lastDigits === card.lastFour)){
			const expiry = card.expiration.split('/');
			const addedCard = await POST(`cards`, {
				number:card.number,
				expiryMonth:parseInt(expiry[0]),
				expiryYear:parseInt(`20${expiry[1]}`),
				cvc:card.cvx,
			});
			console.log('added card', addedCard);
		}




	}

}