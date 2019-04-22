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
                    <br>
                    <br>
                    <section class="inputs">
                        <cin :focus="true"
                             :label="locale(langKeys.LOGIN.NEW.PasswordLabel)"
                             :placeholder="locale(langKeys.LOGIN.NEW.PasswordPlaceholder)"
                             type="password" v-on:enter="create" :text="password"
                             v-on:changed="x => password = x"></cin>

                        <section class="password-strength">
                            <figure class="bar" :style="{'width':passwordStrength + '%'}" :class="{'red':passwordStrength < 100}"></figure>
                        </section>

                        <cin :label="locale(langKeys.LOGIN.NEW.PasswordConfirmLabel)"
                             :placeholder="locale(langKeys.LOGIN.NEW.PasswordConfirmPlaceholder)"
                             type="password" v-on:enter="create" :text="confirmPassword"
                             v-on:changed="x => confirmPassword = x"></cin>

                        <br>
                        <btn :disabled="working" :loading="working" style="width:300px;" v-on:clicked="create" text="Let's go!" blue="true"></btn>
                        <br><br>
                        <btn :disabled="working" v-on:clicked="state = STATES.RESTORE" text="I want to restore from backup" small="true"></btn>
                    </section>
                </section>
            </section>

            <!-- LOGIN -->
            <section key="existing" class="existing-scatter" v-if="!isNewScatter">
                <section>
                    <svg id="scatter-badge" width="122px" height="122px" viewBox="0 0 122 122" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <linearGradient x1="51.1350182%" y1="-18.359375%" x2="51.1350182%" y2="79.6777344%" id="linearGradient-1">
                                <stop stop-color="#666A82" offset="0%"></stop>
                                <stop stop-color="#50556C" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Artboard" transform="translate(-25.000000, -25.000000)">
                                <circle id="scatter-badge-circle" stroke="#5D6279" stroke-width="3" cx="86" cy="86" r="59"></circle>
                                <path id="scatter-s" d="M83.7567415,118.068293 C81.9655314,118.068293 80.4774715,117.86537 79.2925172,117.459518 C78.1075628,117.053666 77.1706362,116.598839 76.4817093,116.095023 C75.7927823,115.591207 75.3105407,115.10839 75.0349699,114.646559 C74.7593991,114.184727 74.6216158,113.883842 74.6216158,113.743893 C74.6216158,113.240077 74.7318425,112.701282 74.9522991,112.127491 C75.1727557,111.5537 75.4483224,111.021903 75.7790073,110.532081 C76.1096922,110.04226 76.4679289,109.629417 76.853728,109.29354 C77.2395271,108.957662 77.5839854,108.789726 77.8871132,108.789726 C78.2729123,108.789726 78.589814,109.04163 78.8378277,109.545446 L79.2511818,109.965291 C79.4716384,110.189209 79.7816509,110.420122 80.1812285,110.658035 C80.5808061,110.895948 81.0768261,111.112865 81.6693033,111.308794 C82.2617805,111.504722 82.9575862,111.602685 83.7567415,111.602685 C85.4928374,111.602685 86.9120057,111.06389 88.0142888,109.986283 C89.1165719,108.908677 89.6677052,107.446232 89.6677052,105.598907 C89.6677052,104.311377 89.3714711,103.163813 88.7789939,102.156181 C88.1865167,101.148548 87.4080409,100.210905 86.4435432,99.3432216 C85.4790455,98.4755383 84.3767789,97.6288601 83.1367104,96.8031615 C81.8966418,95.9774629 80.6290353,95.11679 79.3338526,94.2211169 C78.0386699,93.3254438 76.7710634,92.3598108 75.5309948,91.3241889 C74.2909263,90.2885669 73.1886597,89.099019 72.224162,87.7555094 C71.2596643,86.4119998 70.4811885,84.8935769 69.8887113,83.200195 C69.2962341,81.5068131 69,79.5685497 69,77.3853467 C69,75.5100312 69.3169016,73.6207492 69.9507144,71.717444 C70.5845272,69.8141387 71.4594513,68.0018275 72.575513,66.2804558 C73.6915747,64.5590842 75.0074054,62.9496958 76.5230447,61.4522424 C78.038684,59.954789 79.6783055,58.6532837 81.4419585,57.5476872 C83.2056115,56.4420908 85.0450189,55.5744206 86.9602358,54.9446504 C88.8754527,54.3148803 90.7975301,54 92.7265256,54 C94.3799503,54 95.8680101,54.2658989 97.1907499,54.7977048 C98.5134896,55.3295107 99.6295346,56.0782262 100.538918,57.0438737 C101.448302,58.0095212 102.150997,59.1710797 102.647024,60.5285842 C103.143051,61.8860887 103.391061,63.4045116 103.391061,65.0838986 C103.391061,66.6793162 103.115495,68.2467206 102.564353,69.7861586 C102.013212,71.3255967 101.28296,72.7810436 100.373576,74.1525429 C99.4641929,75.5240423 98.4377072,76.790561 97.2940884,77.9521369 C96.1504697,79.1137129 94.9793114,80.12133 93.7805785,80.9750184 C92.5818456,81.8287068 91.4175766,82.4934541 90.2877364,82.9692804 C89.1578962,83.4451067 88.1658562,83.6830163 87.3115868,83.6830163 C86.5675457,83.6830163 85.8992966,83.5080828 85.3068194,83.1582105 C84.7143422,82.8083382 84.2183223,82.3745031 83.8187446,81.8566921 C83.419167,81.3388811 83.1091545,80.7930886 82.8886979,80.219298 C82.6682413,79.6455075 82.5580146,79.1347016 82.5580146,78.6868651 C82.5580146,78.3229979 82.6062388,78.0850883 82.7026885,77.9731292 C82.7991383,77.86117 82.9369216,77.8121887 83.1160427,77.8261836 C83.2951637,77.8401784 83.5225061,77.8821625 83.7980769,77.9521369 C84.0736477,78.0221114 84.3905493,78.0570981 84.7487914,78.0570981 C85.9061886,78.0570981 87.1875735,77.6512523 88.5929845,76.8395486 C89.9983955,76.0278449 91.3211154,74.9922385 92.5611839,73.7326983 C93.8012524,72.473158 94.8415165,71.0876846 95.6820074,69.5762363 C96.5224983,68.064788 96.9427374,66.5953465 96.9427374,65.1678675 C96.9427374,63.7123988 96.59139,62.5648349 95.8886845,61.7251415 C95.185979,60.885448 93.9941532,60.4656075 92.3131715,60.4656075 C91.2660025,60.4656075 90.1292901,60.6685304 88.9030001,61.0743823 C87.6767101,61.4802341 86.4435494,62.0470187 85.2034809,62.7747531 C83.9634124,63.5024874 82.7646975,64.3841524 81.6073002,65.4197743 C80.4499029,66.4553963 79.4303063,67.5959628 78.5484798,68.8415082 C77.6666533,70.0870535 76.9570692,71.4305429 76.4197062,72.8720168 C75.8823431,74.3134906 75.6136657,75.8179188 75.6136657,77.3853467 C75.6136657,79.0367439 75.9098998,80.5131828 76.502377,81.8147077 C77.0948542,83.1162326 77.8802191,84.2987832 78.8584954,85.3623949 C79.8367717,86.4260067 80.9459274,87.4056344 82.1859959,88.3013074 C83.4260644,89.1969805 84.693671,90.0856427 85.9888537,90.9673209 C87.2840363,91.8489991 88.5516429,92.7586534 89.7917114,93.6963111 C91.0317799,94.6339688 92.1409357,95.6695753 93.119212,96.8031615 C94.0974882,97.9367477 94.8828532,99.196269 95.4753304,100.581763 C96.0678075,101.967258 96.3640417,103.555654 96.3640417,105.347 C96.3640417,107.082367 96.0402509,108.726742 95.3926595,110.280175 C94.7450682,111.833607 93.8563658,113.184094 92.7265256,114.331675 C91.5966854,115.479256 90.2601871,116.388911 88.7169908,117.060666 C87.1737944,117.73242 85.5203945,118.068293 83.7567415,118.068293 Z" fill="url(#linearGradient-1)"></path>
                            </g>
                        </g>
                    </svg>
                    <h1 id="welcome-title">{{locale(langKeys.LOGIN.EXISTING.Title)}}</h1>
                    <cin style="width:350px;" class="welcome-password" :focus="true" big="1"
                         :placeholder="locale(langKeys.LOGIN.EXISTING.PasswordPlaceholder)"
                         type="password" :disabled="isLockedOut"
                         :loader-on-dynamic="working"
                         :text="password" v-on:enter="unlock" v-on:dynamic="unlock" v-on:changed="x => password = x"
                         :dynamic-button="isLockedOut ? '' : 'icon-right-open-big'"
                    ></cin>
                    <span class="locked" v-if="isLockedOut">Locked: {{formatTime(lockedTimeLeft)}}</span>
                    <section class="bottom-stuck">
                        <btn :disabled="working" style="width:auto;" v-on:clicked="destroy" :text="locale(langKeys.LOGIN.EXISTING.ResetButton)"></btn>
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
                         v-on:clicked="importBackup"
                         :text="locale(langKeys.LOGIN.RESTORE.ChooseButton)"
                         blue="true"></btn>
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
	import {ipcFaF} from "../util/ElectronHelpers";

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
			this.lockedOutTime = lockout.tried >= 10 ? lockout.stamp > 0 ? lockout.stamp + lockoutTime : 0 : 0;

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
					await this[Actions.CREATE_SCATTER](this.password);
					this.password = '';
					this.confirmPassword = '';
					this.openScatter();
                }, 100);
			},
            openScatter(){
				if(!this.scatter.meta.acceptedTerms) return this.pushTo(this.RouteNames.TERMS);
				if(this.scatter.settings.backupLocation === '') return this.pushTo(this.RouteNames.ONBOARDING);
	            this.pushTo(this.RouteNames.HOME);
            },
			async unlock(usingLocalStorage = false){
				if(!usingLocalStorage){
					const lockout = getLockout();
					if(lockout.tries >= 5 && +new Date() < lockout.stamp + lockoutTime){
						this.lockedOutTime = lockout.stamp + lockoutTime;
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.LockedOut), "attention-circled"));
					}

					if(this.working) return;
					this.working = true;
				}


				setTimeout(async () => {
					await this[Actions.SET_SEED](this.password);
					await this[Actions.LOAD_SCATTER](usingLocalStorage);

					if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
						resetLockout();
						await SocketService.initialize();
						UpdateService.needsUpdate();

						this.openScatter();
					} else {
						if(!usingLocalStorage){
							return this.unlock(true);
						}

						this.working = false;
						PopupService.push(Popup.snackbarBadPassword());
						setLockout();
					}
				}, 400)
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

    #scatter-badge {
        margin-bottom:20px;

        #scatter-badge-circle {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: dash 1.24s ease-out forwards;
            animation-delay:1s;
        }

        #scatter-s {
            opacity:0;
            animation: FadeInS .44s ease-out forwards;
            animation-delay:1.24s;
        }
    }

    #welcome-title {
        opacity:0;
        animation: FadeInWelcome .44s ease-out forwards;
        animation-delay:1.54s;
    }

    .welcome-password {
        opacity:0;
        animation: FadeInWelcome .44s ease-out forwards;
        animation-delay:1.75s;
    }

    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes FadeInS {
      0% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }

    @keyframes FadeInWelcome {
      0% {
        opacity: 0;
        top:-20px;
      }

      100% {
        opacity: 1;
        top:0;
      }
    }

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
