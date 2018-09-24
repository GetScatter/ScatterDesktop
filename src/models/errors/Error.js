import * as ErrorTypes from './ErrorTypes'

export const ErrorCodes = {
    NO_SIGNATURE:402,
    FORBIDDEN:403,
    TIMED_OUT:408,
    LOCKED:423,
    UPGRADE_REQUIRED:426,
    TOO_MANY_REQUESTS:429
};

export default class Error {

    constructor(_type, _message, _code = ErrorCodes.LOCKED){
        this.type = _type;
        this.message = _message;
        this.code = _code;
        this.isError = true;
    }

    static locked(){
        return new Error(ErrorTypes.LOCKED, "The user's Scatter is locked. They have been notified and should unlock before continuing.")
    }

    static promptClosedWithoutAction(){
        return new Error(ErrorTypes.PROMPT_CLOSED, "The user closed the prompt without any action.", ErrorCodes.TIMED_OUT)
    }

    static maliciousEvent(){
        return new Error(ErrorTypes.MALICIOUS, "Malicious event discarded.", ErrorCodes.FORBIDDEN)
    }

    static signatureError(_type, _message){
        return new Error(_type, _message, ErrorCodes.NO_SIGNATURE)
    }

    static requiresUpgrade(){
        return new Error(ErrorTypes.UPGRADE_REQUIRED, "The required version is newer than the User's Scatter", ErrorCodes.UPGRADE_REQUIRED)
    }

    static identityMissing(){
        return this.signatureError("identity_missing", "Identity no longer exists on the user's keychain");
    }

    static badNetwork(){
        return this.signatureError("bad_network", "The network you provided is malformed.");
    }

    static noKeypair(){
        return this.signatureError("no_keypair", "The public key you provided does not exist on the user's keychain.");
    }

    static signatureAccountMissing(){
        return this.signatureError("account_missing", "You are trying to sign a request with an account that isn't currently linked or doesn't exist in the user's Scatter");
    }

    static malformedRequiredFields(){
        return this.signatureError("malformed_requirements", "The requiredFields you passed in were malformed");
    }

    static noNetwork(){
        return this.signatureError("no_network", "This user does not have this network in their Scatter.");
    }

    static usedKeyProvider(){
        return new Error(
            ErrorTypes.MALICIOUS,
            "Do not use a `keyProvider` with a Scatter. Use a `signProvider` and return only signatures to this object. A malicious person could retrieve your keys otherwise.",
            ErrorCodes.NO_SIGNATURE
        )
    }

}