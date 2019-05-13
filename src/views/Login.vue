<template>
    <section class="login">


        <section class="entry" v-if="state === STATES.NEW_OR_LOGIN">

            <section class="head">
	            <figure class="logo">Scatter</figure>
            </section>

	        <!-------------------------->
	        <!------ NEW SCATTER ------->
	        <!-------------------------->
            <section class="body">
	            <section v-if="isNewScatter">
		            <LoginButton
				            @click.native="state = STATES.CREATE_NEW"
				            blue="1"
				            title="I'm new to blockchain"
				            description="We'll set you up with a new blockchain account" />
		            <LoginButton
				            @click.native="state = STATES.IMPORT_KEYS"
				            title="I have my own private keys"
				            description="Import your accounts manually" />
	            </section>

	            <!-------------------------->
	            <!---- EXISTING SCATTER ---->
	            <!-------------------------->
	            <section v-if="!isNewScatter">
		            <Input class="welcome-password" :focus="true" big="1"
		                   placeholder="Enter your password"
		                   type="password" :disabled="isLockedOut"
		                   :loader-on-dynamic="working"
		                   :text="password" v-on:enter="unlock" v-on:dynamic="unlock" v-on:changed="x => password = x"
		                   :dynamic-button="isLockedOut ? '' : 'icon-right-open-big'" />

	            </section>
            </section>

	        <section class="tail">
		        <!--<section class="terms">-->
			        <!--Use of Scatter is limited to our <u>Terms of Use</u>.<br>-->
			        <!--Please make sure to also read our <u>Privacy Policy</u>.-->
		        <!--</section>-->
				<section class="actions">
					<section class="action" @click="destroy" v-if="!isNewScatter">
						<Reset class="logo" />
						<figure class="text">Reset</figure>
					</section>
					<section class="action" @click="importBackup" v-if="isNewScatter">
						<Restore class="logo" />
						<figure class="text">Restore</figure>
					</section>
					<section class="action" @click="goToSupport">
						<Support class="logo" />
						<figure class="text">Support</figure>
					</section>
				</section>
	        </section>

        </section>


	    <!-------------------------->
	    <!-- CREATING NEW SCATTER (No keys) -->
	    <!-------------------------->
	    <section class="onboard" v-if="state === STATES.CREATE_NEW">
		    <ProgressBubbles :total="steps" :index="step" />

		    <section class="panel">
			    <Terms v-if="step === 1" v-on:back="stepBack" v-on:next="stepForward" />
			    <SetPassword v-if="step === 2" v-on:back="stepBack" v-on:next="stepForward" />
			    <!--<SelectBackupLocation v-if="step === 3" v-on:back="stepBack" v-on:next="stepForward" />-->
			    <Welcome v-if="step === 3" />
		    </section>

	    </section>


	    <!-------------------------->
	    <!-- CREATING NEW SCATTER (Has keys) -->
	    <!-------------------------->
	    <section class="onboard" v-if="state === STATES.IMPORT_KEYS">
		    <ProgressBubbles :total="steps" :index="step" />

		    <section class="panel">
			    <Terms v-if="step === 1" v-on:back="stepBack" v-on:next="stepForward" />
			    <SetPassword v-if="step === 2" v-on:back="stepBack" v-on:next="importKeypair" />
			    <Welcome v-if="step === 4" />
		    </section>

	    </section>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';

	import ProgressBubbles from "../components/reusable/ProgressBubbles";
	import ActionBar from "../components/reusable/ActionBar";
	import LoginButton from '../components/login/LoginButton'
	import Terms from '../components/login/Terms'
	import SetPassword from '../components/login/SetPassword'
	import SelectBackupLocation from "../components/login/SelectBackupLocation";
	import Welcome from "../components/login/Welcome";
	import PopupService from "../services/utility/PopupService";
	import UpdateService from "../services/utility/UpdateService";
	import {Popup} from "../models/popups/Popup";
	import StoreService from "../services/utility/StoreService";

	import Reset from '../components/svgs/login/Reset';
	import Restore from '../components/svgs/login/Restore';
	import Support from '../components/svgs/login/Support';
	import ElectronHelpers from "../util/ElectronHelpers";

	const STATES = {
		NEW_OR_LOGIN:'newOrLogin',
		CREATE_NEW:'createNew',
		IMPORT_KEYS:'importKeys',
		IMPORT_BACKUP:'importBackup',
	};



	const lockoutTime = 1000*60*5;
	const resetLockout = () => window.localStorage.removeItem('lockout');
	const getLockout = () => JSON.parse(window.localStorage.getItem('lockout') || JSON.stringify({tries:0, stamp:0}));
	const setLockout = () => {
		const lockout = getLockout();
		lockout.tries++;
		lockout.stamp = +new Date();
		return window.localStorage.setItem('lockout', JSON.stringify(lockout));
	};


	export default {
		components:{
			Welcome,
			SelectBackupLocation,
			ActionBar,
			ProgressBubbles,
			LoginButton,
			SetPassword,
			Terms,

			Reset,
			Restore,
			Support,
		},
		data(){return {
			state:STATES.NEW_OR_LOGIN,
			STATES,

			step:1,

			password:'',
		}},
		created(){

		},
		computed:{
			...mapState([
				'scatter',
			]),
			isNewScatter(){
				return !this.scatter;
			},
			steps(){
				switch(this.state){
					case STATES.CREATE_NEW: return 3;
					case STATES.IMPORT_KEYS: return 4;
					case STATES.IMPORT_BACKUP: return 3;
				}
			},
			lockedTimeLeft(){
				return (this.lockedOutTime - this.now)/1000;
			},
			isLockedOut(){
				return this.lockedTimeLeft > 0 && this.lockedOutTime > 0
			}
		},
		methods:{
			stepBack(){
				if(this.step === 1){
					this.state = STATES.NEW_OR_LOGIN;
					return;
				}
				this.step--;
			},
			stepForward(){
				this.step++;
			},

			goToSupport(){
				ElectronHelpers.openLinkInBrowser('https://support.get-scatter.com/');
			},
			importBackup(){
				PopupService.push(Popup.importFullBackup({}, done => {

				}));
			},
			importKeypair(){
				this.stepForward();
				PopupService.push(Popup.importKeypair({forSignup:true}, keypair => {
					this.stepForward();
				}));
			},

			async unlock(usingLocalStorage = false){
				if(!usingLocalStorage){
					const lockout = getLockout();
					if(lockout.tries >= 5 && +new Date() < lockout.stamp + lockoutTime){
						this.lockedOutTime = lockout.stamp + lockoutTime;
						return PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.AUTH.LockedOut), "attention-circled"));
					}
					if(this.working) return;
					StoreService.setWorking(true);
				}
				setTimeout(async () => {
					await this[Actions.SET_SEED](this.password);
					await this[Actions.LOAD_SCATTER](usingLocalStorage);
					if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
						resetLockout();
						this.$router.push({name:this.RouteNames.HOME});
						StoreService.setWorking(false);
					} else {
						if(!usingLocalStorage) return this.unlock(true);
						StoreService.setWorking(false);
						PopupService.push(Popup.snackbarBadPassword());
						setLockout();
					}
				}, 400)
			},
			destroy(){
				PopupService.push(Popup.destroyScatter());
			},


			...mapActions([
				Actions.SET_SEED,
				Actions.LOAD_SCATTER
			])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .login {
        display:flex;
        justify-content: center;
        align-items: center;
        height:$fullheight;

	    .entry {
		    display:flex;
		    flex-direction: column;
		    justify-content: space-between;
		    height:$fullheight;

		    .head {
			    padding:100px 0 0;
			    flex:1;
		    }

		    .body {
			    flex:1;
		    }

		    .tail {
			    flex:1;
		    }

		    .terms {
			    max-width:500px;
			    margin:0 auto;
			    font-size: $small;

			    u {
				    color:$blue;
				    text-decoration: underline;
			    }
		    }

		    .actions {
			    max-width:180px;
			    margin:0 auto;
			    padding:40px 0;
			    display:flex;
			    justify-content: space-between;

			    .action {
				    cursor: pointer;

				    .icon {

				    }

				    .text {
						font-size: $medium;
					    font-weight: bold;
					    color:$blue;
				    }

			    }
		    }
	    }



	    .welcome-password {
		    width:350px;
	    }
    }


    .entry {
        text-align:center;
	    display:flex;
	    flex-direction: column;

        .logo {
            font-size: 64px;
            font-family: 'Grand Hotel', sans-serif;
            color: $blue;
        }
    }

	.onboard {
		width:100%;
		height:$fullheight;

		.panel {
			display:flex;
			flex-direction: column;
			justify-content: center;
			height:calc(100vh - 40px - 250px);
		}
	}



</style>
