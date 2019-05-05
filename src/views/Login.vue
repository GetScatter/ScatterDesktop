<template>
    <section class="login">


        <section class="entry" v-if="state === STATES.NEW_OR_LOGIN">

            <figure class="logo">Scatter</figure>

	        <!-------------------------->
	        <!------ NEW SCATTER ------->
	        <!-------------------------->
            <section v-if="isNewScatter">
	            <section>
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
            </section>

	        <!-------------------------->
	        <!---- EXISTING SCATTER ---->
	        <!-------------------------->
	        <section v-if="!isNewScatter">
		        <section>
			        <Input style="width:350px;" class="welcome-password" :focus="true" big="1"
			             placeholder="password"
			             type="password" :disabled="isLockedOut"
			             :loader-on-dynamic="working"
			             :text="password" v-on:enter="unlock" v-on:dynamic="unlock" v-on:changed="x => password = x"
			             :dynamic-button="isLockedOut ? '' : 'icon-right-open-big'" />


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
			    <SelectBackupLocation v-if="step === 3" v-on:back="stepBack" v-on:next="stepForward" />
			    <Welcome v-if="step === 4" />
		    </section>

	    </section>


	    <!-------------------------->
	    <!-- CREATING NEW SCATTER (Has keys) -->
	    <!-------------------------->
	    <section class="onboard" v-if="state === STATES.IMPORT_KEYS">
		    <ProgressBubbles :total="steps" :index="step" />

		    <section class="panel">
			    <Terms v-if="step === 1" v-on:back="stepBack" v-on:next="stepForward" />
			    <SetPassword v-if="step === 2" v-on:back="stepBack" v-on:next="stepForward" />
			    <SelectBackupLocation v-if="step === 3" v-on:back="stepBack" v-on:next="stepForward" />
			    <ImportPrivateKey v-if="step === 4" v-on:back="stepBack" v-on:next="stepForward" />
			    <Welcome v-if="step === 5" />
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
	import ImportPrivateKey from '../components/panels/keypair/ImportPrivateKey'
	import SelectBackupLocation from "../components/login/SelectBackupLocation";
	import Welcome from "../components/login/Welcome";
	import PopupService from "../services/utility/PopupService";
	import UpdateService from "../services/utility/UpdateService";
	import {Popup} from "../models/popups/Popup";
	import StoreService from "../services/utility/StoreService";

	const STATES = {
		NEW_OR_LOGIN:'newOrLogin',
		CREATE_NEW:'createNew',
		IMPORT_KEYS:'importKeys',
		IMPORT_BACKUP:'importBackup',
	};

	const STEPS = {
		IMPORT_KEYS:{
			TERMS:1,
			PASSWORD:2,
			IMPORT_KEYPAIR:3,
			START:4
		}
	}



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
			ImportPrivateKey,
			Terms
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
					case STATES.CREATE_NEW: return 5;
					case STATES.IMPORT_KEYS: return 5;
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
