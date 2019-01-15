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
	Allow:'allow',
	Deny:'deny',
	Okay:'okay',
	Cancel:'cancel',
	Open:'open',
	Yes:'yes',
	No:'no',
	Enable:'enable',
	Disable:'disable',
	Select:'select',
	Unselect:'unselect',
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
	Network:'network',
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
	Buy:'buy',
	Sell:'sell',
	Buying:'buying',
	Selling:'selling',

	Accounts:'account',
	AccountName:'account_name',
	Address:'address',

	Contacts:'contacts',
	MyAccounts:'my_accounts',
	OpenContacts:'open_contacts',
	AddContact:'add_contact',
	ContactName:'contact_name',
	SelectToken:'select_token',
	DisplayToken:'display_token',
	History:'history',
	Exchange:'exchange',
	Redo:'redo',
	AllNetworks:'all_networks',
	RefreshBalances:'refresh_balances',
	Browse:'browse',
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
		NoMeta:'no_meta',
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
		OwnerDescription:'owner_desc',
		ActiveDescription:'active_desc',
		CreateEosAccountTitle:'create_eos_acc_tit',
		CreateEosAccountDescription:'create_eos_acc_desc',
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
		EOSDangerousPermissions:'eos_danger_perms',
		EOSDangerousPermissionsSubtitle:'eos_danger_perms_sub',

		ACTIONS:{
			EOS:{
				ChangePermissionsButton:'change_perms_btn',
				ProxyVotesButton:'proxy_votes_btn',
				UnlinkAccountButton:'unlink_acc_btn',
			}
		}
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
		Firewall:'firewall',
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

	LANGUAGE:{
		Label:'lbl',
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
			MainBalanceDisplayMainnetDesc:'main_bal_dis_main_desc',
			MainBalanceDisplayAllNetworksButton:'main_bal_dis_all_btn',
			MainBalanceDisplayAllNetworksDesc:'main_bal_dis_all_desc',
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

	FIREWALL:{
		ENABLED:{
			Label:'lbl',
			Description:'desc',
		}
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
	Sender:'sender',
	Recipient:'recipient',
	MemoPlaceholder:'memo_placeholder',
});

const EXCHANGE = prefixKeys('exchange', {
	ExchangeButton:'exchange_btn',
	Exchanging:'exchanging',
	Receiving:'receiving',
	To:'to',
	FetchingPairs:'fetching_pairs',
	FetchingRate:'fetching_rate',
	SelectPair:'select_pair',
	NoRates:'no_rates',
	Min:'min',
	Max:'max',

	ExchangeError:'exchange_error',
	CantConnect:'cant_connect',

	DisclaimerTitle:'disclaimer_tit',
	DisclaimerDescription:'disclaimer_desc'
});

const HISTORY = prefixKeys('history', {
	ClearingHistory:'clearing_history',
	ClearingHistoryText:'clearing_history_txt',
});

const TOKENS = prefixKeys('tokens', {
	SetDisplayTokens:'set_display_tokens',
	FiatCurrencies:'fiat_currencies',
	SystemTokens:'system_tokens'
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

const PROMPTS = prefixKeys('prompts', {

});

const SNACKBARS = prefixKeys('snackbar', {
	CopiedToClipboard:'cop_to_clip',
	BadPassword:'bad_pass',
	SavedImage:'saved_img',
	TokenAdded:'token_added',
	ContactExists:'cont_exists',
	ContactNameExists:'cont_name_exists',

	NETWORK:{
		MissingName:'miss_name',
		MissingHost:'miss_host',
		MissingPort:'miss_port',
		MissingChain:'miss_chain',
		ChainExists:'chain_exists',
		NameExists:'name_exists',
		Saved:'saved',
		Deleted:'deleted',
	},

	TOKENS:{
		MissingSymbol:'miss_symbol',
		MissingContract:'miss_contract',
		TokenExistsAdded:'exists_added',
		TokenExistsFiltered:'exists_filtered',
	},

	AUTH:{
		LockedOut:'locked_out',
		ErrorParsingBackup:'err_parse_backup',
		ErrorDecryptingBackup:'err_decr_backup',
		CantReadBackup:'cant_read_backup',
		PasswordLength:'pass_len',
		InvalidConfirmation:'bad_conf'
	},
})

const POPOUTS = prefixKeys('popouts', {
	REQ_FIELDS:{
		PersonalInfo:'per_info',
		LocationInfo:'loc_info',
	},
	LOGIN:{
		AccountRequirements:'acc_reqs',
		NoAccountsTitle:'no_accs_tit',
		NoAccountsDesc:'no_accs_desc',
		MissingFieldsTitle:'miss_fields_tit',
		MissingFieldsDesc:'miss_fields_desc',
		LoginButton:'login_btn',
		ShowAllAccounts:'show_all_accs',
		FilterAccounts:'filter_accs'
	},
	GET_KEY:{
		GenerateKeyButton:'gen_key_btn',
		SearchPlaceholder:'search_plc',
	},
	LINK_APP:{
		AppKey:'app_key',
		Disclaimer:'disclaimer',
	},
	SIGNATURE:{
		ActionsTotal:'acts_total',
		AccountsInvolved:'accs_involved',
		KeysInvolved:'keys_involved',
		ArbitraryDisabledTitle:'arb_dis_tit',
		ArbitraryDisabledDesc:'arb_dis_desc',
		WhitelistDesc:'whitelist_desc',
		DisableWhitelistButton:'dis_white_btn',
		EnableWhitelistButton:'enbl_white_btn',
		PreviouslyWhitelisted:'prev_whitelist',
		HiddenActions:'hid_act',
	},
	TRANSFER:{
		SendingTo:'sending_to',
		SearchPlaceholder:'search_plc',
	}
})

const POPINS = prefixKeys('popins', {
	FULLSCREEN:{
		CHECK_HARDWARE:{
			Title:'tit',
			Desc:'desc',
		},
		CONFIRM_PASS:{
			Title:'tit',
			Label:'lbl',
		},
		DESTROY:{
			Title:'tit',
			Disclaimer:'disc',
			Desc:'desc',
		},
		WHITELISTING:{
			Title:'tit',
			Desc:'desc',
			ActionLabel:'act_lbl',
			MutableProp:'mutable_prop',
			ImmutableProp:'immutable_prop',
		},
		EOS:{
			Available:'available',
			Reclaiming:'reclaim',
			CHANGE_PERMS:{
				Title:'tit',
				Desc:'desc',
				SubDesc:'sub_desc',
				KeysLabel:'keys_lbl',
				KeyPlaceholder:'key_plc',
				OwnerLabel:'owner_lbl',
				ActiveLabel:'active_lbl',
				Button:'btn',
			},
			MOD_CPUNET:{
				Stake:'stake',
				Unstake:'unstake',
				StakeDesc:'stake_desc',
				UnstakeDesc:'unstake_desc',
			},
			MOD_RAM:{
				BuyDesc:'buy_desc',
				SellDesc:'sell_desc',
				BytesError:'bytes_err',
			},
			PROXY:{
				Title:'tit',
				ReproxyTitle:'repro_tit',
				ReproxyDesc:'repro_desc',
				Label:'lbl',
				Placeholder:'plc',
				KnownProxiesLabel:'known_prox_lbl',
				Button:'btn',
			}
		},
		MNEMONIC:{
			Title:'tit',
			Desc:'desc',
			SubDesc:'sub_desc',
		},
		REMOVE_KEY:{
			Title:'tit',
			Disclaimer:'disc',
		},
		REMOVE_LOCATION:{
			Title:'tit',
		},
		UNLINK_ACCOUNT:{
			Title:'tit',
			Desc:'desc',
			SubDesc:'sub_desc',
			AuthoritiesLabel:'auth_lbl',
		},
		UNLINK_BLOCKCHAIN:{
			Title:'tit',
			Disclaimer:'disc',
		}
	},
	OVERLAY:{
		ConfirmPin:'conf_pin',

		REMOVE_APP:{
			Title:'tit',
			Desc:'desc',
		},
		TRX_SUCCESS:{
			Title:'tit',
			Desc:'desc',
		},
		UPDATE_AVAIL:{
			Title:'tit',
			ClickLink:'click_link',
		}
	}
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
	EXCHANGE,
	HISTORY,
	TOKENS,
	USER_BAR,
	PROCESSES,
	PROMPTS,
	SNACKBARS,
	POPOUTS,
	POPINS
}















