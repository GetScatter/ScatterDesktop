<template>
    <section>
        <transition name="fade" mode="out-in">
            <!-- NEW SCATTER -->
            <section key="new" class="new-scatter" v-if="isNewScatter && state === STATES.LOGIN_OR_NEW && !restoringBackup">
                <section>
                    <h1>{{locale(langKeys.LOGIN.NEW.Title)}}</h1>
                    <p class="limited-p">{{locale(langKeys.LOGIN.NEW.SubTitle)}}</p>
                    <!--<OnboardingSvg />-->

                    <br>
                    <br>
                    <section class="disclaimer less-pad" v-if="mnemonic">
                        Mnemonic Loaded!

                        <p>Scatter will use the mnemonic you imported instead of generating a new one for you.</p>
                    </section>
                    <br>
                    <section class="inputs">
                        <cin :focus="true"
                             :label="locale(langKeys.LOGIN.NEW.PasswordLabel)"
                             :placeholder="locale(langKeys.LOGIN.NEW.PasswordPlaceholder)"
                             type="password" v-on:enter="create" :text="password"
                             v-on:changed="x => password = x" />

                        <section class="password-strength">
                            <figure class="bar" :style="{'width':passwordStrength + '%'}" :class="{'red':passwordStrength < 100}"></figure>
                        </section>

                        <cin :label="locale(langKeys.LOGIN.NEW.PasswordConfirmLabel)"
                             :placeholder="locale(langKeys.LOGIN.NEW.PasswordConfirmPlaceholder)"
                             type="password" v-on:enter="create" :text="confirmPassword"
                             v-on:changed="x => confirmPassword = x" />

                        <br>
                        <btn :disabled="working" :loading="working" style="width:300px;" v-on:clicked="create" text="Let's go!" blue="true" />
                        <br><br>
                        <btn :disabled="working" v-on:clicked="state = STATES.RESTORE" text="I want to restore from backup" small="true" />
                    </section>
                </section>
            </section>

            <!-- LOGIN -->
            <section key="existing" class="existing-scatter" v-if="!isNewScatter">
                <section>
                    <figure class="badge">S</figure>
                    <h1>{{locale(langKeys.LOGIN.EXISTING.Title)}}</h1>
                    <cin style="width:350px;" :focus="true" big="1"
                         :placeholder="locale(langKeys.LOGIN.EXISTING.PasswordPlaceholder)"
                         type="password" :disabled="isLockedOut"
                         :loader-on-dynamic="working"
                         :text="password" v-on:enter="unlock" v-on:dynamic="unlock" v-on:changed="x => password = x"
                         :dynamic-button="isLockedOut ? '' : 'icon-right-open-big'" />
                    <span class="locked" v-if="isLockedOut">Locked: {{formatTime(lockedTimeLeft)}}</span>
                    <section v-if="dPresses >= 10" class="bottom-stuck">
                        <btn :disabled="working" style="width:auto;" v-on:clicked="destroy" :text="locale(langKeys.LOGIN.EXISTING.ResetButton)" />
                    </section>
                </section>
            </section>

            <!-- IMPORT -->
            <section key="import" class="import-scatter" v-if="isNewScatter && state === STATES.RESTORE">
                <section>
                    <h1>{{locale(langKeys.LOGIN.RESTORE.Title)}}</h1>
                    <p class="limited-p">{{locale(langKeys.LOGIN.RESTORE.SubTitle)}}</p>

                    <br>
                    <img src="../assets/import_backup.png" style="margin:10px 0 20px; width:200px;" />
                    <br>
                    <br>


                    <btn :disabled="working"
                         :loading="working"
                         style="width:300px;"
                         v-on:clicked="importMnemonic"
                         text="Use Phrase"
                         blue="true" />
                    <br>

                    <btn :disabled="working"
                         :loading="working"
                         style="width:300px; margin-top:5px;"
                         v-on:clicked="importBackup"
                         text="Use JSON Backup" />
                    <br>
                    <br>
                    <br>
                    <br>
                    <btn :disabled="working"
                         v-on:clicked="state = STATES.LOGIN_OR_NEW"
                         :text="locale(langKeys.LOGIN.RESTORE.BackButton)"
                         small="true"></btn>
                </section>
            </section>
        </transition>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';

    import OnboardingSvg from '../components/svgs/Onboarding';

	import SocketService from '../services/SocketService'
	import BackupService, {getFileLocation} from '../services/BackupService'
	import PasswordService from '../services/PasswordService'
	import StorageService from '../services/StorageService'
	import PopupService from "../services/PopupService";
	import {Popup} from '../models/popups/Popup'
	import KeyPairService from "../services/KeyPairService";
	import Keypair from "../models/Keypair";
	import Mnemonic from "../util/Mnemonic";
	const fs = window.require('fs');
	import AES from 'aes-oop';
	import Crypto from "../util/Crypto";
	import Scatter from "../models/Scatter";
	import AccountService from "../services/AccountService";
	import UpdateService from "../services/UpdateService";

	const lockoutTime = 1000*60*5;
	const resetLockout = () => window.localStorage.removeItem('lockout');
	const getLockout = () => JSON.parse(window.localStorage.getItem('lockout') || JSON.stringify({tries:0, stamp:0}));
	const setLockout = () => {
		const lockout = getLockout();
		lockout.tries++;
		lockout.stamp = +new Date();
		return window.localStorage.setItem('lockout', JSON.stringify(lockout));
    };


	const STATES = {
        LOGIN_OR_NEW:'loginOrNew',
        RESTORE:'restore',
    }

	export default {
		components:{ OnboardingSvg },
		data () {return {
			state:STATES.LOGIN_OR_NEW,
            STATES,

			password:'',
			confirmPassword:'',
            working:false,
            restoringBackup:false,
			dPresses:0,
            lockedOutTime:0,

            now:0,

            mnemonic:null,
		}},
		computed: {
			...mapState([
				'scatter'
			]),
            hide(){
                return false;
            },
			isNewScatter(){
				return this.scatter === null;
			},
            passwordStrength(){
				const special = "!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?".split('');
				const p = this.password;
				let points = 0;

				const upper = p.split('').filter(x => x === x.toUpperCase()).length;
				points += upper < 5 ? upper : (5 * 2) + (upper-5);

				const specs = p.split('').filter(x => special.includes(x)).length;
				points += specs < 5 ? specs : (5 * 2) + (specs-5);

				points += p.length;

				const good = 60;
				const percentage = points / good > 1 ? 1 : points / good;
				return (percentage*100).toString();
            },
            lockedTimeLeft(){
				return (this.lockedOutTime - this.now)/1000;
            },
            isLockedOut(){
	            return this.lockedTimeLeft > 0 && this.lockedOutTime > 0
            }
		},
		mounted(){
			setInterval(() => {
				this.now = +new Date();
			}, 1000);

			this.password = '';
			this.confirmPassword = '';

			const lockout = getLockout();
			this.lockedOutTime = lockout.tried >= 5 ? lockout.stamp > 0 ? lockout.stamp + lockoutTime : 0 : 0;

			document.addEventListener('keydown', this.modifyDPresses, true);
		},
		destroyed(){
			document.removeEventListener('keydown', this.modifyDPresses, true);
		},
		methods:{
			modifyDPresses(e){
				if(e.which === 68) this.dPresses++;
				else this.dPresses = 0;
			},
			pushTo(route){
				// !! DO NOT REMOVE !!
				// Gathering entropy causes slowdowns,
				// doing this when idle
				// KeyPairService.generateKeyPair(Keypair.placeholder());

				this.$router.push({name:route});
			},
			async create(){
				resetLockout();
				if(this.working) return;
				this.working = true;

				if(!PasswordService.isValidPassword(this.password, this.confirmPassword)) {
					this.working = false;
					return false;
				}

				setTimeout(async () => {
					await this[Actions.CREATE_SCATTER]({password:this.password, mnemonic:this.mnemonic});
					this.password = '';
					this.confirmPassword = '';
					this.openScatter();
                }, 100);
			},
            openScatter(){
				if(!this.scatter.meta.acceptedTerms) return this.pushTo(this.RouteNames.TERMS);
				// if(this.scatter.settings.backupLocation === '') return this.pushTo(this.RouteNames.ONBOARDING);
	            this.pushTo(this.RouteNames.HOME);
            },
			async unlock(){
				const lockout = getLockout();
                if(lockout.tries >= 5 && +new Date() < lockout.stamp + lockoutTime){
                	this.lockedOutTime = lockout.stamp + lockoutTime;
	                return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.LockedOut), "attention-circled"));
                }

                if(this.working) return;
				this.working = true;

				setTimeout(async () => {
					await this[Actions.SET_SEED](this.password);
					await this[Actions.LOAD_SCATTER]();

					if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
						resetLockout();
						await SocketService.initialize();
						UpdateService.needsUpdate();

						this.openScatter();
					} else {
						this.working = false;
						PopupService.push(Popup.snackbarBadPassword());
						setLockout();
					}
				}, 400)
			},
			importMnemonic(){
                PopupService.push(Popup.importMnemonic(async mnemonic => {
                	if(mnemonic.toString().split(' ').length === 24){
                		this.mnemonic = mnemonic;
                		this.state = STATES.LOGIN_OR_NEW;
                    } else {
                		this.mnemonic = null;
                    }
                }))
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


	                    resetLockout();
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
								keypair.hash();
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
						resetLockout();
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
							unrestore();
							return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.ErrorDecryptingBackup)));
                        }
					}, true))


				});
			},
			destroy(){
				PopupService.push(Popup.destroyScatter());
			},
			...mapActions([
				Actions.SET_SEED,
				Actions.CREATE_SCATTER,
				Actions.LOAD_SCATTER,
                Actions.SET_SCATTER,
			])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .limited-p {
        max-width:400px;
        margin:0 auto;
    }

    .new-scatter {
        text-align:center;
        width:100%;
        padding:60px 80px;

        min-height:calc(100vh - 80px);
        display:flex;
        justify-content: center;
        align-items: center;

        .inputs {
            max-width:400px;
            margin:0 auto;
        }

        .password-strength {
            width:100%;
            height:14px;
            line-height: 14px;
            margin-top:-23px;
            margin-bottom:20px;
            border-radius:4px;
            border-top-left-radius:0;
            border-top-right-radius:0;
            overflow: hidden;
            background:#ffffff;
            position: relative;
            border: 1px solid rgba(0, 0, 0, 0.1);
            padding:4px;

            .bar {
                background:$secondary;
                height:4px;
                border-radius:20px;

                transition: all 0.5s ease;
                transition-property: width, background;

                &.red {
                    background:$red;
                }
            }
        }

    }

    .existing-scatter {
        text-align:center;
        width:100%;
        min-height:calc(100vh - 80px);
        padding:60px 80px;
        display:flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: relative;

        .badge {
            font-family: 'Grand Hotel', sans-serif;
            height:120px;
            line-height: 135px;
            padding-right:3px;
            width:120px;
            box-shadow:0 0 30px rgba(0,0,0,0.08), 0 0 20px rgba(0,0,0,0.04);
            border-radius:50%;
            color:$secondary;
            font-size: 88px;
            display:inline-block;
            margin-bottom:50px;
        }

        .bottom-stuck {
            position:absolute;
            bottom:20px;
            left:0;
            right:0;
        }

        .locked {
            font-size: 11px;
            font-weight: bold;
            position: absolute;
            bottom:10px;
            left:0;
            right:0;
        }

    }

    .import-scatter {
        text-align:center;
        width:100%;
        min-height:calc(100vh - 80px);
        padding:60px 80px;
        display:flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: relative;


    }


</style>
