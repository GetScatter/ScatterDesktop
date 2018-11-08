import KEYS from '../keys';

export default {

	/****************************************************/
    /*                                                  */
    /*                  LOGIN / AUTH                    */
    /*                                                  */
	/****************************************************/

    [KEYS.LOGIN.NEW.Title]:() =>
        `You must be new here!`,

    [KEYS.LOGIN.NEW.SubTitle]:() =>
        `Just a few easy steps and we'll walk you through them. Let's start with your password.`,

    [KEYS.LOGIN.NEW.PasswordLabel]:() => `Choose a password`,
    [KEYS.LOGIN.NEW.PasswordPlaceholder]:() => `Make sure it's a strong password!`,
    [KEYS.LOGIN.NEW.PasswordConfirmLabel]:() => `Type your password again`,
	[KEYS.LOGIN.NEW.PasswordConfirmPlaceholder]:() => `Twice is nice.`,
	[KEYS.LOGIN.NEW.CreateButton]:() => `Let's go!`,
	[KEYS.LOGIN.NEW.RestoreBackupButton]:() => `I want to restore from a backup`,

    [KEYS.LOGIN.EXISTING.Title]:() =>
        `Welcome Back`,

    [KEYS.LOGIN.EXISTING.SubTitle]:() =>
        `Enter your password to unlock your Scatter.`,

    [KEYS.LOGIN.EXISTING.PasswordPlaceholder]:() => `Password or Backup Phrase`,
	[KEYS.LOGIN.EXISTING.ResetButton]:() => `I need to reset my password`,



}










