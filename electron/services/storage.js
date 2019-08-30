const Store = require('electron-store');
const {saveFile} = require('./files')

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

const electron = require('electron');
console.log('electron', electron);
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

const isPopup = typeof location === 'undefined' ? false : location.hash.indexOf('popout') > -1;


const getScatter = () => scatterStorage().get('scatter');
const setScatter = (scatter) => {
	if(isPopup) return;
	return new Promise(async resolve => {
		clearSaveTimeouts();
		saveResolvers.push(resolve);
		safeSetScatter(scatter, resolve);
	})
}

const removeScatter = () => {
	if(isPopup) return;
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
	console.log('getting salt')
	return scatterStorage().get('salt') || 'SALT_ME';
}
const setSalt = (salt) => scatterStorage().set('salt', salt);


module.exports = {
	getScatter,
	setScatter,
	removeScatter,
	getSalt,
	setSalt,
}