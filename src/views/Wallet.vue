<template>
    <section>
        <PanelTabs v-if="features.creditCards" :tabs="tabs" :state="state" v-on:selected="x => state = x" />
        <section class="wallet" :class="{'no-panels':!features.creditCards}">

            <section class="scroller">
                <KeysAndAccountList v-on:account="goToAccount" v-if="state === STATES.KEYS && keypairs.length" />

                <section class="keys-and-accounts-list" v-if="state === STATES.KEYS && !keypairs.length">
                    <section class="no-keypairs">
                        <section class="container">
                            <figure class="title">You don't have any Keys</figure>
                            <figure class="description">Click one of the buttons below to import a key you already have, or generate a brand new one.</figure>
                        </section>
                    </section>
                </section>


                <CreditCardsList v-if="features.creditCards && state === STATES.CARDS" />
            </section>


            <section class="wallet-actions" v-if="state === STATES.KEYS">
                <section class="left">
                    <section class="info">
                        <figure class="keys">{{keypairs.length}} keys</figure>
                        <figure class="accounts">{{accounts.length}} accounts</figure>
                    </section>
                </section>
                <section class="right">
                    <Button          text="Generate Key" @click.native="generateKeypair" />
                    <Button blue="1" text="Import Key" @click.native="importKeypair" />
                </section>
            </section>

            <section class="wallet-actions" v-if="state === STATES.CARDS">
                <section class="left">
                    <section class="info">
                        <figure class="keys">{{cards.length}} cards</figure>
                        <figure class="accounts">0 expired</figure>
                    </section>
                </section>
                <section class="right">
                    <Button blue="1" @click.native="importKeypair" text="Add Credit Card" />
                </section>
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
    import CreditCardsList from "../components/misc/CreditCardsList";

    const STATES = {
        KEYS:'keys',
        CARDS:'cards',
    }

    let saveTimeout;
    export default {
    	components:{
		    CreditCardsList,
		    KeysAndAccountList,
    	    PanelTabs
        },
        data () {return {
        	state:STATES.KEYS,
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
                'cards',
            ]),
            tabs(){
            	return [
                    {name:'Blockchain Accounts', state:STATES.KEYS},
                    {name:'Credit Cards', state:STATES.CARDS},
                ]
            },
        },
	    mounted(){

	    },
        methods:{
	        generateKeypair(){
	            PopupService.push(Popup.generateKeypair({}, keypair => {
	            	if(!keypair) return;
	            	PopupService.push(Popup.exportPrivateKey(keypair));
                }));
            },
            importKeypair(){
    		    PopupService.push(Popup.importKeypair({}, keypair => {}));
            },
            goToAccount(account){
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
        height:calc(100vh - 220px);
        padding-bottom:50px;
        border-right:1px solid $lightgrey;

        .scroller {

            .keys-and-accounts-list {
                overflow-y: auto;
                height:calc(100vh - 290px);
            }
        }

        &.no-panels {
            height:calc(100vh - 180px);

            .scroller {

                .keys-and-accounts-list {
                    height:calc(100vh - 250px);
                }
            }
        }

        .no-keypairs {
            height:100%;
            overflow-y:auto;
            padding:30px;
            background:$lightestgrey;
            padding-bottom:60px;

            display:flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            .container {
                max-width:400px;
                margin:0 auto;
                text-align:center;
            }

            .title {
                font-size: 24px;
            }

            .description {
                margin-top:10px;
                font-size: $medium;
            }

            .ctas {
                margin-top:20px;
            }
        }







        .wallet-actions {
            position:absolute;
            bottom:0;
            left:0;
            right:1px;
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
