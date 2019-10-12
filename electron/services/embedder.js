const {dialog} = require('electron');
const {getFilesForDirectory, getDefaultPath, saveFile, openFile, existsOrMkdir, exists} = require('./files');
const createHash = require('create-hash');
const {POST} = require('@walletpack/core/services/apis/BackendApiService');
const path = require('path');
const ecc = require('eosjs-ecc');


const HOST = process.env.WEB_HOST;
const PROOF_KEYS = process.env.PROOF_KEYS.split(',');
let ETAGS = {};

const hash = x => createHash('sha256').update(x).digest('hex')

const cacheETAG = async (filename, tag) => {
	ETAGS[filename] = tag;
	existsOrMkdir(getDefaultPath());
	await saveFile(getDefaultPath(), 'etags.json', JSON.stringify(ETAGS));
	return true;
}

const getSource = (filename, method = "GET") => {
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


const checkSignature = (hashed, signed) => {
	let proven = false;
	for(let i = 0; i < PROOF_KEYS.length; i++){
		try {
			if(ecc.recoverHash(signed, hashed) === PROOF_KEYS[i]) {
				proven = true;
				break;
			}
		} catch(e){}
	}
	return proven;
}





class WebHashChecker {

	// Checks if the user has a timestamp file locally at all,
	// which is always the last file that is cached.
	static async hasLocalVersion(){
		return openFile(path.join(getDefaultPath(), 'cached_sources', 'embed.timestamp')).then(x => !!x).catch(() => null)
	}

	// Checks if a version is available using a timestamp file which matches when the
	// server had it's code updated.
	static async versionAvailable(){
		const localTimestamp = await openFile(path.join(getDefaultPath(), 'cached_sources', 'embed.timestamp')).catch(() => null);
		if(!localTimestamp) return true;
		const serverTimestamp = await getSource(`hashes/embed.timestamp`).then(x => x.file.trim()).catch(() => null);
		if(!serverTimestamp) return true;
		return localTimestamp.trim() !== serverTimestamp.trim();
	}

	// Hashes and signatures are fetched on a round-robin basis, so each hash+sig for a file is gotten
	// from a different server than the one the file was fetched from.
	static async fileVerified(filename, file){

		const hashsig = await getSource(`hashes/${filename}.hash`).then(x => x.file.trim()).catch(() => null);
		if(!hashsig) return false;

		const [hashed, signed] = hashsig.split('|').map(x => x.trim());
		return hash(file) === hashed && checkSignature(hashed, signed);
	}

	static async checkCachedHashes(window){
		const filesList = await getFilesForDirectory(path.join(getDefaultPath(), 'cached_sources')).then(x => x.filter(f => f !== 'embed.timestamp'));
		if(!filesList) return dialog.showErrorBox(ERR_TITLE, API_ERR);

		let verified = 0;
		await Promise.all(filesList.map(async filename => {


			let file = await openFile(path.join(getDefaultPath(), 'cached_sources', filename)).catch(() => null);
			if(!file) return console.log('missing file', filename, file);

			// We need to revert the static absolute path overwrites for this to verify hashes properly.
			file = file.replace(/https:\/\/embed.get-scatter.com\/static\//g, "static/");

			if(await this.fileVerified(filename, file)) verified++;

			const hashstat = {hash:hash(filename), verified, total:filesList.length};
			if(window) window.webContents.send('hashstat', hashstat);
			else console.log('hashstat', hashstat);

			return true;
		}));

		return verified === filesList.length;

	}

	static async cacheEmbedFiles(window){
		if(process.env.LOCAL_TESTING) return true;


		// Simply gets a list of files that need verification.
		// If this list is spoofed, Scatter simply won't run as it will be missing files.
		// And in the case of adding files to the list, those files will never be executed
		// as there would be nothing to execute them since normal files are hash verified.
		const filesList = await fetch(`${HOST}/hashes/`).then(x => x.json()).then(x =>
			x.map(y => y.name.replace('.hash', ''))
				.filter(x => x !== 'embed.timestamp')
		).catch(() => null);
		if(!filesList) return dialog.showErrorBox(ERR_TITLE, API_ERR);

		const etagsFile = await openFile(path.join(getDefaultPath(), 'etags.json')).catch(() => null);
		if(etagsFile) ETAGS = JSON.parse(etagsFile);

		let error;

		const checkFileHash = async (filename) => {
			if(error) return false;


			// Sources are fetched on a round-robin basis, so each file is gotten
			// from a different server, making the attack surface as large as our server count.
			const result = await getSource(filename).catch(() => null);
			if(!result || !result.file.length) return error = WEB_APP_ERR;

			if(this.fileVerified(filename, result.file)){
				await cacheETAG(filename, result.etag);

				// Applying absolute URLs to relative static assets.
				// Note: These files won't be available if Embed is down, however they are all purely aesthetic.
				// This saves the user from download another 3+mb of data which will be static anyway.
				result.file = result.file.replace(/static\//g, "https://embed.get-scatter.com/static/");

				// Saving the source locally for quicker use and fallback for later hash verification failures.
				// This makes it so the user's local Scatter can never "not work" just because the online Embed is down.
				saveSource(filename, result.file);

				return true;
			} else error = API_ERR;

			// Alerts about bad hashes are sent to a completely separate API which runs under different
			// security measures and is detached from the entire Embed system.
			await POST(`bad_hash`, {
				filename,
				fileHash:hash(result.file),
			}).catch(err => {
				console.error('bad hash error', err);
			});

			return false;
		};

		// If an ETAG already exists on the user's local machine then
		// Scatter won't try to refresh the Embed file.
		// This is completely safe to rely on since even if a malicious server spoofs the ETAG
		// Scatter will simply not download their malicious version of the file as it will
		// use the one locally stored on the user's machine and not the one with the spoofed
		// ETAG.
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

			if(!await checkFile(filename)) return error = HASH_ERR;
			else {
				verified++;

				const hashstat = {hash:hash(filename), verified, total:filesList.length};
				if(window) window.webContents.send('hashstat', hashstat);
				else console.log('hashstat', hashstat);
			}
		}));

		if(error) return dialog.showErrorBox(ERR_TITLE, error);

		if(verified === filesList.length){
			// Lack of a timestamp doesn't mean no validation occurred.
			await getSource(`hashes/embed.timestamp`).then(x => {
				saveSource('embed.timestamp', x.file.trim());
			}).catch(() => null);

			return true;
		}

		return false;
	}

}

module.exports = WebHashChecker;
