import KEYS from './keys';
import ObjectHelpers from '../util/ObjectHelpers'
// import {store} from '../store/store'

let store;
const getStore = () => {
	if(!store) store = require('../store/store').store;
	return store;
}


/*************************************/
/*          Add imports here         */
/*************************************/

import tester from './languages/tester';
import english from './languages/english';


/*************************************/
/*         Add languages here        */
/*************************************/

export const LANG = {
    // TESTER: 'Tester',
    ENGLISH: 'English',
};

const languages = {
    // [LANG.TESTER]:tester,
    [LANG.ENGLISH]:english,
};

/*************************************/







export const createLocales = () => {
    return Object.keys(LANG).reduce((langobj, lang) => {
        langobj[LANG[lang]] = ObjectHelpers.flattenObject(KEYS).reduce((keyobj, key) => {
            keyobj[key] = languages[LANG[lang]][key];
            return keyobj;
        }, {});
	    return langobj;
    }, {});
};

let locs;
const locales = () => {
    if(!locs) locs = createLocales();
    return locs;
}

export const localized = (key, args, language) => {
    if(!language) language = LANG.ENGLISH;
    let locale = locales()[language];
    if(!locale || (language !== 'Tester' && !locale.hasOwnProperty(key))) locale = locales()[LANG.ENGLISH];
    if(!locale.hasOwnProperty(key) || typeof locale[key] !== 'function') {
        return 'NO TRANSLATION';
    }
    return locale[key](args);
};

export const localizedState = (key, args) => {
    return localized(key, args, getStore().getters.language);
}
