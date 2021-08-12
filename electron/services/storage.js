const Store = require('electron-store');

const ABIS_NAME = 'abi';
const HISTORIES_NAME = 'histories';
const TRANSLATION_NAME = 'translation';
const SCATTER_DATA_NAME = 'scatter';
const SCATTER_INTERMED_NAME = 'scatter_intermed';

const stores = {};
const getStore = name => {
	if(!stores.hasOwnProperty(name))
		stores[name] = new Store({name});

	return stores[name];
};

const scatterStorage = () => getStore(SCATTER_DATA_NAME);
const historyStorage = () => getStore(HISTORIES_NAME);
const translationStorage = () => getStore(TRANSLATION_NAME);
const scatterIntermedStorage = () => getStore(SCATTER_INTERMED_NAME);
const abiStorage = () => getStore(ABIS_NAME);
const generalSettings = () => getStore('general_settings');

const electron = require('electron');
const {app} = electron;
const fs = require('fs');



let saveResolvers = [];
let saveTimeouts = [];
const clearSaveTimeouts = () => {
	saveResolvers.map(x => x(true));
	saveTimeouts.map(x => clearTimeout(x));
	saveTimeouts = [];
};

const safeSetScatter = async (scatter, resolver) => {
	const path = name => `${app.getPath('userData')}/${name}.json`;
	const retry = () => saveTimeouts.push(setTimeout(() => safeSetScatter(scatter, resolver), 50));

	const salt = await getSalt();
	await scatterIntermedStorage().set('scatter', scatter);
	await scatterIntermedStorage().set('salt', salt);
	const savedScatter = await scatterIntermedStorage().get('scatter');

	// Didn't save properly
	if(scatter !== savedScatter) retry();

	// Saved properly, overwriting old data with new data
	else fs.rename(path(SCATTER_INTERMED_NAME), path(SCATTER_DATA_NAME), (err) => {
		if(err) return retry();
		resolver(true);
	});
};

const getGeneralSetting = (key) => {
	const saved = generalSettings().get(key);
	if(saved === undefined) return null;
	return saved;
}
const setGeneralSetting = (key, val) => generalSettings().set(key, val);

const getLanguage = () => {
	const saved = generalSettings().get('language');
	if(saved === undefined) return null;
	return saved;
}
const setLanguage = lang => generalSettings().set('language', lang);

const getSimpleMode = () => {
	const saved = generalSettings().get('simple_mode');
	if(saved === undefined){
		return process.env.SIMPLE_BY_DEFAULT || false;
	}
	return saved;
};

const setSimpleMode = isSimpleMode => generalSettings().set('simple_mode', isSimpleMode);

const getScatter = () => scatterStorage().get('scatter');
const setScatter = (scatter) => {
	return new Promise(async resolve => {
		clearSaveTimeouts();
		saveResolvers.push(resolve);
		safeSetScatter(scatter, resolve);
	})
}

const removeScatter = () => {
	scatterStorage().clear();
	abiStorage().clear();
	historyStorage().clear();
	translationStorage().clear();
	// StoreService.get().commit(Actions.SET_SCATTER, null);
	// window.localStorage.removeItem('scatter');
	// ipcFaF('key', null);
	return true;
}

const getSalt = () => {
	return scatterStorage().get('salt') || 'SALT_ME';
}
const setSalt = (salt) => scatterStorage().set('salt', salt);







/***********************************/
/**            EXTRAS             **/
/***********************************/

let getSeed;
const getSeedSetter = (seeder) => getSeed = seeder;

const AES = require("aes-oop").default;

const cacheABI = (contractName, chainId, abi) =>{
	return abiStorage().set(`abis.${contractName}_${chainId}`, abi);
}

const getCachedABI = (contractName, chainId) => {
	return abiStorage().get(`abis.${contractName}_${chainId}`);
}

const getTranslation = async () => {
	let translation = translationStorage().get('translation');
	if(!translation) return null;
	return AES.decrypt(translation, getSeed());
}

const setTranslation =  async (translation) => {
	const encrypted = AES.encrypt(translation, getSeed());
	return translationStorage().set('translation', encrypted);
}

const getHistory = async () => {
	let history = historyStorage().get('history');
	if(!history) return [];
	history = AES.decrypt(history, getSeed());
	return history;
}

const updateHistory = async (x) => {
	let history = await getHistory();
	if(history.find(h => h.id === x.id)) history = history.filter(h => h.id !== x.id);
	history.unshift(x);
	const encrypted = AES.encrypt(history, getSeed());
	return historyStorage().set('history', encrypted);
}

const deltaHistory = async (x) => {
	let history = await getHistory();
	if(x === null) history = [];
	else {
		if(history.find(h => h.id === x.id)) history = history.filter(h => h.id !== x.id);
		else history.unshift(x);
	}

	const encrypted = AES.encrypt(history, getSeed());
	return historyStorage().set('history', encrypted);
}

const swapHistory = async (history) => {
	const encrypted = AES.encrypt(history, getSeed());
	return historyStorage().set('history', encrypted);
}




const reencryptOptionals = async (oldseed, newseed) => {
	if(translationStorage().get('translation')){
		translationStorage().set('translation',
			AES.encrypt(AES.decrypt(translationStorage().get('translation'), oldseed), newseed));
	}

	if(historyStorage().get('history')){
		historyStorage().set('history',
			AES.encrypt(AES.decrypt(historyStorage().get('history'), oldseed), newseed));
	}

}







module.exports = {
	getGeneralSetting,
	setGeneralSetting,
	getSimpleMode,
	setSimpleMode,
	getLanguage,
	setLanguage,

	getScatter,
	setScatter,
	removeScatter,
	getSalt,
	setSalt,

	getSeedSetter,
	getSeed,

	// EXTRAS
	cacheABI,
	getCachedABI,
	getTranslation,
	setTranslation,
	getHistory,
	updateHistory,
	deltaHistory,
	swapHistory,
	reencryptOptionals,
}
