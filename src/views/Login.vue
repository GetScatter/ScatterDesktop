<template>
    <section class="login">



        <section class="entry" v-if="state === STATES.NEW_OR_LOGIN" :class="{'success':success}">
	        <figure class="login-bg">
		        <img src="../assets/login_bg.png" />
	        </figure>
	        <section class="meteors">
		        <section class="rotator">
			        <figure class="shooting_star" v-for="i in new Array(20).keys()"></figure>
		        </section>
	        </section>

            <section class="head">
	            <section class="details">
		            <figure class="logo scatter-logologo"></figure>
		            <figure class="version">meteoric</figure>
	            </section>
            </section>

	        <!-------------------------->
	        <!------ NEW SCATTER ------->
	        <!-------------------------->
            <section class="body">
	            <section v-if="isNewScatter">
		            <LoginButton
				            @click.native="state = STATES.CREATE_NEW"
				            primary="1"
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
		            <Input class="welcome-password" :focus="true" big="1" for-login="1"
		                   placeholder="Enter your password"
		                   type="password" :disabled="opening || isLockedOut"
		                   :loader-on-dynamic="opening && !success"
		                   :text="password" v-on:enter="unlock" v-on:dynamic="unlock" v-on:changed="x => password = x"
		                   :dynamic-button="badPassword ? 'icon-cancel' : success ? 'icon-check' : isLockedOut ? '' : 'icon-right-open-big'" :hide-dynamic-button="!password.length" />

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

	import SpaceBackground from '../components/backgrounds/SpaceBackground';
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
			SpaceBackground,
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

			opening:false,
			success:false,
			badPassword:false,
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
					if(this.opening) return;
					this.opening = true;
				}
				setTimeout(async () => {
					await this[Actions.SET_SEED](this.password);
					await this[Actions.LOAD_SCATTER](usingLocalStorage);
					if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
						resetLockout();
						setTimeout(() => {
							if(!this.scatter.onboarded){
								PopupService.push(Popup.showTerms(async accepted => {
									if(!accepted){
										await this[Actions.SET_SEED](null);
										await this[Actions.LOAD_SCATTER](false);
										this.opening = false;
										return;
									}

									const clone = this.scatter.clone();
									clone.onboarded = true;
									await this[Actions.SET_SCATTER](clone);

									this.success = true;
									this.$router.push({name:this.RouteNames.HOME});
								}))
							} else {
								this.success = true;
								this.$router.push({name:this.RouteNames.HOME});
							}
						}, 1000);
					} else {
						if(!usingLocalStorage) return this.unlock(true);
						this.opening = false;
						this.badPassword = true;
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
				Actions.LOAD_SCATTER,
				Actions.SET_SCATTER,
			])
		},
		watch:{
			['password'](){
				this.badPassword = false;
			}
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
	    position: relative;

	    .login-bg {
		    position:absolute;
		    top:0;
		    bottom:0;
		    left:0;
		    right:0;
		    overflow: hidden;
		    border-left:1px solid $darkerblue;
		    border-right:1px solid $darkerblue;
		    display:flex;
		    align-items: center;
		    justify-content: center;

		    img {
			    display:block;
			    width:1920px;
			    height:100%;
		    }

		    animation: fadein 0.5s ease forwards;
	    }

	    .meteors {
		    position:absolute;
		    top:0;
		    bottom:0;
		    left:0;
		    right:0;
		    display:flex;
		    justify-content: center;
		    align-items: center;
		    overflow: hidden;

		    .rotator {
			    position:absolute;
			    top:0;
			    bottom:0;
			    left:0;
			    right:0;
			    transform: rotateZ(145deg);
		    }
	    }

	    .entry {
		    display:flex;
		    flex-direction: column;
		    justify-content: center;
		    align-items: center;
		    height:$fullheight;
		    width:100%;
		    position: relative;
		    z-index:1;
		    overflow:hidden;
		    opacity:1;

		    transition: all 0.5s ease;
		    transition-property: opacity;
		    transition-delay: 0.5s;

		    .head {
			    display:flex;
			    align-items: flex-end;
			    flex:1;

			    .details {
				    text-align: center;

				    .logo {
					    font-size: 82px;
					    line-height: 82px;
					    font-family: 'Grand Hotel', sans-serif;
					    text-shadow:0 0 90px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.2), 0 3px 7px rgba(0,0,0,0.2);
					    color: $white;
					    transform:translateY(-1000px);
					    animation: inFromTop 0.8s ease forwards;
					    animation-delay: 0.4s;
				    }

				    .version {
					    font-size: 11px;
					    font-weight: bold;
					    color:$white;
					    text-transform: uppercase;
					    letter-spacing: 20px;
					    margin-right:-20px;
					    opacity:0.9;
					    text-shadow:0 0 2px $black;
					    transform:translateY(-1000px);
					    animation: inFromTop 0.5s ease forwards;
					    animation-delay: 0.2s;
				    }
			    }
		    }

		    .body {
			    padding:50px 0;
			    opacity:0;
			    animation: fadein 0.5s ease forwards;
			    animation-delay: 0.2s;
		    }

		    .tail {
			    display:flex;
			    align-items: flex-start;
			    flex:1;
			    animation: inFromBottom 0.6s ease forwards;
			    animation-delay: 0.6s;
			    transform:translateY(1000px);
		    }

		    &.success {
			    opacity:0;
		    }

		    .terms {
			    max-width:500px;
			    margin:0 auto;
			    font-size: $small;

			    u {
				    color:$white;
				    text-decoration: underline;
			    }
		    }

		    .actions {
			    margin:0 auto;
			    display:flex;
			    justify-content: space-between;

			    .action {
				    cursor: pointer;
				    padding:0 40px;
				    text-align:center;

				    transition: all 0.1s ease;
				    transition-property: transform;

				    .icon {


				    }

				    svg {
					    fill:$white;
					    stroke:$white;
				    }

				    .text {
						font-size: $medium;
					    font-weight: bold;
					    color:$white;
				    }

				    &:hover {
					    transform:scale(1.4);
				    }

			    }
		    }
	    }



	    .welcome-password {
		    width:450px;
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
