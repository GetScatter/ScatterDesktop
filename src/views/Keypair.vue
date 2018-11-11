<template>
    <section>
        <back-bar v-on:back="back" :buttons="state === STATES.DASHBOARD ? buttons : []"></back-bar>
        <section v-if="keypair">

            <transition name="slide-left" mode="out-in">
                <KeypairDashboard key="dashboard" v-if="state === STATES.DASHBOARD" :keypair="keypair" />
                <KeypairExport key="export" v-if="state === STATES.EXPORT" :keypair="keypair" />
            </transition>


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
        }},

        components:{
	        KeypairDashboard,
	        KeypairExport
        },

	    mounted(){
		    this[Actions.SET_RESOURCES]([]);
		    this.keypair = this.keypairs.find(x => x.id === this.$route.params.id);
		    if(!this.keypair) this.$router.push({name:RouteNames.HOME});

		    this.buttons = [
			    {text:'Export', clicked:() => this.state = STATES.EXPORT},
			    {text:'Refresh', clicked:this.refreshAccounts, process:this.keypair.unique()},
			    {text:'Remove', clicked:this.remove, process:this.keypair.unique()},
		    ];

		    this.lazyLoadResources();
	    },

        destroyed(){
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

            async lazyLoadResources(){
	            const accounts = this.keypair.accounts()
		            .reduce((acc, account) => {
			            if(!acc.find(x => account.network().unique() === x.network().unique()
				            && account.sendable() === x.sendable())) acc.push(account);
			            return acc;
		            }, []).filter(x => ResourceService.usesResources(x));

	            for(let i = 0; i < accounts.length; i++){
		            const resources = await ResourceService.getResourcesFor(accounts[i]);
		            this[Actions.ADD_RESOURCES]({acc:accounts[i].identifiable(), res:resources});
                }
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
