import * as Actions from '../../store/ui_actions'
import {PopupDisplayTypes, Popup} from '../../models/popups/Popup';
import {RUNNING_TESTS, SHOW_POPUPS_AS_CONSOLE} from "@walletpack/core/util/TestingHelper";
import StoreService from "@walletpack/core/services/utility/StoreService";
import WindowService from "../electron/WindowService";

let popouts = [];

export default class PopupService {

	static remove(popup){
		StoreService.get().dispatch(Actions.RELEASE_POPUP, popup);
	}

	static push(popup){
		// Allows showing popups as a console log for unit testing.
		if(RUNNING_TESTS && SHOW_POPUPS_AS_CONSOLE) return console.log(popup);

		if(StoreService.get().state.popups.find(x => JSON.stringify(x.data) === JSON.stringify(popup.data)))
			return false;

		if(popup.displayType === PopupDisplayTypes.POP_OUT)
			return this.openPopOut(popup);

		StoreService.get().dispatch(Actions.PUSH_POPUP, popup);

		if(popup.displayType === PopupDisplayTypes.SNACKBAR)
			setTimeout(() => StoreService.get().dispatch(Actions.RELEASE_POPUP, popup),
				popup.data.props.timeout);
	}

	static openPopOut(popup){
		return WindowService.openPopOut(popup);
	}

}
