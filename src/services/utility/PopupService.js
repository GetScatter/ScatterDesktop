import * as Actions from '../../store/ui_actions'
import {PopupDisplayTypes, Popup} from '../../models/popups/Popup';
import {RUNNING_TESTS, SHOW_POPUPS_AS_CONSOLE} from "@walletpack/core/util/TestingHelper";
import WindowService from "../electron/WindowService";
import {store} from "../../store/store";

let popouts = [];

export default class PopupService {

	static remove(popup){
		store.dispatch(Actions.RELEASE_POPUP, popup);
	}

	static push(popup){
		// Allows showing popups as a console log for unit testing.
		if(RUNNING_TESTS && SHOW_POPUPS_AS_CONSOLE) return console.log(popup);

		if(store.state.popups.find(x => JSON.stringify(x.data) === JSON.stringify(popup.data)))
			return false;

		if(popup.displayType === PopupDisplayTypes.POP_OUT)
			return this.openPopOut(popup);

		store.dispatch(Actions.PUSH_POPUP, popup);

		if(popup.displayType === PopupDisplayTypes.SNACKBAR)
			setTimeout(() => store.dispatch(Actions.RELEASE_POPUP, popup),
				popup.data.props.timeout);
	}

	static openPopOut(popup){
		return WindowService.openPopOut(popup);
	}

}
