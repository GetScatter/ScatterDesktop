<template>
    <section class="wallet">
        <!--<PanelTabs :tabs="tabs" :state="state" v-on:selected="x => state = x" />-->



        <section class="keys-and-accounts">
            <KeysAndAccountList v-on:account="goToAccount" />
        </section>


        <section class="wallet-actions">
            <section class="left">
                <section class="info">
                    <figure class="keys">{{keypairs.length}} keys</figure>
                    <figure class="accounts">{{accounts.length}} accounts</figure>
                </section>
            </section>
            <section class="right">
                <Button blue="1" @click.native="importKeypair" text="Import key" />
                <Button blue="1" text="Generate new key" @click.native="generateKeypair" />
            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import PanelTabs from '../components/reusable/PanelTabs';
    import {Blockchains, blockchainName, BlockchainsArray} from "../models/Blockchains";
    import PopupService from "../services/utility/PopupService";
    import {Popup} from "../models/popups/Popup";
    import ElectronHelpers from "../util/ElectronHelpers";
    import AccountService from "../services/blockchain/AccountService";
    import KeysAndAccountList from "../components/misc/KeysAndAccountList";
    import KeyPairService from "../services/secure/KeyPairService";

    const STATES = {
    	ACCOUNTS:'accounts',
        KEYS:'keys',
    }

    let saveTimeout;
    export default {
    	components:{
		    KeysAndAccountList,
    	    PanelTabs
        },
        data () {return {
        	state:STATES.ACCOUNTS,
	        STATES,

            tab:null,
            blockchainFilter:null,
            keypairFilter:null,
            terms:'',

            clonedKeypairs:[],
            refreshingAccounts:null,
        }},
        computed:{
            ...mapState([
            	'scatter',
            ]),
            ...mapGetters([
            	'keypairs',
            	'accounts',
            ]),
            tabs(){
            	return [
                    {name:'Accounts', state:STATES.ACCOUNTS},
                    {name:'Keys', state:STATES.KEYS},
                ]
            },
        },
	    mounted(){
	    },
        methods:{
	        generateKeypair(){
	            PopupService.push(Popup.generateKeypair({}, keypair => {}));
            },
            importKeypair(){
    		    PopupService.push(Popup.importKeypair({}, keypair => {}));
            },
            goToAccount(account){
    			this.setQuickActionsBack(true);
    			this.$router.push({name:this.RouteNames.ACCOUNT, params:{unique:account.unique()}});
            },
            saveKeypair(keypair){
	        	clearTimeout(saveTimeout);
	            saveTimeout = setTimeout(() => {
		            KeyPairService.updateKeyPair(keypair);
                }, 250);

            }
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .wallet {
        position: relative;
        height:calc(100vh - 180px);
        padding-bottom:50px;


        .keys-and-accounts {
            overflow-y: auto;
            height:calc(100% - 20px);
        }







        .wallet-actions {
            position:absolute;
            bottom:0;
            left:0;
            right:0;
            border-top:1px solid $lightgrey;
            height:70px;
            background:$white;

            display:flex;
            align-items: center;
            padding:0 20px;

            .left { flex:1; }
            .right { flex:0 0 auto; }

            .info {
                .keys {
                    font-size: $medium;
                    font-weight: bold;
                }

                .accounts {
                    font-size: $small;
                }
            }
        }
    }




</style>
