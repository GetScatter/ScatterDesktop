import Moonpay from "./Moonpay";
import PopupService from "../utility/PopupService";
import {Popup} from "../../models/popups/Popup";

let availableServices = [];

export default class PurchasingService {

	static async init(){
		return availableServices.push(Moonpay);
		if(await Moonpay.isAvailable()) availableServices.push(Moonpay);
	}

	static async purchase(amount, token, account, card){
		if(!availableServices.length) return PopupService.push(Popup.snackbar("No available payment services!"));
		const bought = await availableServices[0].buy(amount, token, account, card);
		console.log('bought', bought);
	}

}