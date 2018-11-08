<template>
    <section>
        <transition name="fade" mode="out-in">
            <!-- NEW SCATTER -->
            <section key="new" class="new-scatter" v-if="isNewScatter && !restoringBackup">
                <h1>{{locale(langKeys.LOGIN.NEW.Title)}}</h1>
                <h5>{{locale(langKeys.LOGIN.NEW.SubTitle)}}</h5>
                <OnboardingSvg />

                <section class="inputs">
                    <cin :focus="true"
                         :label="locale(langKeys.LOGIN.NEW.PasswordLabel)"
                         :placeholder="locale(langKeys.LOGIN.NEW.PasswordPlaceholder)"
                         type="password" v-on:enter="create" :text="password"
                         v-on:changed="changed => bind(changed, 'password')"></cin>

                    <section class="password-strength">
                        <figure class="bar" :style="{'width':passwordStrength + '%'}" :class="{'red':passwordStrength < 100}"></figure>
                    </section>

                    <cin :label="locale(langKeys.LOGIN.NEW.PasswordConfirmLabel)"
                         :placeholder="locale(langKeys.LOGIN.NEW.PasswordConfirmPlaceholder)"
                         type="password" v-on:enter="create" :text="confirmPassword"
                         v-on:changed="changed => bind(changed, 'confirmPassword')"></cin>

                    <br>
                    <btn :disabled="working" :loading="working" style="width:300px;" v-on:clicked="create" text="Let's go!" blue="true"></btn>
                    <br><br>
                    <btn :disabled="working" v-on:clicked="restoringBackup = true" text="I want to restore from backup" small="true"></btn>
                </section>
            </section>

            <!-- LOGIN -->
            <section key="existing" class="existing-scatter" v-if="!isNewScatter">
                <section>
                    <figure class="badge">S</figure>
                    <h1>{{locale(langKeys.LOGIN.EXISTING.Title)}}</h1>
                    <p>{{locale(langKeys.LOGIN.EXISTING.SubTitle)}}</p>
                    <br>
                    <br>
                    <cin style="width:350px;" :focus="true" big="1"
                         :placeholder="locale(langKeys.LOGIN.EXISTING.PasswordPlaceholder)"
                         type="password"
                         :loader-on-dynamic="working"
                         :text="password" v-on:enter="unlock" v-on:dynamic="unlock" v-on:changed="changed => bind(changed, 'password')"
                         dynamic-button="icon-right-open-big"
                    ></cin>
                    <section v-if="dPresses >= 10" class="bottom-stuck">
                        <btn :disabled="working" style="width:auto;" v-on:clicked="destroy" :text="locale(langKeys.LOGIN.EXISTING.ResetButton)"></btn>
                    </section>
                </section>
            </section>

            <!-- IMPORT -->
            <section key="import" class="import-scatter" v-if="isNewScatter && restoringBackup">
                <section>
                    <h1>Restore from backup</h1>
                    <p>If you have a backup for your Scatter you can import it here by loading it into Scatter. You will still need the password to unlock it.</p>

                    <img src="../assets/import_backup.png" style="margin:10px 0 20px;" />

                    <btn :disabled="working" :loading="working" style="width:300px;" v-on:clicked="importBackup" text="Choose your Backup" blue="true"></btn>
                    <br>
                    <br>
                    <btn :disabled="working" v-on:clicked="restoringBackup = false" text="I want to start from scratch" small="true"></btn>
                </section>
            </section>
        </transition>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import {RouteNames} from '../vue/Routing'

    import OnboardingSvg from '../components/svgs/Onboarding';

	import SocketService from '../services/SocketService'
	import BackupService, {getFileLocation} from '../services/BackupService'
	import PasswordService from '../services/PasswordService'
	import StorageService from '../services/StorageService'
	import PopupService from "../services/PopupService";
	import {Popup} from '../models/popups/Popup'
	const { remote } = window.require('electron');
	const fs = window.require('fs');


	export default {
		components:{ OnboardingSvg },
		data () {return {
			password:'',
			confirmPassword:'',
            working:false,
            restoringBackup:false,
			dPresses:0,
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
            }
		},
		mounted(){
			this.password = '';
			this.confirmPassword = '';
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
				this.$router.push({name:route});
			},
			async create(){
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
					this.pushTo(RouteNames.ONBOARDING);
                }, 100);
			},
			async unlock(){
				if(this.working) return;
				this.working = true;

				setTimeout(async () => {
					await this[Actions.SET_SEED](this.password);
					await this[Actions.LOAD_SCATTER]();

					if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
						await SocketService.initialize();
						this.pushTo(RouteNames.HOME);
					} else {
						this.working = false;
						PopupService.push(Popup.snackbar("Bad Password", "ban"))
					}
				}, 400)
			},
			importBackup(){
				const file = getFileLocation()[0];
				if(!file) return;

				fs.readFile(file, 'utf-8', (err, data) => {
					if(err) return alert("Could not read the backup file.");

					const [obj, salt] = data.split('|SLT|');
					if(!obj || !salt) return alert("Error parsing backup");

					StorageService.setSalt(salt);
					StorageService.setScatter(obj);
					location.reload();
				});
			},
			quit(){
				remote.app.quit();
			},
			destroy(){
				PopupService.push(Popup.prompt("Destroying Scatter", "This action is irreversible. Are you sure you want to destroy your Scatter?", "trash-o", "Yes", async accepted => {
					if(!accepted) return false;

					await SocketService.close();
					await StorageService.removeScatter();
					this.$router.push('/');
				}, "No"))
			},
			...mapActions([
				Actions.SET_SEED,
				Actions.CREATE_SCATTER,
				Actions.LOAD_SCATTER,
			])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .new-scatter {
        text-align:center;
        width:100%;
        padding:60px 80px;

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
                background:$light-blue;
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
            color:$light-blue;
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
