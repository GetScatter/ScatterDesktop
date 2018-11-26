<template>
    <section>
        <back-bar v-on:back="back" :buttons="state === STATES.DASHBOARD ? buttons : []"></back-bar>
        <section v-if="keypair">
            <KeypairDashboard v-if="state === STATES.DASHBOARD"
                              :keypair="keypair"
                              v-on:tokens="x => tokenAccount = x"
                              v-on:createeos="createEosAccount" />

            <KeypairExport v-if="state === STATES.EXPORT" :keypair="keypair" />
            <KeypairTokens v-if="state === STATES.TOKENS" :account="tokenAccount" />
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import KeypairDashboard from '../components/panels/keypair/KeypairDashboard';
    import KeypairExport from '../components/panels/keypair/existing/KeypairExport';
    import KeypairTokens from '../components/panels/keypair/existing/KeypairTokens';

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

	        tokenAccount:null,
        }},

        components:{
	        KeypairDashboard,
	        KeypairExport,
	        KeypairTokens,
        },

	    mounted(){
		    this.keypair = this.keypairs.find(x => x.id === this.$route.params.id);
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

        computed:{
            ...mapState([
                'scatter',
                'resources',
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

        methods:{
	        back(){
	        	if(this.tokenAccount) return this.tokenAccount = null;
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
			        const alreadyHasResources = this.resources.find(x => x.acc === accounts[0].identifiable());
			        if(!alreadyHasResources) process = Process.loadResources(processKey);

			        for(let i = 0; i < accounts.length; i++){
			        	if(process){
					        process.updateProgress(90 / accounts.length);
					        process.setSubTitle(`Accounts left: ${accounts.length - i}`);
                        }

				        const resources = await ResourceService.getResourcesFor(accounts[i]);
				        this[Actions.ADD_RESOURCES]({acc:accounts[i].identifiable(), res:resources});
			        }

			        if(process) process.updateProgress(100);
                }

	        },



            async remove(){
	        	PopupService.push(Popup.removeKeypair(this.keypair));
	            // PopupService.promptGuard(Popup.prompt(
		        //     "Deleting Vault Entry", "Before you do this make sure you have a backup of this Vault Entry's Private Key.",
		        //     "trash", "Delete"
	            // ), async accepted => {
		        //     if(accepted) {
			    //         await KeyPairService.removeKeyPair(this.keypair);
			    //         await BalanceService.removeStaleBalances();
			    //         this.$router.push({name:this.RouteNames.HOME});
		        //     }
	            // });
            },

	        async refreshAccounts(){
		        await AccountService.importAllAccounts(this.keypair);
		        await Promise.all(this.keypair.accounts(true).map(account => {
		        	return BalanceService.loadBalancesFor(account);
                }))
		        this[Actions.SET_RESOURCES]([]);
		        this.lazyLoadResources();
	        },


	        enableExportKey(){
	        	//TODO: Remove to require password authentication!!
	        	// return this.state = STATES.EXPORT;
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
            	Actions.ADD_RESOURCES
            ])
        },

        watch:{
            ['tokenAccount'](){
                if(this.tokenAccount) this.state = STATES.TOKENS;
                else this.state = STATES.DASHBOARD;
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

</style>
