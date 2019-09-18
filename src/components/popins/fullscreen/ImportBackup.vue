<template>
	<section class="pop-in import-backup">
		<section>
			<!--<h1>{{locale(langKeys.LOGIN.RESTORE.Title)}}</h1>-->
			<!--<p class="limited-p">{{locale(langKeys.LOGIN.RESTORE.SubTitle)}}</p>-->
			<h2>Import a Scatter Backup</h2>
			<p>
				Scatter backups are <u>.json</u> files that allow you to recover your full Scatter data.
			</p>

			<br>

			<section style="display:flex; justify-content: center;">
				<LoginButton on-white="1" @click.native="importBackup" primary="1" title="Select a backup file" description="These will end with .json or .txt" />
			</section>

			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from "@walletpack/core/store/constants";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import Mnemonic from "@walletpack/core/util/Mnemonic";
	import StorageService from "../../../services/electron/StorageService";
	import Scatter from "@walletpack/core/models/Scatter";
	import Keypair from "@walletpack/core/models/Keypair";
	import KeyPairService from "@walletpack/core/services/secure/KeyPairService";
	import AccountService from "@walletpack/core/services/blockchain/AccountService";
	import LoginButton from "../../login/LoginButton";
	import AES from 'aes-oop';
	import Crypto from "@walletpack/core/util/Crypto";
	import * as UIActions from "../../../store/ui_actions";
	import * as FileService from "../../../services/electron/FileService";
	const {getFileLocation} = require('../../../services/electron/FileService');
	const reload = require('../../../util/ElectronHelpers').default.reload;
	const fs = window.require('fs');
	const {Wallet} = window.require('electron').remote.getGlobal('appShared');

	export default {
		components: {LoginButton},
		props:['popin'],

		data(){return {

		}},

		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[UIActions.RELEASE_POPUP](this.popin);
			},
			importBackup(){
				const unrestore = () => {
					// TODO:
					// this.setWorkingScreen(false);
					this.restoringBackup = false;
				}

				if(this.restoringBackup) return;
				this.restoringBackup = true;

				const possibleFile = getFileLocation(['json', 'txt']);
				if(!possibleFile) return unrestore();
				const file = possibleFile[0];
				if(!file) return unrestore();

				console.log('file', file);



				const importDesktopBackup = async (data, password) => {
					const [obj, salt] = data.split('|SLT|');
					if(!obj || !salt) {
						unrestore();
						return PopupService.push(Popup.snackbar(`Error parsing backup file`));
					}
					const [_, seed] = await Mnemonic.generateMnemonic(password, salt);
					const decrypted = AES.decrypt(obj, seed);
					if(typeof decrypted === 'object' && decrypted.hasOwnProperty('keychain')){
						decrypted.keychain = AES.decrypt(decrypted.keychain, seed);
						decrypted.settings.backupLocation = '';

						await StorageService.setSalt(salt);
						await Wallet.unlock(password, true);
						await Wallet.updateScatter(decrypted);
						reload()
					} else {
						unrestore();
						return PopupService.push(Popup.snackbar(`Error decrypting backup file`));
					}
				};



				const importExtensionBackup = async (data, password) => {
					const [obj, salt] = data.split('|SSLT|');
					if(!obj || !salt) {
						unrestore();
						return PopupService.push(Popup.snackbar(`Error parsing backup file`));
					}
					const [_, seed] = await Mnemonic.generateMnemonic(password, salt);
					const decrypted = AES.decrypt(obj, seed);
					if(typeof decrypted === 'object' && decrypted.hasOwnProperty('keychain')){
						const keypairs = await Promise.all(decrypted.keychain.keypairs
							.map(x => {
								x.privateKey = AES.decrypt(x.privateKey, seed)
								return x;
							})
							.map(async x => {
								const keypair = Keypair.fromJson({
									name:x.name,
									blockchains:[x.blockchain],
									privateKey:Crypto.privateKeyToBuffer(x.privateKey, x.blockchain),
								});
								await KeyPairService.makePublicKeys(keypair);
								return keypair;
							}));
						const scatter = await Scatter.create();
						scatter.keychain.keypairs = keypairs;
						StorageService.setSalt(salt);
						await this[UIActions.SET_SEED](password);
						await this[Actions.SET_SCATTER](scatter);
						await Promise.all(keypairs.map(keypair => {
							return AccountService.importAllAccounts(keypair);
						}));
						reload()
					} else {
						unrestore();
						return PopupService.push(Popup.snackbar(`Error decrypting backup file`));
					}
				};

				FileService.openFile(file).then(data => {
					if(!data){

						unrestore();
						return PopupService.push(Popup.snackbar(`Can't read backup file`));
					}

					PopupService.push(Popup.verifyPassword(async password => {
						console.log('pass?', password);
						if(!password || !password.length) return unrestore();
						// TODO:
						// this.setWorkingScreen(true);
						try {
							const fileExtension = file.split('.')[file.split('.').length-1];
							switch(fileExtension){
								case 'json': return await importDesktopBackup(data, password);
								case 'txt': return await importExtensionBackup(data, password);
							}
						} catch(e){
							console.error('e',e);
							unrestore();
							return PopupService.push(Popup.snackbar(`Error decrypting backup file`));
						}
					}, true))
				})
			},

			...mapActions([
				UIActions.SET_SEED,
				Actions.SET_SCATTER,
				UIActions.RELEASE_POPUP
			])
		}
	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.import-backup {


	}

</style>