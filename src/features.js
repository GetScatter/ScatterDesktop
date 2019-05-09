const isDev = !process.mainModule;

export default {
	creditCards:true,
    enforcePasswordStrength:!isDev,
}