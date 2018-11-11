/***
 * Prefixes keys.
 * ONLY GOES ONE LEVEL DEEP
 * Example: `LOGIN.NEW.Title` == `login_new_tit`
 * @returns {*}
 */
const prefixKeys = (name, obj) => {
	Object.keys(obj).map(key => {
		if(typeof obj[key] !== 'object') obj[key] = obj[key];
		else Object.keys(obj[key]).map(part => {
			obj[key][part] = `${name}_${key}_${obj[key][part]}`.toLowerCase()
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
	IMPORT_QR:{}
});

const KEYPAIR = prefixKeys('keypair', {
	NameLabel:'name_lbl',
	NamePlaceholder:'name_plc',
	ACCOUNTS:{
		SearchPlaceholder:'search_plc',
		ViewTokens:'view_tokens',
		EOSManageResourceButton:'eos_manage_btn',
		EOSClaimRefundButton:'eos_refund_btn',
	},
	DASHBOARD:{
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
});

export default {
	LOGIN,
	DASHBOARD,
	ADD_KEYS,
	KEYPAIR
}















