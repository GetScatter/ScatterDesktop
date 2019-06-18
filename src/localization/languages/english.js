import KEYS from '../keys';
const {
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
	SNACKBARS,
	POPOUTS,
	POPINS
} = KEYS;

// You can build your own pluralizers.
// This one for instance is for words that end with "s" when
// pluralized.
// See [DASHBOARD.APPS.NPermissions] for example usage
const plural_s = (n) => n === '{x}' ? '{plural_s}' : parseInt(n) === 1 ? '' : 's';

const Locale = {

	/****************************************************/
	/*                                                  */
	/*                     GENERIC                      */
	/*                                                  */
	/****************************************************/

	[GENERIC.Back]:() => `Back`,
	[GENERIC.Confirm]:() => `Confirm`,
	[GENERIC.Allow]:() => `Allow`,
	[GENERIC.Deny]:() => `Deny`,
	[GENERIC.Okay]:() => `Okay`,
	[GENERIC.Cancel]:() => `Cancel`,
	[GENERIC.Open]:() => `Open`,
	[GENERIC.Yes]:() => `Yes`,
	[GENERIC.No]:() => `No`,
	[GENERIC.Enable]:() => `Enable`,
	[GENERIC.Disable]:() => `Disable`,
	[GENERIC.Select]:() => `Select`,
	[GENERIC.Unselect]:() => `Unselect`,
	[GENERIC.Edit]:() => `Edit`,
	[GENERIC.Add]:() => `Add`,
	[GENERIC.Save]:() => `Save`,
	[GENERIC.New]:() => `New`,
	[GENERIC.Delete]:() => `Delete`,
	[GENERIC.Remove]:() => `Remove`,
	[GENERIC.RemoveAll]:() => `Remove All`,
	[GENERIC.Copy]:() => `Copy`,
	[GENERIC.Import]:() => `Import`,
	[GENERIC.Identity]:() => `Identity`,
	[GENERIC.Export]:() => `Export`,
	[GENERIC.Refresh]:() => `Refresh`,
	[GENERIC.Manage]:() => `Manage`,
	[GENERIC.PrivateKey]:() => `Private Key`,
	[GENERIC.PublicKey]:(n = 1) => `Public Key${plural_s(n)}`,
	[GENERIC.Keys]:(n = 1) => `Key${plural_s(n)}`,
	[GENERIC.Hide]:() => `Hide`,
	[GENERIC.Reveal]:() => `Reveal`,
	[GENERIC.Tokens]:(n = 0) => `Token${plural_s(n)}`,
	[GENERIC.Network]:(n = 1) => `Network${plural_s(n)}`,
	[GENERIC.Blockchain]:(n = 1) => `Blockchain${plural_s(n)}`,
	[GENERIC.Contract]:(n = 1) => `Contract${plural_s(n)}`,
	[GENERIC.Memo]:() => `Memo`,
	[GENERIC.Symbol]:() => `Symbol`,
	[GENERIC.Decimals]:() => `Decimals`,
	[GENERIC.PasswordOrPhrase]:() => `Password or Backup Phrase`,
	[GENERIC.Timestamp]:() => `Timestamp`,
	[GENERIC.ChainID]:() => `Chain ID`,
	[GENERIC.Name]:() => `Name`,
	[GENERIC.Accounts]:(n = 0) => `Account${plural_s(n)}`,
	[GENERIC.AccountName]:() => `Account Name`,
	[GENERIC.Address]:() => `Address`,
	[GENERIC.Search]:() => `Search`,
	[GENERIC.Buy]:() => `Buy`,
	[GENERIC.Sell]:() => `Sell`,
	[GENERIC.Buying]:() => `Buying`,
	[GENERIC.Selling]:() => `Selling`,
	[GENERIC.MyAccounts]:() => `My Accounts`,
	[GENERIC.Contacts]:() => `Contacts`,
	[GENERIC.OpenContacts]:() => `Open Contacts`,
	[GENERIC.ContactName]:() => `Contact Name`,
	[GENERIC.AddContact]:() => `Add Contact`,
	[GENERIC.SelectToken]:() => `Select Token`,
	[GENERIC.DisplayToken]:() => `Display Token & Fiat Symbol`,
	[GENERIC.History]:() => `History`,
	[GENERIC.Exchange]:() => `Exchange`,
	[GENERIC.Redo]:() => `Redo`,
	[GENERIC.AllNetworks]:() => `All Networks`,
	[GENERIC.RefreshBalances]:() => `Refresh Balances`,
	[GENERIC.Browse]:() => `Browse`,

	

	/****************************************************/
	/*                                                  */
	/*                  LOGIN / AUTH                    */
	/*                                                  */
	/****************************************************/

	[LOGIN.NEW.Title]:() => `You must be new here!`,
	[LOGIN.NEW.SubTitle]:() =>
		`Let's start by creating a password that will be used to encrypt all of your private data. Make sure it's strong.`,
	[LOGIN.NEW.PasswordLabel]:() => `Choose a password`,
	[LOGIN.NEW.PasswordPlaceholder]:() => `Make sure it's a strong password!`,
	[LOGIN.NEW.PasswordConfirmLabel]:() => `Type your password again`,
	[LOGIN.NEW.PasswordConfirmPlaceholder]:() => `Twice is nice.`,
	[LOGIN.NEW.CreateButton]:() => `Let's go!`,
	[LOGIN.NEW.RestoreBackupButton]:() => `I want to restore from a backup`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.EXISTING.Title]:() => `Welcome Back`,
	[LOGIN.EXISTING.PasswordPlaceholder]:() => `Password or Backup Phrase`,
	[LOGIN.EXISTING.ResetButton]:() => `I need to reset my password`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.RESTORE.Title]:() => `Restore from backup`,
	[LOGIN.RESTORE.SubTitle]:() =>
		`If you have a backup for your Scatter you can import it here by loading it into Scatter. 
        You will still need the password to unlock it.`,
	[LOGIN.RESTORE.ChooseButton]:() => `Choose your Backup`,
	[LOGIN.RESTORE.BackButton]:() => `Go back and start from scratch`,




	/****************************************************/
	/*                                                  */
	/*                    DASHBOARD                     */
	/*                                                  */
	/****************************************************/

	[DASHBOARD.KEYS.SearchPlaceholder]:() => `Search Keys`,
	[DASHBOARD.KEYS.AddKeysButton]:() => `Add Keys`,
	[DASHBOARD.KEYS.NoKeys]:() => `Well, what are we waiting for?`,
	[DASHBOARD.KEYS.LinkedAccounts]:count => `${count} linked account${plural_s(count)}`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[DASHBOARD.TOOLBARS.SendButton]:() => `Send`,
	[DASHBOARD.TOOLBARS.ReceiveButton]:() => `Receive`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[DASHBOARD.APPS.SearchPlaceholder]:() => `Search Applications`,
	[DASHBOARD.APPS.NoAppsTitle]:() => `No apps connected`,
	[DASHBOARD.APPS.NoAppsDescription]:() =>
		`You can explore apps by searching for various things in the search field above.`,
	[DASHBOARD.APPS.LinkPermissionOnly]:() => `Link permission only`,
	[DASHBOARD.APPS.NPermissions]:n => `${n} Permission${plural_s(n)}`,
	[DASHBOARD.APPS.NoPermissions]:() => `No Permissions`,
	[DASHBOARD.APPS.NoMeta]:() => `No Meta`,



	/****************************************************/
	/*                                                  */
	/*                     ADD KEYS                     */
	/*                                                  */
	/****************************************************/

	[ADD_KEYS.SELECT.Disclaimer]:() => `Private keys are created locally on your computer and never touch the internet.`,
	[ADD_KEYS.SELECT.CreateTitle]:() => `Create a new key`,
	[ADD_KEYS.SELECT.CreateDescription]:() =>
		`If you want to create a new set of keys that you can use on any blockchain. 
		The keys will not have any funds on them, they are brand new.`,
	[ADD_KEYS.SELECT.CreateButton]:() => `Create Key`,
	[ADD_KEYS.SELECT.ImportTitle]:() => `Import an existing key`,
	[ADD_KEYS.SELECT.ImportDescription]:() => `If you already have a key and want to import it into Scatter`,
	[ADD_KEYS.SELECT.ImportButton]:() => `Import Key`,
	[ADD_KEYS.SELECT.CreateEosTitle]:() => `Create a new EOS account`,
	[ADD_KEYS.SELECT.CreateEosDescription]:() => `We'll quickly generate two keys for you`,
	[ADD_KEYS.SELECT.CreateEosButton]:() => `EOS account`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT.NameLabel]:() => `Key Name`,
	[ADD_KEYS.IMPORT.NamePlaceholder]:() => `Give this key a name to remember.`,
	[ADD_KEYS.IMPORT.TextTitle]:() => `Import private key as text`,
	[ADD_KEYS.IMPORT.TextDescription]:() => `If you would like to type in or paste your private key`,
	[ADD_KEYS.IMPORT.TextButton]:() => `Text`,
	[ADD_KEYS.IMPORT.HardwareTitle]:() => `Import from a hardware wallet`,
	[ADD_KEYS.IMPORT.HardwareDescription]:() => `If you have a supported hardware wallet`,
	[ADD_KEYS.IMPORT.HardwareButton]:() => `Hardware`,
	[ADD_KEYS.IMPORT.QrTitle]:() => `Import private key from a QR code`,
	[ADD_KEYS.IMPORT.QrDescription]:() => `If you have an encrypted paper wallet QR code`,
	[ADD_KEYS.IMPORT.QrButton]:() => `QR`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT_TEXT.KeyLabel]:() => `Enter a Private Key`,
	[ADD_KEYS.IMPORT_TEXT.KeyPlaceholder]:() => `Make sure to enter it correctly`,
	[ADD_KEYS.IMPORT_TEXT.ERRORS.InvalidKeyLength]:x => `Private key not long enough (${x})`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT_HW.SelectHardwareLabel]:() => `Select a Hardware Wallet`,
	[ADD_KEYS.IMPORT_HW.AvailableBlockchainsLabel]:() => `Available Blockchains`,
	[ADD_KEYS.IMPORT_HW.IndexLabel]:() => `Key/Address Index`,
	[ADD_KEYS.IMPORT_HW.HardwareError]:() => `Hardware Error`,
	[ADD_KEYS.IMPORT_HW.UnlockLedgerError]:x => `You need to unlock your ledger and open the ${x} Ledger App.`,
	[ADD_KEYS.IMPORT_HW.UnlockedLiquidEOSError]:() => `You need to unlock your Liquid EOS Hardware Wallet.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.EOS_KEYS.OwnerDescription]:() =>
		`This is your master key which has total control over your account. 
		Do not keep it in Scatter unless you absolutely need it`,
	[ADD_KEYS.EOS_KEYS.ActiveDescription]:() =>
		`This is the key you will use with applications. It is what you want to keep imported into Scatter.`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountTitle]:() => `Use these keys to create an EOS account.`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountDescription]:() =>
		`You can not instantly use EOS with just keys, you need to create an account with them.`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountButton]:() => `Create Account`,


	/****************************************************/
	/*                                                  */
	/*               CREATE EOS ACCOUNT                 */
	/*                                                  */
	/****************************************************/
	[CREATE_EOS.DisclaimerTitle]:() => `Accounts on the EOS blockchain must be paid for to be able to be used.`,
	[CREATE_EOS.AccountNameLengthError]:() => `Account name must be 12 characters long.`,
	[CREATE_EOS.AccountNameFormattingError]:() => `Account name must be lowercase letters only.`,
	[CREATE_EOS.SelectCreatorError]:() => `Please select an account creator first.`,
	[CREATE_EOS.CheckingNameAlert]:() => `Checking if name is available...`,
	[CREATE_EOS.NameTakenAlert]:() => `This name is already taken.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.ACCOUNT.AccountsLabel]:() => `This account will be used to create the account`,
	[CREATE_EOS.ACCOUNT.RamCostLabel]:() => `Mandatory RAM Cost`,
	[CREATE_EOS.ACCOUNT.ResourcesLabel]:() => `CPU and NET`,
	[CREATE_EOS.ACCOUNT.ResourcesLowError]:(amount) => `You must allocate at least ${amount}`,
	[CREATE_EOS.ACCOUNT.TotalLabel]:() => `Total`,
	[CREATE_EOS.ACCOUNT.ActionBarButton]:() => `Create Account`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.EXCHANGE.ChangeName]:() => `Want to change names?`,
	[CREATE_EOS.EXCHANGE.InfoTitle]:() => `You need to pay for the resources needed to create accounts on the EOS blockchain.`,
	[CREATE_EOS.EXCHANGE.InfoSubtitle]:() => `All of the extra funds you send will be transferred to the account.`,
	[CREATE_EOS.EXCHANGE.UseNameButton]:() => `Use Name`,
	[CREATE_EOS.EXCHANGE.ExchangeFieldParts]:() => [
		`Send at least`,    // 2 EOS
		`to account`,       // makeaccounts
		`with`,             // EOS5kd....
		`as the memo`,
	],
	[CREATE_EOS.EXCHANGE.SentTitle]:() => `After sending EOS from an exchange with the above details, copy the transaction ID here.`,
	[CREATE_EOS.EXCHANGE.SentSubtitle]:() => `You must wait for the transaction to be irreversible, this takes around 3 minutes.`,
	[CREATE_EOS.EXCHANGE.ActionBarButton]:() => `Create Account`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.ERRORS.InvalidResources]:() => `Either CPU or NET was below or equal to 0`,



	/****************************************************/
	/*                                                  */
	/*                 WALLET / KEYPAIR                 */
	/*                                                  */
	/****************************************************/
	[KEYPAIR.NameLabel]:() => Locale[ADD_KEYS.IMPORT.NameLabel](),
	[KEYPAIR.NamePlaceholder]:() => Locale[ADD_KEYS.IMPORT.NamePlaceholder](),
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.DASHBOARD.STATES.AddAccount]:() => `Add Account`,
	[KEYPAIR.DASHBOARD.STATES.LinkedAccounts]:() => `Linked Accounts`,
	[KEYPAIR.DASHBOARD.STATES.KeysAndBlockchains]:() => `Keys & Blockchains`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountLabel]:() => `Create a new EOS account`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountDescription]:() =>
		`If you want to create a new EOS account on top of this key.`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountButton]:() => `Create Account`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.LinkEosAccountLabel]:() => `Link existing EOS account`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.LinkEosAccountDescription]:() =>
		`If you already have an EOS account, but it's not being imported automatically.`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.AccountNetworkLabel]:() => `Link existing EOS account`,
	[KEYPAIR.DASHBOARD.ERRORS.InvalidWalletName]:() => `Enter a name for this Key`,
	[KEYPAIR.DASHBOARD.ERRORS.WalletNameExists]:() => `A Key with this name already exists`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.ACCOUNTS.SearchPlaceholder]:() => `Search Accounts`,
	[KEYPAIR.ACCOUNTS.ViewTokens]:n => `${n} Token${plural_s(n)}`,
	[KEYPAIR.ACCOUNTS.EOSClaimRefundButton]:() => `Refund`,
	[KEYPAIR.ACCOUNTS.EOSDangerousPermissions]:() =>
		`Both active and owner are on the same key.`,
	[KEYPAIR.ACCOUNTS.EOSDangerousPermissionsSubtitle]:() =>
		`Consider changing one to another key by clicking the "Change Permissions" button below.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.ACCOUNTS.ACTIONS.EOS.ChangePermissionsButton]:() => `Change Account Keys`,
	[KEYPAIR.ACCOUNTS.ACTIONS.EOS.ProxyVotesButton]:() => `Proxy Votes`,
	[KEYPAIR.ACCOUNTS.ACTIONS.EOS.UnlinkAccountButton]:() => `Unlink Account`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.BLOCKCHAINS.CopyButton]:() => `Copy Public Key`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.SELECT.KeyTitle]:() => `Key`,
	[KEYPAIR.EXPORT.SELECT.KeyDescription]:() => `Export this Private Key as text`,
	[KEYPAIR.EXPORT.SELECT.QrTitle]:() => `Paper Wallet`,
	[KEYPAIR.EXPORT.SELECT.QrDescription]:() => `Export this Private Key as an encrypted QR code`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.KEY.Title]:() => `Private Key as Text`,
	[KEYPAIR.EXPORT.KEY.CopyButton]:() => `Copy`,
	[KEYPAIR.EXPORT.KEY.RevealButton]:() => `Reveal`,
	[KEYPAIR.EXPORT.KEY.HideButton]:() => `Hide`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.QR.Title]:() => `QR Code Paper Wallet`,
	[KEYPAIR.EXPORT.QR.SaveButton]:() => `Save as Image`,




	/****************************************************/
	/*                                                  */
	/*                    IDENTITIES                    */
	/*                                                  */
	/****************************************************/
	[IDENTITY.Title]:() => `Identity`,
	[IDENTITY.DisclaimerTitleImportant]:() => `Nothing here is required in order to use Scatter`,
	[IDENTITY.DisclaimerTitle]:() =>
		`but it might be required by some applications connecting to your Scatter, 
		for instance when using a shopping application that needs your shipping address.`,
	[IDENTITY.DisclaimerSubtitle]:() => `All information is stored locally on your computer and is never sent anywhere without your consent.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.NameLabel]:() => `Identity Name / Username`,
	[IDENTITY.NamePlaceholder]:() => `Your online presence`,
	[IDENTITY.NameError]:() => `The Identity Name name can not be empty, have any spaces in it, or special characters.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.PERSONAL.NameLabel]:() => `Full Name`,
	[IDENTITY.PERSONAL.NamePlaceholder]:() => `Enter your full name`,
	[IDENTITY.PERSONAL.DateOfBirthLabel]:() => `Date of Birth`,
	[IDENTITY.PERSONAL.EmailLabel]:() => `Email`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.LOCATION.DisclaimerTitle]:() => `You can create multiple locations.`,
	[IDENTITY.LOCATION.DisclaimerSubtitle]:() => `For instance "Home" and "Work". You will be able to select which one to use when you need it.`,
	[IDENTITY.LOCATION.SelectorLabel]:() => `Locations`,
	[IDENTITY.LOCATION.SelectorAddButton]:() => `Add`,
	[IDENTITY.LOCATION.NameLabel]:() => `Location Name`,
	[IDENTITY.LOCATION.NamePlaceholder]:() => `Home`,
	[IDENTITY.LOCATION.NameError]:() => `Location names must not be empty.`,
	[IDENTITY.LOCATION.CountryLabel]:() => `Country`,
	[IDENTITY.LOCATION.CountryItemNone]:() => `None`,
	[IDENTITY.LOCATION.PhoneLabel]:() => `Phone Number`,
	[IDENTITY.LOCATION.PhonePlaceholderArea]:() => `555`,
	[IDENTITY.LOCATION.PhonePlaceholderPrefix]:() => `555`,
	[IDENTITY.LOCATION.PhonePlaceholderSuffix]:() => `5555`,
	[IDENTITY.LOCATION.AddressLabel]:() => `Address`,
	[IDENTITY.LOCATION.AddressPlaceholder]:() => `5 Broadway`,
	[IDENTITY.LOCATION.CityLabel]:() => `City`,
	[IDENTITY.LOCATION.CityPlaceholder]:() => `New York`,
	[IDENTITY.LOCATION.StateLabel]:() => `State`,
	[IDENTITY.LOCATION.StatePlaceholder]:() => `NY`,




	/****************************************************/
	/*                                                  */
	/*                   PERMISSIONS                    */
	/*                                                  */
	/****************************************************/
	[PERMISSIONS.ListLabel]:() => `Permissions`,
	[PERMISSIONS.LoginPermission]:() => `Login Permission`,
	[PERMISSIONS.AccountsLabel]:() => `Accounts Provided`,
	[PERMISSIONS.RequiredFieldsLabel]:() => `Required Fields`,
	[PERMISSIONS.MutableFieldsLabel]:() => `Mutable Fields`,
	[PERMISSIONS.RemoveLabel]:() => `Remove Permission`,
	[PERMISSIONS.RemoveIdentityText]:() =>
		`Login permissions are what allow applications to interact with your Scatter.
        You can force a log-out from an application by removing this permission.`,
	[PERMISSIONS.RemoveWhitelistLabel]:() =>
		`Action whitelists make it so you don't have to keep accepting popups to sign transactions.
        Do you want to remove this whitelist?`,
	[PERMISSIONS.ActionWhitelist]:() => `Action Whitelist`,




	/****************************************************/
	/*                                                  */
	/*                     SETTINGS                     */
	/*                                                  */
	/****************************************************/
	[SETTINGS.Basics]:() => `Basics`,
	[SETTINGS.DangerZone]:() => `Danger Zone`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.MENU.General]:() => `General`,
	[SETTINGS.MENU.Language]:() => `Language`,
	[SETTINGS.MENU.Tokens]:() => `Tokens`,
	[SETTINGS.MENU.Explorers]:() => `Explorers`,
	[SETTINGS.MENU.PIN]:() => `PIN`,
	[SETTINGS.MENU.Firewall]:() => `Firewall`,
	[SETTINGS.MENU.Networks]:() => `Networks`,
	[SETTINGS.MENU.Password]:() => `Password`,
	[SETTINGS.MENU.Backup]:() => `Backup`,
	[SETTINGS.MENU.Destroy]:() => `Destroy`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.GENERAL.VersionLabel]:() => `Version`,
	[SETTINGS.GENERAL.UpdateAvailable]:() => `Update Available`,
	[SETTINGS.GENERAL.NoUpdateAvailable]:() => `No Update Available`,
	[SETTINGS.GENERAL.WhitelistNotificationsLabel]:() => `Whitelist Notifications`,
	[SETTINGS.GENERAL.WhitelistNotificationsDescription]:() =>
		`These notifications appear on certain operating systems when you auto-sign whitelisted transactions.`,
	[SETTINGS.GENERAL.DataPathLabel]:() => `Data Path`,
	[SETTINGS.GENERAL.DataPathDescription]:() =>
		`The location on your computer that Scatter saves its encrypted data to.`,
	[SETTINGS.GENERAL.DeveloperConsoleLabel]:() => `Developer Console`,
	[SETTINGS.GENERAL.DeveloperConsoleDescription]:() =>
		`Sometimes you might need to see if Scatter is throwing any errors.`,
	[SETTINGS.GENERAL.DeveloperConsoleButton]:() => `Open Console`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.LANGUAGE.Label]:() => `Select your Language`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.TOKENS.SWITCH.ADD_TOKEN]:() => `Add Token`,
	[SETTINGS.TOKENS.SWITCH.WHITELIST]:() => `Tokens`,
	[SETTINGS.TOKENS.SWITCH.BLACKLIST]:() => `Filtered`,
	[SETTINGS.TOKENS.SWITCH.SETTINGS]:() => `Settings`,
	[SETTINGS.TOKENS.ADD_TOKEN.Disclaimer]:() => `Adding tokens will allow you to send them and fetch their balances.`,
	[SETTINGS.TOKENS.ADD_TOKEN.TokenNamePlaceholder]:() => `Name this token or leave empty to use its symbol.`,
	[SETTINGS.TOKENS.ADD_TOKEN.TokenNameLabel]:() => `Token Name`,
	[SETTINGS.TOKENS.ADD_TOKEN.WhitelistTokenButton]:() => `Whitelist Token`,
	[SETTINGS.TOKENS.ADD_TOKEN.BlacklistTokenButton]:() => `Blacklist Token`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayLabel]:() => `Main Balance Display`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayDescription]:() =>
		`You can set whether you want to see balances for all networks in the main dashboard, or just balances for mainnets.`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayMainnetButton]:() => `Show all networks`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayMainnetDesc]:() =>
		`Displaying only mainnet tokens means Scatter will not use alternate chain or testnet chain tokens to calculate total balances.`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayAllNetworksButton]:() => `Show only Mainnets`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayAllNetworksDesc]:() =>
		`Showing all networks means Scatter will take every network into consideration when calculating total balances.`,
	[SETTINGS.TOKENS.SETTINGS.FilterSmallBalancesLabel]:() => `Filter Small Balances`,
	[SETTINGS.TOKENS.SETTINGS.FilterSmallBalancesDescription]:() =>
		`If you want to always filter out tokens with small balances you can set a modifier here.`,
	[SETTINGS.TOKENS.WHITE_BLACK.TokenFilterLabel]:() => `Filter Tokens by Blockchain`,
	[SETTINGS.TOKENS.WHITE_BLACK.TokenSearchPlaceholder]:() => `Search Tokens`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.Disclaimer]:() =>
		`Select any token or currency to make it your main display type.`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.FiatCurrencyLabel]:() => `Show as fiat currency`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.SystemTokensLabel]:() => `System Tokens`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.CustomTokensLabel]:() => `Custom Tokens`,
	[SETTINGS.TOKENS.WHITE_BLACK.BLACKLIST.Disclaimer]:() => `Filtered tokens will not be displayed.`,
	[SETTINGS.TOKENS.WHITE_BLACK.BLACKLIST.DisclaimerSubtitle]:() =>
		`You cannot filter out system tokens for your networks.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.PIN.Label]:() => `Change your PIN`,
	[SETTINGS.PIN.Description]:() => `Your PIN is a secondary internal password for doing Transfers.`,
	[SETTINGS.PIN.DescriptionRed]:() => `Do not make your PIN the same as your password!`,
	[SETTINGS.PIN.Placeholder]:() => `PIN Disabled`,
	[SETTINGS.PIN.SavedSnackbar]:() => `Saved PIN`,
	[SETTINGS.PIN.PinForAllTitle]:() => `Use PIN for all interactions.`,
	[SETTINGS.PIN.PinForAllDescription]:() => `If you enable this you will also need to enter your PIN for every popup.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.NETWORKS.SWITCH.Known]:() => `Known Networks`,
	[SETTINGS.NETWORKS.SWITCH.Custom]:() => `Your Networks`,
	[SETTINGS.NETWORKS.KNOWN.AddLabel]:() => `Add a known network`,
	[SETTINGS.NETWORKS.KNOWN.AddDescription]:() =>
		`You can add highly used blockchain networks easily without having to enter their details manually.`,
	[SETTINGS.NETWORKS.CUSTOM.NamePlaceholder]:() => `Local Network`,
	[SETTINGS.NETWORKS.CUSTOM.HostLabel]:() => `Host ( domain.com or IP )`,
	[SETTINGS.NETWORKS.CUSTOM.ProtocolLabel]:() => `Protocol`,
	[SETTINGS.NETWORKS.CUSTOM.PortLabel]:() => `Port`,
	[SETTINGS.NETWORKS.CUSTOM.ChainIdTooltip]:() => `Fetch Chain ID`,
	[SETTINGS.NETWORKS.CUSTOM.FromOriginPlaceholder]:() => `From Origin`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenLabel]:() => `Custom System Token`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenDescription]:() => `In some cases you might need to change the system token.`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenUseDefaultButton]:() => `Use Default System Token`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenUseCustomButton]:() => `Use Custom System Token`,
	[SETTINGS.NETWORKS.CUSTOM.UsingCustomSystemToken]:() => `This network is using a custom token.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.PASSWORD.ChangePasswordLabel]:() => `Change your Password`,
	[SETTINGS.PASSWORD.ChangePasswordDescription]:() =>
		`Every time you change your password you will get a new Mnemonic 
		( Backup Phrase ) which is your alternate password for unlocking Scatter.`,
	[SETTINGS.PASSWORD.NewPasswordLabel]:() => `New Password`,
	[SETTINGS.PASSWORD.NewPasswordPlaceholder]:() => `Password`,
	[SETTINGS.PASSWORD.ConfirmPasswordLabel]:() => `Confirm new Password`,
	[SETTINGS.PASSWORD.ConfirmPasswordPlaceholder]:() => `Retype Password`,
	[SETTINGS.PASSWORD.ChangePasswordButton]:() => `Change Password`,
	[SETTINGS.PASSWORD.ViewMnemonicLabel]:() => `View Mnemonic`,
	[SETTINGS.PASSWORD.ViewMnemonicDescription]:() =>
		`If you've lost your password's mnemonic alternative you can view it here.`,
	[SETTINGS.PASSWORD.ViewMnemonicButton]:() => `View Mnemonic`,
	[SETTINGS.PASSWORD.ChangedPasswordSnackbar]:() => `Password Changed`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.BACKUP.Label]:() => `Configure Backups`,
	[SETTINGS.BACKUP.Description]:() =>
		`Backups allow you to save the state of your entire Scatter including all keys, 
		permissions and settings.`,
	[SETTINGS.BACKUP.AutoBackupLocationLabel]:() => `Auto-Backup Location`,
	[SETTINGS.BACKUP.CreateBackupButton]:() => `Create Backup`,
	[SETTINGS.BACKUP.CurrentBackupFolderLabel]:() => `Current Backup Folder`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.FIREWALL.ENABLED.Label]:() => `Enable Firewall`,
	[SETTINGS.FIREWALL.ENABLED.Description]:() =>
		`RIDL Defender is Scatter's proprietary decentralized firewall system. It helps protect you from malicious websites, applications, and accounts.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.DESTROY.Label]:() => `Configure`,
	[SETTINGS.DESTROY.Description]:() =>
		`Destroying your Scatter will remove all your data including your identities and Keypair 
		configurations from your local machine.
        It will not delete your blockchain accounts from the actual blockchain.`,
	[SETTINGS.DESTROY.Important]:() => `MAKE SURE YOU HAVE A BACKUP BEFORE YOU DO THIS!`,
	[SETTINGS.DESTROY.Button]:() => `Destroy Scatter`,




	/****************************************************/
	/*                                                  */
	/*                     HISTORY                      */
	/*                                                  */
	/****************************************************/
	[HISTORY.ClearingHistory]:() => `Clearing History`,
	[HISTORY.ClearingHistoryText]:() => `Your history in Scatter is only stored locally. If you clear it you will not be able to restore it.`,


	/****************************************************/
	/*                                                  */
	/*                     TOKENS                       */
	/*                                                  */
	/****************************************************/
	[TOKENS.SetDisplayTokens]:() => `Set Display Tokens`,
	[TOKENS.FiatCurrencies]:() => `Fiat Currencies`,
	[TOKENS.SystemTokens]:() => `System Tokens`,


	/****************************************************/
	/*                                                  */
	/*                     TRANSFER                     */
	/*                                                  */
	/****************************************************/
	[TRANSFER.SendButton]:() => `Send Tokens`,
	[TRANSFER.Sender]:() => `Sender`,
	[TRANSFER.Recipient]:() => `Recipient`,
	[TRANSFER.MemoPlaceholder]:() => `Optional Memo`,


	/****************************************************/
	/*                                                  */
	/*                     EXCHANGE                     */
	/*                                                  */
	/****************************************************/
	[EXCHANGE.ExchangeButton]:() => `Exchange Tokens`,
	[EXCHANGE.Exchanging]:() => `Exchanging`,
	[EXCHANGE.Receiving]:() => `Receiving`,
	[EXCHANGE.To]:() => `To`,
	[EXCHANGE.FetchingPairs]:() => `Fetching Pairs`,
	[EXCHANGE.FetchingRate]:() => `Fetching Rate`,
	[EXCHANGE.SelectPair]:() => `Select Pair`,
	[EXCHANGE.NoRates]:() => `No Rates`,
	[EXCHANGE.Min]:() => `Min`,
	[EXCHANGE.Max]:() => `Max`,
	[EXCHANGE.ExchangeError]:() => `Exchange Error`,
	[EXCHANGE.CantConnect]:() => `Can't connect to the Exhange API.`,
	[EXCHANGE.DisclaimerTitle]:() => `Please note that this is an estimate!`,
	[EXCHANGE.DisclaimerDescription]:() => `Token prices could change between now and the time it takes to complete the exchange. You may get slightly more or less than estimated.`,





	/****************************************************/
	/*                                                  */
	/*                     USER BAR                     */
	/*                                                  */
	/****************************************************/
	[USER_BAR.ManageIdentity]:() => `Manage Identity`,


	/****************************************************/
	/*                                                  */
	/*                    PROCESSES                     */
	/*                                                  */
	/****************************************************/
	[PROCESSES.FetchAccountsFromNetwork]:x => `Fetching accounts for ${x}`,
	[PROCESSES.ImportingAccountsFromNetwork]:x => `Importing ${x[0]} accounts for ${x[1]}`,
	[PROCESSES.ImportingAccounts]:() => `Importing Accounts`,
	[PROCESSES.LoadingResources]:() => `Loading Account Resources`,
	[PROCESSES.AccountsLeft]:(x) => `Accounts left: ${x}`,


	/****************************************************/
	/*                                                  */
	/*                    SNACKBARS                     */
	/*                                                  */
	/****************************************************/
	[SNACKBARS.CopiedToClipboard]:() => `Copied to Clipboard`,
	[SNACKBARS.BadPassword]:() => `Bad Password`,
	[SNACKBARS.SavedImage]:() => `Image Saved`,
	[SNACKBARS.TokenAdded]:() => `Token Added`,
	[SNACKBARS.ContactExists]:() => `Another contact already has this recipient`,
	[SNACKBARS.ContactNameExists]:() => `Another contact already has this name`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SNACKBARS.NETWORK.MissingName]:() => `Network must have a name`,
	[SNACKBARS.NETWORK.MissingHost]:() => `Network must have a host`,
	[SNACKBARS.NETWORK.MissingPort]:() => `Network must have a valid port`,
	[SNACKBARS.NETWORK.MissingChain]:() => `Network must have a chain id`,
	[SNACKBARS.NETWORK.ChainExists]:() => `A network with this chain id already exists`,
	[SNACKBARS.NETWORK.NameExists]:() => `A network with this name already exists`,
	[SNACKBARS.NETWORK.Saved]:() => `Network Saved!`,
	[SNACKBARS.NETWORK.Deleted]:() => `Network Deleted!`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SNACKBARS.TOKENS.MissingSymbol]:() => `You must add a token symbol`,
	[SNACKBARS.TOKENS.MissingContract]:() => `You must add a token contract`,
	[SNACKBARS.TOKENS.TokenExistsAdded]:() => `This token already exists in added tokens`,
	[SNACKBARS.TOKENS.TokenExistsFiltered]:() => `Token already exists in filtered tokens`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SNACKBARS.AUTH.LockedOut]:() => `You have been locked out temporarily`,
	[SNACKBARS.AUTH.ErrorParsingBackup]:() => `Error Parsing Backup File`,
	[SNACKBARS.AUTH.ErrorDecryptingBackup]:() => `Error Decrypting Backup File`,
	[SNACKBARS.AUTH.CantReadBackup]:() => `Can't read backup file`,
	[SNACKBARS.AUTH.PasswordLength]:() => `Passwords must be at least 8 characters long`,
	[SNACKBARS.AUTH.InvalidConfirmation]:() => `The confirmation does not match the password`,


	/****************************************************/
	/*                                                  */
	/*                     POPOUTS                      */
	/*                                                  */
	/****************************************************/
	[POPOUTS.REQ_FIELDS.PersonalInfo]:() => `Personal Info`,
	[POPOUTS.REQ_FIELDS.LocationInfo]:() => `Location Info`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.LOGIN.AccountRequirements]:() => `App requires accounts for these networks`,
	[POPOUTS.LOGIN.NoAccountsTitle]:() => `You do not have blockchain accounts for the networks that this application requires.`,
	[POPOUTS.LOGIN.NoAccountsDesc]:() =>
		`Before logging into this application go back to Scatter and import some keys for the network/blockchain that this application is using.`,
	[POPOUTS.LOGIN.MissingFieldsTitle]:() => `You are missing some fields!`,
	[POPOUTS.LOGIN.MissingFieldsDesc]:() =>
		`Fill out the inputs below which will add those fields to your Identity for later use and also return them to the application.`,
	[POPOUTS.LOGIN.LoginButton]:() => `Login`,
	[POPOUTS.LOGIN.ShowAllAccounts]:() => `Show All`,
	[POPOUTS.LOGIN.FilterAccounts]:() => `Filter`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.GET_KEY.GenerateKeyButton]:() => `Generate a new Key`,
	[POPOUTS.GET_KEY.SearchPlaceholder]:() => `Search Keys`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.LINK_APP.AppKey]:() => `App Key`,
	[POPOUTS.LINK_APP.Disclaimer]:() => `Make sure the application name is an application you are interacting with right now.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.SIGNATURE.ActionsTotal]:x => `${x} actions in total`,
	[POPOUTS.SIGNATURE.AccountsInvolved]:() => `Accounts Involved`,
	[POPOUTS.SIGNATURE.KeysInvolved]:() => `Keys Involved`,
	[POPOUTS.SIGNATURE.ArbitraryDisabledTitle]:() => `Arbitrary signing disabled!`,
	[POPOUTS.SIGNATURE.ArbitraryDisabledDesc]:() =>
		`To protect you we have disabled the ability to sign arbitrary data that is longer than 12 characters per word.`,
	[POPOUTS.SIGNATURE.WhitelistDesc]:() => `Whitelist this to not have to accept next time`,
	[POPOUTS.SIGNATURE.DisableWhitelistButton]:() => `Disable Whitelist`,
	[POPOUTS.SIGNATURE.EnableWhitelistButton]:() => `Enable Whitelist`,
	[POPOUTS.SIGNATURE.PreviouslyWhitelisted]:() => `This action was previously whitelisted.`,
	[POPOUTS.SIGNATURE.HiddenActions]:() => `Action is hidden`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.TRANSFER.SendingTo]:symbol => `sending ${symbol} to`,
	[POPOUTS.TRANSFER.SearchPlaceholder]:() => `Search Accounts`,



	/****************************************************/
	/*                                                  */
	/*                     POPINS                       */
	/*                                                  */
	/****************************************************/
	[POPINS.FULLSCREEN.CHECK_HARDWARE.Title]:() => `Check Hardware`,
	[POPINS.FULLSCREEN.CHECK_HARDWARE.Desc]:() => `You should see a confirmation on your hardware device.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.CONFIRM_PASS.Title]:() => `Confirm Password`,
	[POPINS.FULLSCREEN.CONFIRM_PASS.Label]:() => `Enter password or backup phrase`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.DESTROY.Title]:() => `Destroy Scatter`,
	[POPINS.FULLSCREEN.DESTROY.Disclaimer]:() =>
		`Before doing this, make sure you have all of your Private Keys backed up.`,
	[POPINS.FULLSCREEN.DESTROY.Desc]:() =>
		`Destroying your Scatter is irreversible, and you will not be able to restore any data without backups.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.WHITELISTING.Title]:() => `Enabled Whitelist`,
	[POPINS.FULLSCREEN.WHITELISTING.Desc]:() =>
		`Whitelisting actions makes it so you don't have to keep approving actions for applications you trust.
		When whitelisting actions you will see checkboxes appear next to each action and value.`,
	[POPINS.FULLSCREEN.WHITELISTING.ActionLabel]:() => `This action will be whitelisted`,
	[POPINS.FULLSCREEN.WHITELISTING.MutableProp]:() => `this value will be able to change without a popup`,
	[POPINS.FULLSCREEN.WHITELISTING.ImmutableProp]:() => `if this changes you will have to approve the action again`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.Available]:x => `Available ${x}`,
	[POPINS.FULLSCREEN.EOS.Reclaiming]:x => `Reclaiming ${x}`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Title]:() => `Change Account Permissions`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Desc]:() => `Changing your account's permissions means changing the keys that power the account.`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.SubDesc]:() => `You can leave either field blank to keep the existing permission.`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeysLabel]:() => `Imported Keys`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeyPlaceholder]:() => `Enter a public key or account name`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.OwnerLabel]:() => `Owner`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.ActiveLabel]:() => `Active`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Button]:() => `Change Permissions`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.Stake]:() => `Stake`,
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.Unstake]:() => `Unstake`,
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.StakeDesc]:() =>
		`Self staking CPU & NET will allow this account to do more on the blockchain.`,
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.UnstakeDesc]:() =>
		`Unstaking CPU & NET will reclaim tokens, but will let you do less.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.MOD_RAM.BuyDesc]:() => `Buying RAM will let this account hold more data on the blockchain.`,
	[POPINS.FULLSCREEN.EOS.MOD_RAM.SellDesc]:() => `Selling RAM reclaims token to that account at the current price of RAM.`,
	[POPINS.FULLSCREEN.EOS.MOD_RAM.BytesError]:() => `Bytes must be over 15`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.PROXY.Title]:() => `Proxy Votes`,
	[POPINS.FULLSCREEN.EOS.PROXY.ReproxyTitle]:() => `Do you want to automatically re-proxy every 7 days?`,
	[POPINS.FULLSCREEN.EOS.PROXY.ReproxyDesc]:() =>
		`If you enable this, accepting the initial transaction also accepts all future transactions too.`,
	[POPINS.FULLSCREEN.EOS.PROXY.Label]:() => `Proxy`,
	[POPINS.FULLSCREEN.EOS.PROXY.Placeholder]:() => `Enter the account name of a proxy`,
	[POPINS.FULLSCREEN.EOS.PROXY.KnownProxiesLabel]:() => `Known Proxies`,
	[POPINS.FULLSCREEN.EOS.PROXY.Button]:() => `Set Proxy`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.MNEMONIC.Title]:() => `Password Alternative`,
	[POPINS.FULLSCREEN.MNEMONIC.Desc]:() => `This phrase is a backup for your password. It is not used to generate keys.`,
	[POPINS.FULLSCREEN.MNEMONIC.SubDesc]:() => `You can paste this phrase into any field that accepts a password in Scatter.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.REMOVE_KEY.Title]:() => `Removing Keys`,
	[POPINS.FULLSCREEN.REMOVE_KEY.Disclaimer]:() => `Removing keys also removes all of its accounts and their application permissions.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.REMOVE_LOCATION.Title]:() => `Removing Location`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.Title]:() => `Unlink Accounts`,
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.Desc]:() => `Removing a linked account also removes all of its application permissions`,
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.SubDesc]:() => `Select all the authorities you want to remove.`,
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.AuthoritiesLabel]:() => `Authorities`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.UNLINK_BLOCKCHAIN.Title]:() => `Unlink Blockchain`,
	[POPINS.FULLSCREEN.UNLINK_BLOCKCHAIN.Disclaimer]:() => `Unlinking a blockchain also removes all of its accounts and their application permissions.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.ConfirmPin]:() => `Confirm PIN`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.REMOVE_APP.Title]:() => `Removing Application`,
	[POPINS.OVERLAY.REMOVE_APP.Desc]:() => `You are about to remove this application from your Scatter. This will also remove all whitelist permissions.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.TRX_SUCCESS.Title]:() => `Transaction Success!`,
	[POPINS.OVERLAY.TRX_SUCCESS.Desc]:x => `Click link below to view on ${x}`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.UPDATE_AVAIL.Title]:() => `Scatter Update Available`,
	[POPINS.OVERLAY.UPDATE_AVAIL.ClickLink]:() => `Click the link below to go to the downloads page`,

};

export default Locale;