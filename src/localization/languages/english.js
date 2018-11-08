import KEYS from '../keys';
const {LOGIN} = KEYS;

export default {

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


}