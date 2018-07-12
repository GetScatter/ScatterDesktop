<template>
    <section class="onboarding">

        <section>

            <figure class="logo">Scatter</figure>

            <section class="onboarder" v-if="step === steps.IDENTITY">
                <h1>What should your name for applications be?</h1>
                <p>
                    The name you choose will be your Identity’s name. It will function as
                    your “username” on applications, and show people who you are.
                </p>

                <section class="input-container">
                    <section class="input">
                        <cin v-on:enter="setIdentityName" large-font="1" :text="identityName" key="name"
                             placeholder="Enter a Name" v-on:changed="changed => bind(changed, 'identityName')"></cin>
                    </section>
                    <section class="button">
                        <btn text="Continue" secondary="1" v-on:clicked="setIdentityName"></btn>
                    </section>
                </section>
                <i class="name-terms">Between 3-20 character, No spaces and only characters a-z, A-Z, 0-9, - or _</i>
            </section>

            <section class="onboarder" v-if="step === steps.BLOCKCHAIN">
                <h1>Need a Blockchain Account?</h1>
                <p>
                    Blockchain Accounts let you interact with the blockchain. If you know that you need one,
                    enter your Private Key below and Scatter will set up everything for you.
                </p>

                <section class="input-container">
                    <section class="input">
                        <cin @changed="makePublicKey" placeholder="Enter a Private Key" key="blockchain" v-on:enter="importBlockchainAccount"
                             type="password" :text="keypair.privateKey" v-on:changed="changed => bind(changed, 'keypair.privateKey')"></cin>
                    </section>
                    <section class="button">
                        <btn text="Import Account" secondary="1" v-on:clicked="importBlockchainAccount"></btn>
                        <btn text="Skip" red="1" v-on:clicked="skipBlockchain"></btn>
                    </section>
                </section>
                <i class="name-terms">{{keypair.publicKey.length ? keypair.publicKey : 'Once you enter a valid private key you will see the public key here.'}}</i>
            </section>

        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing';

    import Identity from '../models/Identity';
    import Keypair from '../models/Keypair';
    import {Popup} from '../models/popups/Popup'
    import PopupService from '../services/PopupService';
    import KeyPairService from '../services/KeyPairService';
    import AccountService from '../services/AccountService';
    import PluginRepository from '../plugins/PluginRepository';

    const STEPS = {
        IDENTITY:'identity',
        BLOCKCHAIN:'blockchain'
    };

    export default {
        data () {return {
            identityName:'',
            steps:STEPS,
            step:STEPS.IDENTITY,
            keypair:Keypair.placeholder(),
            keypairSaved:false,
            importingAccount:false,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps'
            ])
        },
        mounted(){
        },
        methods: {
            setIdentityName(){
                if(!Identity.nameIsValid(this.identityName)) return PopupService.push(Popup.invalidIdentityName());

                const scatter = this.scatter.clone();
                const identity = scatter.keychain.identities[0];
                identity.name = this.identityName;
                scatter.keychain.updateOrPushIdentity(identity);
                this[Actions.SET_SCATTER](scatter);
                this.step = STEPS.BLOCKCHAIN;
            },
            async makePublicKey(){
                setTimeout(async () => {
                    if(!KeyPairService.isValidPrivateKey(this.keypair))
                        this.keypair.publicKey = '';
                    if(this.keypair.privateKey.length < 50) return false;

                    // Conforming private key to standard input
                    this.keypair.privateKey = PluginRepository.plugin(this.keypair.blockchain).conformPrivateKey(this.keypair.privateKey);

                    await KeyPairService.makePublicKey(this.keypair);
                }, 100)
            },
            async importBlockchainAccount(){
                if(!this.keypair.publicKey.length) return PopupService.push(Popup.snackbar("Invalid Private Key", "ban"));
                this.importingAccount = true;

                const network = await PluginRepository.plugin(this.keypair.blockchain).getEndorsedNetwork();

                const finishedImporting = () => {
                    PopupService.push(Popup.prompt(`You're ready to go!`,
                        `Make sure you go to the "Help" section and download a Web Browser Extension if you want to interact with web applications.`,
                        "check", "Finish", () => {
                            this.$router.push({name:RouteNames.IDENTITIES});
                        }));

                };

                const importAccount = async () => {
                    if(AccountService.accountsAreImported(this.keypair)){
                        const availableAccounts = await AccountService.getImportableAccounts(this.keypair, network);
                        if(!availableAccounts || !availableAccounts.length){
                            PopupService.push(Popup.prompt(`Can't find ${this.keypair.blockchain.toUpperCase()} accounts`,
                                `Are you sure you have an account on the ${this.keypair.blockchain.toUpperCase()} blockchain?`,
                                "ban", "Go Back"));
                            this.importingAccount = false;
                            return false;
                        }
                        const account = availableAccounts[0];
                        await AccountService.addAccount(account, this);
                        finishedImporting();
                    } else {
                        await AccountService.addAccountFromKeypair(this.keypair, network, this);
                        finishedImporting();
                    }
                };

                if(!this.keypairSaved) {
                    this.keypair.name = 'Keypair From Setup Wizard';
                    KeyPairService.saveKeyPair(this.keypair, this, async () => {
                        this.keypairSaved = true;
                        await importAccount();
                    });
                }
                else await importAccount();
            },
            skipBlockchain(){
                this.$router.push({name:RouteNames.IDENTITIES});
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .onboarding {
        height:100vh;
        width:100%;
        -webkit-app-region: drag;

        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .logo {
            font-family: 'Grand Hotel', sans-serif;
            font-size: 72px;
            color: #f6f6f6;
            margin-bottom:60px;
        }

        .onboarder {
            -webkit-app-region: no-drag;
            max-width:500px;
            margin:0 auto;

            h1 {
                font-size: 24px;
                font-weight: 400;
                margin:0;
            }

            p {
                font-size: 16px;
                color:#838383;
            }

            .input-container {
                display:flex;
                flex-direction: row;

                .input {
                    flex:1;
                    margin-right:20px;
                    text-align:left;


                }

                .button {
                    float:left;
                }
            }

            .name-terms {
                font-size: 13px;
                line-height:50px;
            }
        }

    }
</style>