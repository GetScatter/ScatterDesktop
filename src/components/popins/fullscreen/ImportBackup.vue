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
	import * as Actions from "../../../store/constants";
	import {getFileLocation} from "../../../services/utility/BackupService";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import Mnemonic from "../../../util/Mnemonic";
	import StorageService from "../../../services/utility/StorageService";
	import Scatter from "../../../models/Scatter";
	import Keypair from "../../../models/Keypair";
	import KeyPairService from "../../../services/secure/KeyPairService";
	import AccountService from "../../../services/blockchain/AccountService";
	import {ipcFaF} from "../../../util/ElectronHelpers";
	import LoginButton from "../../login/LoginButton";
	import AES from 'aes-oop';
	import Crypto from "../../../util/Crypto";
	const fs = window.require('fs');

	export default {
		components: {LoginButton},
		props:['popin'],

		data(){return {

		}},

		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			importBackup(){
				const unrestore = () => {
					this.setWorkingScreen(false);
					this.restoringBackup = false;
				}
				if(this.restoringBackup) return;
				this.restoringBackup = true;
				const possibleFile = getFileLocation();
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
						decrypted.toured = true;
						StorageService.setSalt(salt);
						await this[Actions.SET_SEED](password);
						await this[Actions.SET_SCATTER](Scatter.fromJson(decrypted));
						ipcFaF('key', null);
						location.reload();
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
						scatter.toured = true;
						StorageService.setSalt(salt);
						await this[Actions.SET_SEED](password);
						await this[Actions.SET_SCATTER](scatter);
						await Promise.all(keypairs.map(keypair => {
							return AccountService.importAllAccounts(keypair);
						}));
						ipcFaF('key', null);
						location.reload();
					} else {
						unrestore();
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorDecryptingBackup)));
					}
				};
				fs.readFile(file, 'utf-8', (err, data) => {
					const fileExtension = file.split('.')[file.split('.').length-1];
					if(err) {
						unrestore();
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.CantReadBackup)));
					}
					PopupService.push(Popup.verifyPassword(async password => {
						if(!password || !password.length) return unrestore();
						this.setWorkingScreen(true);
						try {
							switch(fileExtension){
								case 'json': return await importDesktopBackup(data, password);
								case 'txt': return await importExtensionBackup(data, password);
							}
						} catch(e){
							console.error('e',e);
							unrestore();
							return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorDecryptingBackup)));
						}
					}, true))
				});
			},

			...mapActions([
				Actions.SET_SEED,
				Actions.SET_SCATTER,
				Actions.RELEASE_POPUP
			])
		}
	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.import-backup {


	}

</style>