<template>
    <section>
        <back-bar v-on:back="back" :buttons="state === STATES.DASHBOARD ? buttons : []"></back-bar>
        <section v-if="keypair">
            <KeypairDashboard key="dashboard" v-if="state === STATES.DASHBOARD" :keypair="keypair" />
            <KeypairExport key="export" v-if="state === STATES.EXPORT" :keypair="keypair" />
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    import KeypairDashboard from '../components/panels/keypair/KeypairDashboard';
    import KeypairExport from '../components/panels/keypair/existing/KeypairExport';

    import KeyPairService from "../services/KeyPairService";
    import PopupService from "../services/PopupService";
    import {Popup} from "../models/popups/Popup";
    import PriceService from "../services/PriceService";
    import AccountService from "../services/AccountService";
    import ResourceService from "../services/ResourceService";
    import PasswordService from "../services/PasswordService";

    const STATES = {
    	DASHBOARD:'dash',
        EXPORT:'export'
    }

    export default {
        data () {return {
        	state:STATES.DASHBOARD,
	        STATES,

        	buttons:[],
	        keypair:null,
            destroying:false,
        }},

        components:{
	        KeypairDashboard,
	        KeypairExport
        },

	    mounted(){
		    this[Actions.SET_RESOURCES]([]);
		    this.keypair = this.keypairs.find(x => x.id === this.$route.params.id);
		    if(!this.keypair) this.$router.push({name:RouteNames.HOME});

		    const locale = this.locale;
		    const {KEYPAIR} = this.langKeys;

		    this.buttons = [
			    {text:locale(KEYPAIR.ExportButton), clicked:this.enableExportKey},
			    {text:locale(KEYPAIR.RefreshButton), clicked:this.refreshAccounts, process:this.keypair.unique()},
			    {text:locale(KEYPAIR.RemoveButton), clicked:this.remove, process:this.keypair.unique()},
		    ];

		    this.lazyLoadResources();
	    },

        destroyed(){
        	this.destroying = true;
            this[Actions.SET_RESOURCES]([]);
        },

        computed:{
            ...mapState([
                'scatter',
                'resources',
            ]),
            ...mapGetters([
                'keypairs',
                'accounts',
            ]),
        },

        methods:{
	        back(){
	        	if(this.state !== STATES.DASHBOARD) return this.state = STATES.DASHBOARD;
	            this.$router.push({name:RouteNames.HOME});
            },
	        async lazyLoadResources(){
		        const accounts = this.keypair.accounts(true)
                    .filter(x => ResourceService.usesResources(x));

		        for(let i = 0; i < accounts.length; i++){
		        	if(this.destroying) return;
			        const resources = await ResourceService.getResourcesFor(accounts[i]);
			        this[Actions.ADD_RESOURCES]({acc:accounts[i].identifiable(), res:resources});
		        }
	        },



            async remove(){
	            PopupService.promptGuard(Popup.prompt(
		            "Deleting Vault Entry", "Before you do this make sure you have a backup of this Vault Entry's Private Key.",
		            "trash", "Delete"
	            ), async accepted => {
		            if(accepted) {
			            await KeyPairService.removeKeyPair(this.keypair);
			            PriceService.getBalances();
			            this.$router.push({name:RouteNames.HOME});
		            }
	            });
            },

	        async refreshAccounts(){
		        await AccountService.importAllAccounts(this.keypair);
	        },


	        enableExportKey(){
	        	return this.state = STATES.EXPORT;
		        PopupService.push(Popup.textPrompt("Confirm Password", "Enter your current password.", "unlock", "Okay", {
			        placeholder:this.locale(this.langKeys.LOGIN.EXISTING.PasswordPlaceholder),
			        type:'password'
		        }, async password => {
			        if(!password || !password.length) return;
			        if(!await PasswordService.verifyPassword(password)){
				        // this.close();
				        // this.$router.push('/');
				        return PopupService.push(Popup.prompt("Bad Password", "The password you entered was incorrect.", "attention", "Okay"));
			        }

			        this.state = STATES.EXPORT;
		        }))
	        },


            ...mapActions([
            	Actions.SET_RESOURCES,
            	Actions.ADD_RESOURCES
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

</style>
