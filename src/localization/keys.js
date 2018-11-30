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

const GENERIC = prefixKeys('generic', {
	Back:'back',
	Confirm:'confirm',
	Deny:'deny',
	Okay:'okay',
	Cancel:'cancel',
	Open:'open',
	Yes:'yes',
	No:'no',
	Enable:'enable',
	Disable:'disable',
	Select:'select',
	Edit:'edit',
	Add:'add',
	Save:'save',
	New:'new',
	Delete:'delete',
	Remove:'remove',
	RemoveAll:'remove_all',
	Copy:'copy',
	Import:'import',
	Export:'export',
	Refresh:'refresh',
	Manage:'manage',
	PrivateKey:'private_key',
	PublicKey:'public_key',
	Keys:'keys',
	Hide:'hide',
	Reveal:'reveal',
	Identity:'identity',
	Tokens:'tokens',
	Blockchain:'blockchain',
	Contract:'contract',
	Memo:'memo',
	Symbol:'symbol',
	Decimals:'decimals',
	PasswordOrPhrase:'password_or_phrase',
	Timestamp:'timestamp',
	ChainID:'chain_id',
	Name:'name',
	Search:'search',

	Accounts:'account',
	AccountName:'account_name',
	Address:'address',
});

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
		LinkedAccounts:'linked_accounts',
	},
	APPS:{
		SearchPlaceholder:'search_plc',
		NoAppsTitle:'no_apps_tit',
		NoAppsDescription:'no_apps_desc',
		LinkPermissionOnly:'link_perm_only',
		NPermissions:'n_permissions',
		NoPermissions:'no_permissions',
		UnlinkedAppsTitle:'unlinked_apps_tit',
		UnlinkedAppsSubtitle:'unlinked_apps_sub'
	},
	TOOLBARS:{
		SendButton:'send',
		ReceiveButton:'receive',
	}
});

const ADD_KEYS = prefixKeys('add_keys', {
	SELECT:{
		Disclaimer:'disclaimer',
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
		KeyPlaceholder:'key_plc',
		ERRORS:{
			InvalidKeyLength:'invalid_key_len',
		}
	},
	IMPORT_HW:{
		SelectHardwareLabel:'sel_hard_lbl',
		AvailableBlockchainsLabel:'avail_blok_lbl',
		IndexLabel:'idx_lbl',
		HardwareError:'hw_err',
		UnlockLedgerError:'unlock_ledger_err',
		UnlockedLiquidEOSError:'unlock_liq_eos_err',
	},
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
		CreateEosAccountButton:'create_eos_acc_btn',
	}
});

const KEYPAIR = prefixKeys('keypair', {
	NameLabel:'name_lbl',
	NamePlaceholder:'name_plc',

	DASHBOARD:{
		STATES:{
			AddAccount:'add',
			LinkedAccounts:'linked',
			KeysAndBlockchains:'keys',
		},

		ADD_ACCOUNT:{
			CreateEosAccountLabel:'create_eos_lbl',
			CreateEosAccountDescription:'create_eos_desc',
			CreateEosAccountButton:'create_eos_btn',
			LinkEosAccountLabel:'link_eos_lbl',
			LinkEosAccountDescription:'link_eos_desc',
			AccountNetworkLabel:'net_acc_lbl',
		},

		ERRORS:{
			InvalidWalletName:'invalid_wallet_name',
			WalletNameExists:'wallet_name_exists',
		}
	},

	ACCOUNTS:{
		SearchPlaceholder:'search_plc',
		ViewTokens:'view_tokens',
		EOSClaimRefundButton:'eos_refund_btn',
	},
	BLOCKCHAINS:{
		CopyButton:'cpy_btn',
	},

	TOKENS:{
		HiddenTokensCount:'hidden_tokens',
		SearchPlaceholder:'search_tokens',
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
		ChangeName:'change_name',
		InfoTitle:'info_tit',
		InfoSubtitle:'info_sub',
		UseNameButton:'use_name_btn',
		ExchangeFieldParts:'ex_field_parts',
		SentTitle:'sent_tit',
		SentSubtitle:'sent_sub',
		TransactionIDLabel:'tx_id_lbl',
		ActionBarButton:'act_bar_btn',
	},

	ERRORS:{
		InvalidResources:'invalid_res',
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

const SETTINGS = prefixKeys('settings', {
	Basics:'basics',
	DangerZone:'danger_zone',

	MENU:{
		General:'general',
		Language:'language',
		Tokens:'tokens',
		Explorers:'explorers',
		PIN:'pin',
		Networks:'networks',
		Password:'password',
		Backup:'backup',
		Destroy:'destroy'
	},

	GENERAL:{
		VersionLabel:'version_lbl',
		UpdateAvailable:'update_avail',
		NoUpdateAvailable:'no_update_avail',
		WhitelistNotificationsLabel:'white_noti_lbl',
		WhitelistNotificationsDescription:'white_noti_desc',
		DataPathLabel:'data_path_lbl',
		DataPathDescription:'data_path_desc',
		DeveloperConsoleLabel:'dev_console_lbl',
		DeveloperConsoleDescription:'dev_console_desc',
		DeveloperConsoleButton:'dev_console_btn',
	},

	TOKENS:{
		SWITCH:{
			ADD_TOKEN:'add_token',
			WHITELIST:'whitelist',
			BLACKLIST:'blacklist',
			SETTINGS:'settings',
		},

		ADD_TOKEN:{
			Disclaimer:'disclaimer',
			TokenNamePlaceholder:'tok_name_plc',
			TokenNameLabel:'tok_name_lbl',
			WhitelistTokenButton:'white_tok_btn',
			BlacklistTokenButton:'black_tok_btn',
		},

		SETTINGS: {
			MainBalanceDisplayLabel:'main_bal_dis_lbl',
			MainBalanceDisplayDescription:'main_bal_dis_desc',
			MainBalanceDisplayMainnetButton:'main_bal_dis_main_btn',
			MainBalanceDisplayAllNetworksButton:'main_bal_dis_all_btn',
			FilterSmallBalancesLabel:'filter_small_bal_lbl',
			FilterSmallBalancesDescription:'filter_small_bal_desc',
		},

		WHITE_BLACK:{
			TokenFilterLabel:'tok_filter_lbl',
			TokenSearchPlaceholder:'tok_search_plc',

			WHITELIST:{
				Disclaimer:'disclaimer',
				FiatCurrencyLabel:'fiat_curr_lbl',
				SystemTokensLabel:'sys_tok_lbl',
				CustomTokensLabel:'cus_tok_lbl',
			},

			BLACKLIST:{
				Disclaimer:'disclaimer',
				DisclaimerSubtitle:'disclaimer',
			},
		},
	},

	PIN:{
		Label:'label',
		Description:'desc',
		DescriptionRed:'desc_red',
		Placeholder:'placeholder',
		SavedSnackbar:'save_snack',
		PinForAllTitle:'pin_4_all_tit',
		PinForAllDescription:'pin_4_all_desc',
	},

	NETWORKS:{
		SWITCH:{
			Known:'known',
			Custom:'custom',
		},

		KNOWN:{
			AddLabel:'add_label',
			AddDescription:'add_desc',
		},

		CUSTOM:{
			NamePlaceholder:'name_plc',
			HostLabel:'host_lbl',
			ProtocolLabel:'proto_lbl',
			PortLabel:'port_lbl',
			ChainIdTooltip:'chain_id_tool',
			FromOriginPlaceholder:'from_origin_plc',
			CustomSystemTokenLabel:'cus_sys_tok_lbl',
			CustomSystemTokenDescription:'cus_sys_tok_desc',
			CustomSystemTokenUseDefaultButton:'cus_sys_tok_def_btn',
			CustomSystemTokenUseCustomButton:'cus_sys_tok_use_cus_btn',
			UsingCustomSystemToken:'using_cus_sys_tok',
		}
	},

	PASSWORD:{
		ChangePasswordLabel:'cng_pass_lbl',
		ChangePasswordDescription:'cng_pass_desc',
		NewPasswordLabel:'new_pass_lbl',
		NewPasswordPlaceholder:'new_pass_plc',
		ConfirmPasswordLabel:'conf_pass_lbl',
		ConfirmPasswordPlaceholder:'conf_pass_plc',
		ChangePasswordButton:'cng_pass_btn',
		ViewMnemonicLabel:'view_mne_lbl',
		ViewMnemonicDescription:'view_mne_desc',
		ViewMnemonicButton:'view_mne_btn',
		ChangedPasswordSnackbar:'changed_pass_snack'
	},

	BACKUP:{
		Label:'lbl',
		Description:'desc',
		AutoBackupLocationLabel:'auto_backup_lbl',
		CreateBackupButton:'create_backup_btn',
		CurrentBackupFolderLabel:'curr_backup_lbl',
	},

	DESTROY:{
		Label:'lbl',
		Description:'desc',
		Important:'imp',
		Button:'btn',
	}
});

const TRANSFER = prefixKeys('transfer', {
	SendButton:'send_btn',

	FROM:{
		FromLabel:'from_lbl',
		SendingAccountsLabel:'send_acc_lbl',
	},

	TOKENS:{
		AmountLabel:'amount_lbl',
		CustomTokenLabel:'cus_tok_lbl',
		SaveTokenButton:'save_tok_btn',
	},

	RECIPIENT:{
		RecipientLabel:'rec_lbl',
		SendToContact:'send_to_contact',
		SendDirectly:'send_directly',
		SearchContactsPlaceholder:'search_contacts_plc',
		ContactsLabel:'contacts_lbl',
		VerifyRecipient:'verify_recipient',
		ContactNamePlaceholder:'contact_name_plc',
		ContactNameLabel:'contact_name_lbl',
	},

	ERRORS:{
		InvalidRecipient:'invalid_rec',
		InvalidAmount:'invalid_amnt'
	}
});

const USER_BAR = prefixKeys('user_bar', {
	ManageIdentity:'manage_id',
});

const PROCESSES = prefixKeys('processes', {
	FetchAccountsFromNetwork:'fetch_acc_net',
	ImportingAccountsFromNetwork:'import_acc_net',
	ImportingAccounts:'imp_accs',
	LoadingResources:'load_res',
	AccountsLeft:'acc_left',
});

const SNACKBARS = prefixKeys('snackbar', {
	CopiedToClipboard:'cop_to_clip',
	BadPassword:'bad_pass',
})

export default {
	GENERIC,
	LOGIN,
	DASHBOARD,
	ADD_KEYS,
	KEYPAIR,
	IDENTITY,
	CREATE_EOS,
	PERMISSIONS,
	SETTINGS,
	TRANSFER,
	USER_BAR,
	PROCESSES,
	SNACKBARS
}















