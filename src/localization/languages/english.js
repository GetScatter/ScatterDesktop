import KEYS from '../keys';
const {
	LOGIN,
	DASHBOARD,
	ADD_KEYS,
	KEYPAIR
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
	[LOGIN.NEW.PasswordConfirmPlaceholder]:() => `Twice is nice.`,
	[LOGIN.NEW.CreateButton]:() => `Let's go!`,
	[LOGIN.NEW.RestoreBackupButton]:() => `I want to restore from a backup`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.EXISTING.Title]:() => `Welcome Back`,
	[LOGIN.EXISTING.SubTitle]:() => `Enter your password to unlock your Scatter.`,
	[LOGIN.EXISTING.PasswordPlaceholder]:() => `Password or Backup Phrase`,
	[LOGIN.EXISTING.ResetButton]:() => `I need to reset my password`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.RESTORE.Title]:() => `Restore from backup`,
	[LOGIN.RESTORE.SubTitle]:() =>
		`If you have a backup for your Scatter you can import it here by loading it into Scatter. 
        You will still need the password to unlock it.`,
	[LOGIN.RESTORE.ChooseButton]:() => `Choose your Backup`,
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
	[DASHBOARD.APPS.ExploreAppsButton]:() => `Explore Apps`,
	[DASHBOARD.APPS.EditApp]:() => `Edit`,
	[DASHBOARD.APPS.DeleteApp]:() => `Delete`,
	[DASHBOARD.APPS.LinkPermissionOnly]:() => `Link permission only`,
	[DASHBOARD.APPS.NPermissions]:n => `${n} Permission${plural_s(n)}`,





	/****************************************************/
	/*                                                  */
	/*                     ADD KEYS                     */
	/*                                                  */
	/****************************************************/

	[ADD_KEYS.SELECT.CreateTitle]:() => `Create a new key`,
	[ADD_KEYS.SELECT.CreateDescription]:() => `We'll create a set of keys that you can use on any blockchain.`,
	[ADD_KEYS.SELECT.CreateButton]:() => `Create a Key`,
	[ADD_KEYS.SELECT.ImportTitle]:() => `Import an existing key`,
	[ADD_KEYS.SELECT.ImportDescription]:() => `If you already have a key and want to import it into Scatter`,
	[ADD_KEYS.SELECT.ImportButton]:() => `Import a Key`,
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
	[ADD_KEYS.IMPORT_TEXT.KeyLabel]:() => `Enter a Private Key`,
	[ADD_KEYS.IMPORT_TEXT.KeyPlaceholder]:() => `Make sure to enter it correctly`,




	/****************************************************/
	/*                                                  */
	/*                 WALLET / KEYPAIR                 */
	/*                                                  */
	/****************************************************/
	[KEYPAIR.NameLabel]:() => Locale[ADD_KEYS.IMPORT.NameLabel](),
	[KEYPAIR.NamePlaceholder]:() => Locale[ADD_KEYS.IMPORT.NamePlaceholder](),
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.ACCOUNTS.SearchPlaceholder]:() => `Search Accounts`,
	[KEYPAIR.ACCOUNTS.ViewTokens]:n => `${n} Token${plural_s(n)}`,
	[KEYPAIR.ACCOUNTS.EOSManageResourceButton]:() => `Manage`,
	[KEYPAIR.ACCOUNTS.EOSClaimRefundButton]:() => `Refund`,

	// [ADD_KEYS.IMPORT.QrButton]:() => ``,

}

export default Locale;