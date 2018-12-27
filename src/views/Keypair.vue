<template>
    <section>
        <back-bar v-on:back="back" :buttons="state === STATES.DASHBOARD ? buttons : []"></back-bar>
        <section v-if="keypair">
            <KeypairDashboard v-if="state === STATES.DASHBOARD"
                              :keypair="keypair"
                              v-on:createeos="createEosAccount" />

            <KeypairExport v-if="state === STATES.EXPORT" :keypair="keypair" />
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import KeypairDashboard from '../components/panels/keypair/KeypairDashboard';
    import KeypairExport from '../components/panels/keypair/existing/KeypairExport';

    import KeyPairService from "../services/KeyPairService";
    import PopupService from "../services/PopupService";
    import {Popup} from "../models/popups/Popup";
    import PriceService from "../services/PriceService";
    import AccountService from "../services/AccountService";
    import ResourceService from "../services/ResourceService";
    import PasswordService from "../services/PasswordService";
    import BalanceService from "../services/BalanceService";
    import Process from "../models/Process";
    import {Blockchains} from "../models/Blockchains";

    const STATES = {
    	DASHBOARD:'dash',
        EXPORT:'export',
        TOKENS:'tokens',
    }

    export default {
        data () {return {
        	state:STATES.DASHBOARD,
	        STATES,

        	buttons:[],
	        keypair:null,
        }},

        components:{
	        KeypairDashboard,
	        KeypairExport,
        },

        computed:{
            ...mapState([
                'scatter',
                'resources',
                'newKey',
            ]),
            ...mapGetters([
                'keypairs',
                'accounts',
            ]),

	        eosKey(){
            	if(!this.keypair) return;
		        const publicKey = this.keypair.publicKeys.find(x => x.blockchain === Blockchains.EOSIO);
		        if(!publicKey) return;
		        return publicKey.key;
	        }
        },

	    mounted(){
		    this.keypair = this.keypairs.find(x => x.id === this.$route.params.id).clone();

		    if(this.newKey){
			    this[Actions.NEW_KEY](false);
			    this.state = STATES.EXPORT;
		    }

		    if(!this.keypair) this.$router.push({name:this.RouteNames.HOME});

		    const locale = this.locale;
		    const {GENERIC} = this.langKeys;

		    this.buttons = [
			    {text:locale(GENERIC.Export), clicked:this.enableExportKey},
			    {text:locale(GENERIC.Refresh), clicked:this.refreshAccounts, process:this.keypair.unique()},
			    {text:locale(GENERIC.Remove), clicked:this.remove, process:this.keypair.unique()},
		    ];

		    this.lazyLoadResources();
	    },

        methods:{
	        back(){
	        	if(this.state !== STATES.DASHBOARD) return this.state = STATES.DASHBOARD;
	            this.$router.push({name:this.RouteNames.HOME});
            },
	        async lazyLoadResources(){
	        	const processKey = `resources:${this.keypair.unique()}`;
		        if(Process.isProcessRunning(processKey)) return;

		        const accounts = this.keypair.accounts(true)
                    .filter(x => ResourceService.usesResources(x));


		        if(accounts.length){

		        	let process;

		        	// We're only going to show a process for the first time, as it becomes annoying
                    // to see if every time you go into a wallet.
			        const alreadyHasResources = this.resources[accounts[0].identifiable()];
			        if(!alreadyHasResources) process = Process.loadResources(processKey);

			        for(let i = 0; i < accounts.length; i++){
			        	if(process){
					        process.updateProgress(90 / accounts.length);
					        process.setSubTitle(this.locale(this.langKeys.PROCESSES.AccountsLeft, accounts.length - i));
                        }

				        const resources = await ResourceService.getResourcesFor(accounts[i]);
				        this[Actions.ADD_RESOURCES]({acc:accounts[i].identifiable(), res:resources});
			        }

			        if(process) process.updateProgress(100);
                }

	        },



            async remove(){
	        	PopupService.push(Popup.removeKeypair(this.keypair));
            },

	        async refreshAccounts(){
		        await AccountService.importAllAccounts(this.keypair);
		        await Promise.all(this.keypair.accounts(true).map(account => {
		        	return BalanceService.loadBalancesFor(account);
                }))
		        this[Actions.SET_RESOURCES]({});
		        this.lazyLoadResources();
	        },


	        enableExportKey(){
	        	PopupService.push(Popup.verifyPassword(verified => {
	        		if(!verified) return;
	        		this.state = STATES.EXPORT;
                }))
	        },


            createEosAccount(){
	            PopupService.push(Popup.eosCreateAccount(
		            this.eosKey,
		            this.eosKey,
	            	this.keypair.id,
                    this.keypair.id,
                    true
                ))
            },


            ...mapActions([
            	Actions.SET_RESOURCES,
            	Actions.ADD_RESOURCES,
	            Actions.NEW_KEY
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

</style>
