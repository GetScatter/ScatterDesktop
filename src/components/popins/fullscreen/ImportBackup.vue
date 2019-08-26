<template>
	<section class="pop-in import-backup">
		<section>
			<!--<h1>{{locale(langKeys.LOGIN.RESTORE.Title)}}</h1>-->
			<!--<p class="limited-p">{{locale(langKeys.LOGIN.RESTORE.SubTitle)}}</p>-->
			<h2>{{locale(langKeys.LOGIN.RESTORE.Title)}}</h2>
			<p>
				{{locale(langKeys.LOGIN.RESTORE.SubTitle)}}
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
	const {getFileLocation} = require('../../../services/electron/FileService');
	const ipcFaF = require('../../../util/ElectronHelpers').ipcFaF;
	const reload = require('../../../util/ElectronHelpers').default.reload;
	// const fs = window.require('fs');

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
					this.setWorkingScreen(false);
					this.restoringBackup = false;
				}
				if(this.restoringBackup) return;
				this.restoringBackup = true;
				const possibleFile = getFileLocation(['json', 'txt']);
				if(!possibleFile) return unrestore();
				const file = possibleFile[0];
				if(!file) return unrestore();
				const importDesktopBackup = async (data, password) => {
					const [obj, salt] = data.split('|SLT|');
					if(!obj || !salt) {
						unrestore();
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorParsingBackup)));
					}
					const [_, seed] = await Mnemonic.generateMnemonic(password, salt);
					const decrypted = AES.decrypt(obj, seed);
					if(typeof decrypted === 'object' && decrypted.hasOwnProperty('keychain')){
						decrypted.keychain = AES.decrypt(decrypted.keychain, seed);
						decrypted.settings.backupLocation = '';
						StorageService.setSalt(salt);
						await this[UIActions.SET_SEED](password);
						await this[Actions.SET_SCATTER](Scatter.fromJson(decrypted));
						ipcFaF('key', null);
						reload()
					} else {
						unrestore();
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorDecryptingBackup)));
					}
				};
				const importExtensionBackup = async (data, password) => {
					const [obj, salt] = data.split('|SSLT|');
					if(!obj || !salt) {
						unrestore();
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorParsingBackup)));
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
						ipcFaF('key', null);
						reload()
					} else {
						unrestore();
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorDecryptingBackup)));
					}
				};

				// TODO: Fix for both web and desktop
				// fs.readFile(file, 'utf-8', (err, data) => {
				// 	const fileExtension = file.split('.')[file.split('.').length-1];
				// 	if(err) {
				// 		unrestore();
				// 		return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.CantReadBackup)));
				// 	}
				// 	PopupService.push(Popup.verifyPassword(async password => {
				// 		if(!password || !password.length) return unrestore();
				// 		this.setWorkingScreen(true);
				// 		try {
				// 			switch(fileExtension){
				// 				case 'json': return await importDesktopBackup(data, password);
				// 				case 'txt': return await importExtensionBackup(data, password);
				// 			}
				// 		} catch(e){
				// 			console.error('e',e);
				// 			unrestore();
				// 			return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorDecryptingBackup)));
				// 		}
				// 	}, true))
				// });
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