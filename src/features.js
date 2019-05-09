const isDev = !process.mainModule;

export default {
	creditCards:true,
    enforceStrongPasswords:!isDev,
}