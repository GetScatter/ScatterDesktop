const {dialog} = require('electron');
const {getDefaultPath, saveFile, openFile, existsOrMkdir, exists} = require('./files');
const createHash = require('create-hash');
const {GET} = require('./embedapi');
const path = require('path');


const HOST = process.env.WEB_HOST;
let ETAGS = {};

const hash = x => createHash('sha256').update(x).digest('hex')

const applyETAG = async (filename, tag) => {
	ETAGS[filename] = tag;
	existsOrMkdir(getDefaultPath());
	await saveFile(getDefaultPath(), 'etags.json', JSON.stringify(ETAGS));
	return true;
}

const getSource = (filename, method = "GET") => {
	console.log('getting source', filename);
	return fetch(`${HOST}/${filename}`, {method, cache:"no-cache"}).then(async x => {
		return {etag:x.headers.get('etag'), file:await x.text()};
	}).catch(err => {
		console.error('source error', err);
		return null;
	});
};

const ERR_TITLE = 'Scatter Embed Check Failure';
const WEB_APP_ERR = `Your desktop client could not make a connection with our web wallet embed, so it can't verify that it is safe to use. If you are in a country which restricts IPs such as China or Russia, you may need to enable a proxy.`;
const API_ERR = `Scatter failed to make a connection with our API which is used to verify the hash of the web wallet embed. If you are in a country which restricts IPs such as China or Russia, you may need to enable a proxy.`
const HASH_ERR = `The hash created from the web wallet embed does not match the hash returned from our secure API. This could be due to an update happening right now. Please try again in a moment. If this problem persists please contact support immediately at support@get-scatter.com, or on Telegram on the @Scatter channel, or Twitter at @Get_Scatter.`


const saveSource = (filename, file) => {
	const sourcePath = path.join(getDefaultPath(), 'cached_sources');
	console.log('saving source to', sourcePath);
	existsOrMkdir(sourcePath);
	return saveFile(sourcePath, filename, file);
};








class WebHashChecker {

	static async check(window){
		const isTesting = process.env.WEB_HOST.indexOf('http://localhost:') === 0;

		// Don't do checks when running on localhost
		// if(process.env.WEB_HOST.indexOf('http://localhost:') === 0) return true;


		const hashes = await GET(`hashes`).catch(() => null);
		if(!hashes) return dialog.showErrorBox(ERR_TITLE, API_ERR);
		const filesList = Object.keys(hashes);

		const etagsFile = await openFile(path.join(getDefaultPath(), 'etags.json')).catch(() => null);
		if(etagsFile) ETAGS = JSON.parse(etagsFile);

		let error;

		const checkFileHash = async (filename) => {
			if(error) return false;
			const result = await getSource(filename).catch(() => null);
			if(!result || !result.file.length) return error = WEB_APP_ERR;

			if(isTesting || hash(result.file) === hashes[filename]){
				await applyETAG(filename, result.etag);

				// Applying absolute URLs to relative static assets
				result.file = result.file.replace(/static\//g, "https://embed.get-scatter.com/static/");
				result.file = result.file.replace(/static\//g, "https://embed.get-scatter.com/static/");

				// Saving the source locally.
				saveSource(filename, result.file);
				return true;
			}


			return false;
		};

		const checkEtag = async (filename) => {
			if(error) return false;
			if(ETAGS.hasOwnProperty(filename) && ETAGS[filename]){
				const result = await getSource(filename, "HEAD").catch(() => null);
				if(!result) return error = WEB_APP_ERR;
				return result.etag === ETAGS[filename];
			}
			return false;
		};

		const checkFile = async filename => {
			if(error) return false;
			if(await checkEtag(filename) && exists(path.join(getDefaultPath(), 'cached_sources', filename))) return true;
			else return await checkFileHash(filename);
		};

		let verified = 0;
		await Promise.all(filesList.map(async filename => {

			if(!await checkFile(filename)) {
				return error = HASH_ERR;
			} else {
				verified++;

				const hashstat = {hash:hash(filename), verified, total:filesList.length};
				if(window) window.webContents.send('hashstat', hashstat);
				else console.log('hashstat', hashstat);
			}
		}));

		if(error) return dialog.showErrorBox(ERR_TITLE, error);
		return verified === filesList.length;
	}

}

module.exports = WebHashChecker;
