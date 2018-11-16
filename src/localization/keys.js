/***
 * Recursively prefixes keys.
 * Example: `LOGIN.NEW.Title` == `login_new_tit`
 * @returns {*}
 */
const prefixKeys = (name, obj, prefix = null) => {
	if(!prefix) prefix = `${name}`;
	Object.keys(obj).map(key => {
		if(typeof obj[key] !== 'object') obj[key] = `${prefix}_${obj[key]}`.toLowerCase();
		else Object.keys(obj[key]).map(part => {
			if(typeof obj[key][part] === 'object') obj[key][part] = prefixKeys(name, obj[key][part], `${prefix}_${key}_${part}`.toLowerCase())
			else obj[key][part] = `${prefix}_${key}_${obj[key][part]}`.toLowerCase()
		})
	});
	return obj;
};

const LOGIN = prefixKeys('login', {
	NEW:{
		Title:'tit',
		SubTitle:'sub',
		PasswordLabel:'password_lbl',
		PasswordPlaceholder:'password_plc',
		PasswordConfirmLabel:'password_confirm_lbl',
		PasswordConfirmPlaceholder:'password_confirm_plc',
		CreateButton:'create_btn',
		RestoreBackupButton:'restore_backup_btn',
	},
	EXISTING:{
		Title:'tit',
		SubTitle:'sub',
		PasswordPlaceholder:'password_plc',
		ResetButton:'reset_btn',
	},
	RESTORE:{
		Title:'tit',
		SubTitle:'sub',
		ChooseButton:'choose_btn',
		BackButton:'back_btn',
	}
});

const DASHBOARD = prefixKeys('dashboard', {
	KEYS:{
		SearchPlaceholder:'search_plc',
		AddKeysButton:'add_keys',
		NoKeys:'no_keys',
		Accounts:'accounts'
	},
	APPS:{
		SearchPlaceholder:'search_plc',
		NoAppsTitle:'no_apps_tit',
		NoAppsDescription:'no_apps_desc',
		ExploreAppsButton:'explore_apps_btn',
		EditApp:'edit_app',
		DeleteApp:'del_app',
		LinkPermissionOnly:'link_perm_only',
		NPermissions:'n_permissions'
	},
	TOOLBARS:{
		SendButton:'send',
		ReceiveButton:'receive',
	}
});

const ADD_KEYS = prefixKeys('add_keys', {
	SELECT:{
		CreateTitle:'create_tit',
		CreateDescription:'create_desc',
		CreateButton:'create_btn',
		ImportTitle:'import_tit',
		ImportDescription:'import_desc',
		ImportButton:'import_btn',
		CreateEosTitle:'create_eos_tit',
		CreateEosDescription:'create_eos_desc',
		CreateEosButton:'create_eos_btn',
	},
	IMPORT:{
		NameLabel:'name_lbl',
		NamePlaceholder:'name_plc',
		TextTitle:'text_tit',
		TextDescription:'text_desc',
		TextButton:'text_btn',
		HardwareTitle:'hw_tit',
		HardwareDescription:'hw_desc',
		HardwareButton:'hw_btn',
		QrTitle:'qt_tit',
		QrDescription:'qr_desc',
		QrButton:'qr_btn',
	},
	IMPORT_TEXT:{
		KeyLabel:'key_lbl',
		KeyPlaceholder:'key_plc'
	},
	IMPORT_HW:{},
	IMPORT_QR:{},
	EOS_KEYS:{
		DisclaimerTitle:'disc_tit',
		DisclaimerSubtitle:'disc_sub',
		OwnerDescription:'owner_desc',
		ActiveDescription:'active_desc',
		CreateEosAccountTitle:'create_eos_acc_tit',
		CreateEosAccountDescription:'create_eos_acc_desc',
		CopyButton:'copy_btn',
		DeleteButton:'del_btn',
		CreateEosAccountButton:'create_eos_acc_btn'
	}
});

const KEYPAIR = prefixKeys('keypair', {
	NameLabel:'name_lbl',
	NamePlaceholder:'name_plc',
	ExportButton:'export_btn',
	RefreshButton:'refresh_btn',
	RemoveButton:'remove_btn',

	ACCOUNTS:{
		SearchPlaceholder:'search_plc',
		ViewTokens:'view_tokens',
		EOSManageResourceButton:'eos_manage_btn',
		EOSClaimRefundButton:'eos_refund_btn',
		AddAccountLabel:'add_acc_lbl',
		AddAccountDescription:'add_acc_desc',
		AddAccountButton:'add_acc_btn'
	},
	BLOCKCHAINS:{
		CopyButton:'cpy_btn',
	},

	EXPORT:{
		SELECT:{
			KeyTitle:'key_tit',
			KeyDescription:'key_desc',
			QrTitle:'qr_tit',
			QrDescription:'qr_desc',
		},
		KEY:{
			Title:'key_tit',
			CopyButton:'copy_btn',
			RevealButton:'reveal_btn',
			HideButton:'hide_btn',
		},
		QR:{
			Title:'qr_tit',
			SaveButton:'save_btn',
		}
	}
});

const IDENTITY = prefixKeys('identity', {
	Title:'tit',
	DisclaimerTitleImportant:'disclaimer_tit_imp',
	DisclaimerTitle:'disclaimer_tit',
	DisclaimerSubtitle:'disclaimer_sub',

	NameLabel:'name_lbl',
	NamePlaceholder:'name_plc',
	NameError:'name_err',

	PERSONAL:{
		NameLabel:'name_lbl',
		NamePlaceholder:'name_plc',
		DateOfBirthLabel:'dob_lbl',
		EmailLabel:'email_lbl',
	},


	LOCATION:{
		DisclaimerTitle:'disclaimer_tit',
		DisclaimerSubtitle:'disclaimer_sub',
		SelectorLabel:'sel_lbl',
		SelectorAddButton:'sel_add_button',
		NameLabel:'name_lbl',
		NamePlaceholder:'name_plc',
		NameError:'name_err',
		CountryLabel:'country_lbl',
		CountryItemNone:'country_item_none',
		PhoneLabel:'phone_lbl',
		PhonePlaceholderArea:'phone_plc_a',
		PhonePlaceholderPrefix:'phone_plc_b',
		PhonePlaceholderSuffix:'phone_plc_c',
		AddressLabel:'adr_lbl',
		AddressPlaceholder:'adr_plc',
		CityLabel:'city_lbl',
		CityPlaceholder:'city_plc',
		StateLabel:'state_lbl',
		StatePlaceholder:'state_plc'
	}
});

const CREATE_EOS = prefixKeys('create_eos', {
	DisclaimerTitle:'disc_tit',
	DisclaimerSubtitle:'disc_sub',

	AccountNameLabel:'acc_name_lbl',
	AccountNamePlaceholder:'acc_name_plc',
	AccountNameLengthError:'acc_name_len_err',
	AccountNameFormattingError:'acc_name_form_err',
	SelectCreatorError:'sel_creator_err',
	CheckingNameAlert:'check_name_alert',
	NameTakenAlert:'name_taken_alert',

	ACCOUNT:{
		AccountsLabel:'acc_lbl',
		RamCostLabel:'ram_cost_lbl',
		ResourcesLabel:'resources_lbl',
		ResourcesLowError:'res_low_err',
		TotalLabel:'total_lbl',
		ActionBarButton:'act_bar_btn',
	},

	EXCHANGE:{
		CopyButton:'cpy_btn',
		MinimumAmountLabel:'min_amnt_lbl',
		WithdrawAccountLabel:'with_acc_lbl',
		MemoLabel:'memo_lbl',
		ActionBarButton:'act_bar_btn',
	}
});

const PERMISSIONS = prefixKeys('permissions', {
	ListLabel:'list_lbl',
	LoginPermission:'login_perm',
	AccountsLabel:'accounts_lbl',
	RequiredFieldsLabel:'req_fields_lbl',
	MutableFieldsLabel:'mutable_fields_lbl',
	RemoveLabel:'rem_lbl',
	RemoveIdentityText:'rem_id_lbl',
	RemoveWhitelistLabel:'rem_white_lbl',
	RemoveButton:'rem_btn',
	RemoveAllButton:'rem_all_btn',
	ActionWhitelist:'act_whitelist'
});

const TRANSFER = prefixKeys('transfer', {
	Send:'transfer_send',
	SendingAmount:'transfer_sendingamount',
	SelectWhichAccount:'transfer_selectwhichaccount',
	YourAccounts:'transfer_youraccounts',
	Amount:'transfer_amount',
	Recipient:'transfer_recipient',
	Quantity:'transfer_quantity',
	Token:'transfer_token',
	Memo:'transfer_memo',
	SendToContact:'transfer_sendtocontact',
	SendDirectly:'transfer_senddirectly',
	Contacts:'transfer_contacts',
});

export default {
	LOGIN,
	DASHBOARD,
	ADD_KEYS,
	KEYPAIR,
	IDENTITY,
	CREATE_EOS,
	PERMISSIONS,
	TRANSFER
}















