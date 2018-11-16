import KEYS from '../keys';
const {
	LOGIN,
	DASHBOARD,
	ADD_KEYS,
	KEYPAIR,
	IDENTITY,
	CREATE_EOS,
	PERMISSIONS,
	TRANSFER
} = KEYS;

// You can build your own pluralizers.
// This one for instance is for words that end with "s" when
// pluralized.
// See [DASHBOARD.APPS.NPermissions] for example usage
const plural_s = (n) => n !== 0 ? 's' : '';

const Locale = {

	/****************************************************/
	/*                                                  */
	/*                  LOGIN / AUTH                    */
	/*                                                  */
	/****************************************************/

	[LOGIN.NEW.Title]:() => `You must be new here!`,
	[LOGIN.NEW.SubTitle]:() =>
		`Just a few easy steps and we'll walk you through them. Let's start with your password.`,
	[LOGIN.NEW.PasswordLabel]:() => `Choose a password`,
	[LOGIN.NEW.PasswordPlaceholder]:() => `Make sure it's a strong password!`,
	[LOGIN.NEW.PasswordConfirmLabel]:() => `Type your password again`,
	[LOGIN.NEW.PasswordConfirmPlaceholder]:() => `Twice is nice`,
	[LOGIN.NEW.CreateButton]:() => `Let's go!`,
	[LOGIN.NEW.RestoreBackupButton]:() => `I want to restore from a backup`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.EXISTING.Title]:() => `Welcome back`,
	[LOGIN.EXISTING.SubTitle]:() => `Enter your password to unlock your Scatter.`,
	[LOGIN.EXISTING.PasswordPlaceholder]:() => `Password or backup phrase`,
	[LOGIN.EXISTING.ResetButton]:() => `I need to reset my password`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.RESTORE.Title]:() => `Restore from backup`,
	[LOGIN.RESTORE.SubTitle]:() =>
		`If you have a backup for your Scatter you can import it here by loading it into Scatter. 
        You will still need the password to unlock it.`,
	[LOGIN.RESTORE.ChooseButton]:() => `Choose your backup`,
	[LOGIN.RESTORE.BackButton]:() => `I want to start from scratch`,




	/****************************************************/
	/*                                                  */
	/*                    DASHBOARD                     */
	/*                                                  */
	/****************************************************/

	[DASHBOARD.KEYS.SearchPlaceholder]:() => `Search Wallets`,
	[DASHBOARD.KEYS.AddKeysButton]:() => `Add Keys`,
	[DASHBOARD.KEYS.NoKeys]:() => `Well, what are you waiting for?`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[DASHBOARD.TOOLBARS.SendButton]:() => `Send`,
	[DASHBOARD.TOOLBARS.ReceiveButton]:() => `Receive`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[DASHBOARD.APPS.SearchPlaceholder]:() => `Search Apps`,
	[DASHBOARD.APPS.NoAppsTitle]:() => `No apps connected`,
	[DASHBOARD.APPS.NoAppsDescription]:() =>
		`Apps are at the heart of what makes Scatter awesome. 
		You can explore apps and connect to them below.`,
	[DASHBOARD.APPS.ExploreAppsButton]:() => `Explore apps`,
	[DASHBOARD.APPS.EditApp]:() => `Edit Permissions`,
	[DASHBOARD.APPS.DeleteApp]:() => `Delete`,
	[DASHBOARD.APPS.LinkPermissionOnly]:() => `Link permission only`,
	[DASHBOARD.APPS.NPermissions]:n => `${n} Permission${plural_s(n)}`,





	/****************************************************/
	/*                                                  */
	/*                     ADD KEYS                     */
	/*                                                  */
	/****************************************************/

	[ADD_KEYS.SELECT.CreateTitle]:() => `Create a new key`,
	[ADD_KEYS.SELECT.CreateDescription]:() =>
		`If you want to create a new set of keys that you can use on any blockchain. 
		The keys will not have any funds on them, they are brand new.`,
	[ADD_KEYS.SELECT.CreateButton]:() => `Create a key`,
	[ADD_KEYS.SELECT.ImportTitle]:() => `Import an existing key`,
	[ADD_KEYS.SELECT.ImportDescription]:() => `If you already have a key and want to import it into Scatter`,
	[ADD_KEYS.SELECT.ImportButton]:() => `Import a key`,
	[ADD_KEYS.SELECT.CreateEosTitle]:() => `Create a new EOS account`,
	[ADD_KEYS.SELECT.CreateEosDescription]:() => `We'll quickly generate two keys for you`,
	[ADD_KEYS.SELECT.CreateEosButton]:() => `EOS account`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT.NameLabel]:() => `Wallet Name`,
	[ADD_KEYS.IMPORT.NamePlaceholder]:() => `Give this wallet a name to remember.`,
	[ADD_KEYS.IMPORT.TextTitle]:() => `Import private key as text`,
	[ADD_KEYS.IMPORT.TextDescription]:() => `If you would like to type in or paste in your private key`,
	[ADD_KEYS.IMPORT.TextButton]:() => `Text`,
	[ADD_KEYS.IMPORT.HardwareTitle]:() => `Import from a hardware wallet`,
	[ADD_KEYS.IMPORT.HardwareDescription]:() => `If you have a supported hardware wallet`,
	[ADD_KEYS.IMPORT.HardwareButton]:() => `Hardware`,
	[ADD_KEYS.IMPORT.QrTitle]:() => `Import private key from a QR code`,
	[ADD_KEYS.IMPORT.QrDescription]:() => `If you have an encrypted paper wallet QR code`,
	[ADD_KEYS.IMPORT.QrButton]:() => `QR`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT_TEXT.KeyLabel]:() => `Enter a private key`,
	[ADD_KEYS.IMPORT_TEXT.KeyPlaceholder]:() => `Make sure to enter it correctly`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.EOS_KEYS.DisclaimerTitle]:() =>
		`You must copy and save both these keys somewhere outside Scatter to continue!`,
	[ADD_KEYS.EOS_KEYS.DisclaimerSubtitle]:() =>
		`If you delete a key from Scatter which you don't have saved elsewhere, you will not be able to recover it.`,
	[ADD_KEYS.EOS_KEYS.OwnerDescription]:() =>
		`This is your master key which has total control over your account. 
		Do not keep it in Scatter unless you absolutely need it`,
	[ADD_KEYS.EOS_KEYS.ActiveDescription]:() =>
		`This is the key you will use with applications. It is what you want to keep imported into Scatter.`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountTitle]:() => `Use these keys to create an EOS account.`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountDescription]:() =>
		`You can not instantly use EOS with just keys, you need to create an account with them.`,
	[ADD_KEYS.EOS_KEYS.CopyButton]:() => `Copy keys`,
	[ADD_KEYS.EOS_KEYS.DeleteButton]:() => `Delete`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountButton]:() => `Create account`,


	/****************************************************/
	/*                                                  */
	/*               CREATE EOS ACCOUNT                 */
	/*                                                  */
	/****************************************************/
	[CREATE_EOS.DisclaimerTitle]:() => `Accounts on the EOS blockchain must be paid for to be able to be used.`,
	[CREATE_EOS.DisclaimerSubtitle]:() => `Once you have another account you will be able to create accounts without an exchange.`,
	[CREATE_EOS.AccountNameLabel]:() => `Account Name`,
	[CREATE_EOS.AccountNamePlaceholder]:() => `account name`,
	[CREATE_EOS.AccountNameLengthError]:() => `Account name must be 12 characters long.`,
	[CREATE_EOS.AccountNameFormattingError]:() => `Account name must be lowercase letters only.`,
	[CREATE_EOS.SelectCreatorError]:() => `Please select an account creator first.`,
	[CREATE_EOS.CheckingNameAlert]:() => `Checking if name is available...`,
	[CREATE_EOS.NameTakenAlert]:() => `This name is already taken.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.ACCOUNT.AccountsLabel]:() => `This account will be used to create the account`,
	[CREATE_EOS.ACCOUNT.RamCostLabel]:() => `Mandatory RAM cost`,
	[CREATE_EOS.ACCOUNT.ResourcesLabel]:() => `CPU and NET`,
	[CREATE_EOS.ACCOUNT.ResourcesLowError]:(amount) => `You must allocate at least ${amount}`,
	[CREATE_EOS.ACCOUNT.TotalLabel]:() => `Total`,
	[CREATE_EOS.ACCOUNT.ActionBarButton]:() => `Create account`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.EXCHANGE.CopyButton]:() => `Copy`,
	[CREATE_EOS.EXCHANGE.MinimumAmountLabel]:() => `Minimum amount you need to send from an exchange`,
	[CREATE_EOS.EXCHANGE.WithdrawAccountLabel]:() => `Account to withdraw to`,
	[CREATE_EOS.EXCHANGE.MemoLabel]:() => `Memo`,
	[CREATE_EOS.EXCHANGE.ActionBarButton]:() => `Create`,




	/****************************************************/
	/*                                                  */
	/*                 WALLET / KEYPAIR                 */
	/*                                                  */
	/****************************************************/
	[KEYPAIR.NameLabel]:() => Locale[ADD_KEYS.IMPORT.NameLabel](),
	[KEYPAIR.NamePlaceholder]:() => Locale[ADD_KEYS.IMPORT.NamePlaceholder](),
	[KEYPAIR.ExportButton]:() => `Export`,
	[KEYPAIR.RefreshButton]:() => `Refresh`,
	[KEYPAIR.RemoveButton]:() => `Remove`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.ACCOUNTS.SearchPlaceholder]:() => `Search accounts`,
	[KEYPAIR.ACCOUNTS.ViewTokens]:n => `${n} Token${plural_s(n)}`,
	[KEYPAIR.ACCOUNTS.EOSManageResourceButton]:() => `Manage`,
	[KEYPAIR.ACCOUNTS.EOSClaimRefundButton]:() => `Refund`,
	[KEYPAIR.ACCOUNTS.AddAccountLabel]:() => `Manually add account`,
	[KEYPAIR.ACCOUNTS.AddAccountDescription]:() =>
		`Sometimes you need to manually add EOSIO accounts if there are network issues. 
		You can add them by entering the account name.`,
	[KEYPAIR.ACCOUNTS.AddAccountButton]:() => `Add`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.BLOCKCHAINS.CopyButton]:() => `Copy public key`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.SELECT.KeyTitle]:() => `Key`,
	[KEYPAIR.EXPORT.SELECT.KeyDescription]:() => `Export this private key as text`,
	[KEYPAIR.EXPORT.SELECT.QrTitle]:() => `Paper Wallet`,
	[KEYPAIR.EXPORT.SELECT.QrDescription]:() => `Export this private key as an encrypted QR code`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.KEY.Title]:() => `Private key as text`,
	[KEYPAIR.EXPORT.KEY.CopyButton]:() => `Copy`,
	[KEYPAIR.EXPORT.KEY.RevealButton]:() => `Reveal`,
	[KEYPAIR.EXPORT.KEY.HideButton]:() => `Hide`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.QR.Title]:() => `QR code paper wallet`,
	[KEYPAIR.EXPORT.QR.SaveButton]:() => `Save as nmage`,




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
	[IDENTITY.NameLabel]:() => `Identity name / Username`,
	[IDENTITY.NamePlaceholder]:() => `Your online presence`,
	[IDENTITY.NameError]:() => `The Identity Name name can not be empty, have any spaces in it, or special characters.`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.PERSONAL.NameLabel]:() => `Full name`,
	[IDENTITY.PERSONAL.NamePlaceholder]:() => `Enter your full name`,
	[IDENTITY.PERSONAL.DateOfBirthLabel]:() => `Date of birth`,
	[IDENTITY.PERSONAL.EmailLabel]:() => `Email`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.LOCATION.DisclaimerTitle]:() => `You can create multiple locations.`,
	[IDENTITY.LOCATION.DisclaimerSubtitle]:() => `For instance "Home" and "Work". You will be able to select which one to use when you need it.`,
	[IDENTITY.LOCATION.SelectorLabel]:() => `Locations`,
	[IDENTITY.LOCATION.SelectorAddButton]:() => `Add`,
	[IDENTITY.LOCATION.NameLabel]:() => `Location name`,
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
	[PERMISSIONS.LoginPermission]:() => `Login permission`,
	[PERMISSIONS.AccountsLabel]:() => `Accounts provided`,
	[PERMISSIONS.RequiredFieldsLabel]:() => `Required fields`,
	[PERMISSIONS.MutableFieldsLabel]:() => `Mutable fields`,
	[PERMISSIONS.RemoveLabel]:() => `Remove Permission`,
	[PERMISSIONS.RemoveIdentityText]:() =>
		`Login permissions are what allow applications to interact with your Scatter.
        You can force a log-out from an application by removing this permission.`,
	[PERMISSIONS.RemoveWhitelistLabel]:() =>
		`Action whitelists make it so you don't have to keep accepting popups to sign transactions.
        Do you want to remove this whitelist?`,
	[PERMISSIONS.RemoveButton]:() => `Remove`,
	[PERMISSIONS.RemoveAllButton]:() => `Remove all permissions`,
	[PERMISSIONS.ActionWhitelist]:() => `Action whitelist`,

	/****************************************************/
	/*                                                  */
	/*                   TRANSFER                       */
	/*                                                  */
	/****************************************************/
	[TRANSFER.Send]:() => `Send`,
	[TRANSFER.SendingAmount]:() => `Sending amount`,
	[TRANSFER.SelectWhichAccount]:() => `Select which account`,
	[TRANSFER.YourAccounts]:() => `Your accounts`,
	[TRANSFER.Amount]:() => `Amount`,
	[TRANSFER.Recipient]:() => `Recipient`,
	[TRANSFER.Quantity]:() => `Quantity`,
	[TRANSFER.Token]:() => `Token`,
	[TRANSFER.Memo]:() => `Memo`,
	[TRANSFER.SendToContact]:() => `Send to contact`,
	[TRANSFER.SendDirectly]:() => `Send directly`,
	[TRANSFER.Contacts]:() => `Contacts`,



	// [ADD_KEYS.IMPORT.QrButton]:() => ``,

}

export default Locale;