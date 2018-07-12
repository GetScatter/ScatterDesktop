<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">
                <i class="fa fa-chevron-left" @click="$router.back()"></i>
            </section>

            <section class="items-list scrollable">
                <section class="item"
                         :class="{'active':onStep.ref === step.ref}"
                         v-for="step in steps" @click="scrollTo(step)">
                    <figure class="title">{{step.title}}</figure>
                    <figure class="description">{{step.description}}</figure>
                </section>
            </section>
        </section>


        <section class="panel display">
            <section class="head">

            </section>

            <section ref="scroller" class="selected-item scrollable" v-if="keypair">

                <section :ref="steps.NAME.ref">
                    <figure class="name">Name your Keypair</figure>
                    <section class="description">
                        Keypairs can be daunting anyway for most users, but when you have to keep track of random names or characters it becomes even harder.
                        Scatter allows you to assign names to your keypairs so that you can organize and keep track of them easily. The name has no affect on it's use what-so-ever.
                    </section>

                    <cin placeholder="Keypair Name ( organizational )" :text="keypair.name" v-on:changed="changed => bind(changed, 'keypair.name')"></cin>
                    <br><br>
                </section>

                <section :ref="steps.BLOCKCHAIN.ref" class="info-box">
                    <figure class="name">Selecting a Blockchain</figure>
                    <section class="description">
                        When importing or generating a keypair you will need to select a blockchain. The reason for this is that different blockchains format their public and private keys
                        differently. Keys for EOS won't work for Ethereum, and vice versa; even though underneath it all they are the same.
                    </section>
                    <br>

                    <sel :selected="keypair.blockchain.toUpperCase()"
                         :options="blockchains"
                         :parser="blockchain => blockchain.key.toUpperCase()"
                         v-on:changed="blockchainChanged" :key="1"></sel>
                </section>

                <section :ref="steps.PRIVATE_KEY.ref" class="info-box">
                    <figure class="name">Importing an existing Keypair</figure>
                    <section class="description">
                        The first thing you learn in Blockchain is never to give away your private key. While this is somewhat true, you inevitably have to use your private key
                        at some point. What is important is that you select a place to trust to put it.
                        <br><br>
                        Scatter is an open-source project who's code is freely available online for anyone to check; and it has been checked by many.
                        Because Scatter also allows other applications to pass through it to provide blockchain signatures it's also the prime place to put your
                        private keys as it allows you to interact with <b>non</b>-open-source projects securely, and safely.
                        <br><br>
                        Enter your private key below and Scatter will automatically produce it's public key ( if it is valid ). If the keypair is for a different blockchain than the one
                        you have selected Scatter will automatically select the blockchain for you.
                    </section>

                    <cin @changed="makePublicKey" placeholder="Private Key" type="password" :text="keypair.privateKey" v-on:changed="changed => bind(changed, 'keypair.privateKey')"></cin>
                    <cin placeholder="Public Key" disabled="true" :text="keypair.publicKey"></cin>
                </section>

                <section :ref="steps.GENERATE.ref" class="info-box">
                    <figure class="name">Need a new keypair?</figure>
                    <section class="description">
                        To do anything on a blockchain you will need a Keypair. Scatter allows you to generate keypairs for multiple blockchains locally; meaning on your own machine and
                        without sending them to the internet.
                    </section>

                    <btn v-on:clicked="generateKeyPair" text="Generate New Keypair" secondary="true"></btn>
                </section>

                <section :ref="steps.COPY.ref" class="info-box">
                    <figure class="name">Copy generated Keypairs before you save!</figure>
                    <section class="description">
                        <b class="red">This is an important step!</b><br><br>
                        Scatter doesn't allow you to export your private keys in cleartext. Though you can backup your Scatter instance including all of it's keypairs, that backup is exported
                        encrypted and needs to be decrypted before it can be viewed. Make sure you copy your keypair to your clipboard and paste it somewhere before clicking the save button so
                        that you have a backup.
                    </section>

                    <btn v-on:clicked="copyKeyPair" text="Copy" secondary="true"></btn>
                </section>

                <section :ref="steps.SAVE.ref" class="info-box">
                    <figure class="name">Never forget to save.</figure>
                    <section class="description">
                        Anyone who works on a computer knows the deal. Save, or it's lost. CTRL+S ( or CMD+S ) has become second nature as we constantly hit the keyboard shortcut without even noticing anymore.
                        In most cases in Scatter things save automatically but because keypairs need to be copied before they can be saved in some cases auto-saving for keypairs isn't enabled.
                        <br><br>
                        Remember to always save your keypair.
                    </section>

                    <btn v-on:clicked="saveKeyPair" text="Save Keypair"></btn>
                </section>
            </section>


        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {RouteNames} from '../../vue/Routing';
    import * as Actions from '../../store/constants';

    import PluginRepository from '../../plugins/PluginRepository';
    import Keypair from '../../models/Keypair';
    import {Blockchains, BlockchainsArray} from '../../models/Blockchains';
    import AccountService from '../../services/AccountService';
    import KeyPairService from '../../services/KeyPairService';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'
    import ElectronHelpers from '../../util/ElectronHelpers'



    const WizardSteps = {
        NAME:{ref:'name', title:'Name your Keypair', description:'Keypairs can be a hassle to keep track of, let\'s give it a name.'},
        BLOCKCHAIN:{ref:'blockchain', title:'Selecting a Blockchain', description:'Blockchains use different keypair formats.'},
        PRIVATE_KEY:{ref:'pkey', title:'Import your Private Key', description:'Private keys allow you to prove who you are.'},
        GENERATE:{ref:'generate', title:'Generating Keypairs', description:'You can also generate new keypairs.'},
        COPY:{ref:'copy', title:'Copying your Private Key', description:'You will only be able to copy before saving.'},
        SAVE:{ref:'save', title:'Save your Keypair', description:'Don\'t forget to save your keypair'},
    };

    export default {
        data () {return {
            blockchains:BlockchainsArray,
            steps:WizardSteps,
            onStep:WizardSteps.NAME,
            keypair:null,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps',
            ]),
            isValidKeypair(){
                return false;
            }
        },
        mounted(){
            this.keypair = Keypair.placeholder();
            this.keypair.blockchain = Blockchains.EOS;
        },
        methods: {
            copyKeyPair(){
                ElectronHelpers.copy(this.keypair.privateKey);
                PopupService.push(Popup.snackbar("Keypair copied to clipboard!", "key"))
            },
            blockchainChanged(blockchainObject){
                const blockchain = blockchainObject.value;
                const clearAndChange = () => {
                    this.keypair.blockchain = blockchain;
                    this.keypair.privateKey = '';
                    this.keypair.publicKey = '';
                };
                if(this.keypair.privateKey.length){
                    if(PluginRepository.plugin(this.keypair.blockchain).convertsTo().includes(blockchain)){
                        this.keypair.privateKey =
                            PluginRepository.plugin(blockchain)
                                ['from_'+this.keypair.blockchain](this.keypair.privateKey);
                    } else clearAndChange();
                } else clearAndChange();
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
            async generateKeyPair(){
                this.keypair.publicKey = '';
                this.keypair.privateKey = '';

                await KeyPairService.generateKeyPair(this.keypair);
                this.scrollTo(WizardSteps.PRIVATE_KEY);
                PopupService.push(Popup.snackbar("A new keypair was generated."));
            },
            saveKeyPair(){
                PopupService.push(Popup.prompt(
                    "Have you copied the private key?",
                    "You will not be able to copy the private key again once you save this keypair.",
                    "exclamation-triangle",
                    "Yes",
                    accepted => {
                        if(!accepted) return;
                        KeyPairService.saveKeyPair(this.keypair, this, () => {
                            PopupService.push(Popup.snackbar("Keypair Saved!", "check"));
                            this.$router.push({name:RouteNames.BLOCKCHAINS});
                        });
                    },
                "Go Back"));
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";
</style>