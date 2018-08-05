<template>
    <section>

        <section>
            <section class="head">
                <i class="fa fa-trash-o" @click="deleteKeyPair" v-tooltip.left-start="'Delete Keypair'"></i>
            </section>

            <section class="selected-item scrollable" v-if="keypair">

                <figure class="name" :class="{'bad-name':badKeypairName()}">{{keypair.name.length ? keypair.name : 'Keypair Name Required'}}</figure>
                <figure v-if="isNew" class="description">
                    Keypairs are what allow you to interact with the blockchain, and they can also serve as a much more secure way of interacting with
                    things on the internet.
                </figure>

                <section class="split-panels left">
                    <section class="info-box">
                        <!--<figure class="header">Keypair Data</figure>-->

                        <cin placeholder="Keypair Name ( organizational )" :text="keypair.name" v-on:changed="changed => bind(changed, 'keypair.name')"></cin>

                        <sel v-if="isNew" :selected="keypair.blockchain.toUpperCase()"
                             :options="blockchains"
                             :parser="blockchain => blockchain.key.toUpperCase()"
                             v-on:changed="blockchainChanged" :key="1"></sel>

                        <cin v-if="isNew" @changed="makePublicKey" placeholder="Private Key" type="password" :text="keypair.privateKey" v-on:changed="changed => bind(changed, 'keypair.privateKey')"></cin>
                        <cin placeholder="Public Key" disabled="true" :text="keypair.publicKey"></cin>

                        <br>
                        <btn v-if="isNew" v-on:clicked="generateKeyPair" text="Generate New Keypair" secondary="true"></btn>
                        <btn v-if="isNew && keypair.publicKey.length" v-on:clicked="copyKeyPair" :red="keypair.publicKey.length" text="Copy Private Key" :secondary="!keypair.publicKey.length"></btn>
                        <btn v-if="!isNew" v-on:clicked="copyKeyPair" text="Copy Public Key" secondary="true"></btn>
                        <btn v-on:clicked="saveKeyPair" :text="isNew ? 'Save Keypair' : 'Update Name'" style="float:right;"></btn>

                        <btn v-if="!isNew" v-on:clicked="toggleQR" :text="qr === '' ? 'Show Encrypted QR' : 'Hide QR'"></btn>

                        <section style="width:100%; margin-left:-15px;">
                            <img :src="qr" />
                        </section>

                    </section>
                </section>

                <section class="split-panels" v-if="!isNew">
                    <section class="info-box">
                        <figure class="header">Import Accounts</figure>

                        <sel :selected="selectedNetwork.name"
                             :options="availableNetworks"
                             :parser="network => network.name"
                             v-on:changed="changed => bind(changed, 'selectedNetwork')" :key="1"></sel>

                        <section v-if="isImportable">
                            <br>
                            <btn v-on:clicked="fetchAccounts" text="Fetch Accounts"></btn>

                            <section v-if="fetchedAccounts">
                                <br>
                                <hr/>
                                <figure class="header">Available Accounts</figure>
                                <tags adder="true" v-if="filteredFetchedAccounts.length"
                                      :items="filteredFetchedAccounts"
                                      :parser="item => `${item.name}@${item.authority}`"
                                      v-on:clicked="linkAccount"></tags>
                                <figure v-else>
                                    Either there are no accounts connected to this network for this public key, or the network could not be reached.
                                </figure>
                            </section>
                        </section>

                        <section v-if="!isImportable">
                            <br>
                            <btn v-on:clicked="linkKeypairToNetwork" text="Link to Network"></btn>
                        </section>

                        <section v-if="linkedAccounts.length">
                            <br>
                            <br>
                            <hr/>
                            <figure class="header">Linked Accounts / Keypairs</figure>

                            <section class="list-item" v-for="item in linkedAccounts">
                                <figure class="name">{{item.formatted()}}</figure>
                                <figure class="button" v-tooltip="'Unlink'" @click="unlinkAccount(item)">
                                    <i class="fa fa-ban"></i>
                                </figure>
                            </section>


                            <!--<tags :items="linkedAccounts"-->
                                  <!--:parser="item => item.formatted()"-->
                                  <!--v-on:clicked="unlinkAccount"></tags>-->
                        </section>
                    </section>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import Keypair from '../../models/Keypair'
    import Account from '../../models/Account'
    import {BlockchainsArray, Blockchains} from '../../models/Blockchains';
    import KeyPairService from '../../services/KeyPairService';
    import AccountService from '../../services/AccountService';
    import QRService from '../../services/QRService';
    import PluginRepository from '../../plugins/PluginRepository'

    import ElectronHelpers from '../../util/ElectronHelpers';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'

    export default {
        name: 'Keypair',
        data () {return {
            blockchain:Blockchains,
            blockchains:BlockchainsArray,
            selectedNetwork:null,
            availableAccounts:[],
            keypair:null,
            fetchedAccounts:false,
            qr:'',
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'keypairs',
                'networks',
                'accounts'
            ]),
            filteredFetchedAccounts(){
                return this.availableAccounts.filter(account => !this.linkedAccounts.map(x => x.unique()).includes(account.unique()));
            },
            linkedAccounts(){
                return this.accounts.filter(account => account.keypairUnique === this.keypair.unique());
            },
            isImportable(){
                return AccountService.accountsAreImported(this.keypair);
            },
            availableNetworks(){
                return this.networks.filter(network => network.blockchain === this.keypair.blockchain)
            },
            isNew(){
                return !this.keypairs.find(x => x.publicKey === this.keypair.publicKey);
            },
        },
        mounted(){
            this.keypair = this.kp;
            this.selectedNetwork = this.availableNetworks[0];
        },
        props:['kp'],
        methods: {
            async toggleQR(){
                //TODO: Needs to include salt
                if(this.qr === '') this.qr = await QRService.createQR(this.keypair.privateKey);
                else this.qr = '';
            },
            async linkKeypairToNetwork(){
                await AccountService.addAccountFromKeypair(this.keypair, this.selectedNetwork, this);
            },
            async linkAccount(account){
                await AccountService.addAccount(account, this);
            },
            async unlinkAccount(account){

                PopupService.promptGuard(Popup.prompt(
                    "Removing Account Link", "This will remove this account link from the keypair and all associated permissions.",
                    "trash-o", "Unlink Account"
                ), async accepted => {
                    if(accepted) await AccountService.removeAccount(account, this);
                });

            },
            async fetchAccounts(){
                this.fetchedAccounts = false;
                this.availableAccounts = await AccountService.getImportableAccounts(this.keypair, this.selectedNetwork);
                this.fetchedAccounts = true;
            },
            badKeypairName(){
                return !this.keypair.name.length
            },
            deleteKeyPair(){
                PopupService.promptGuard(Popup.prompt(
                    "Deleting Keypair", "This will delete the keypair, it's accounts, and all associated permissions.",
                    "trash-o", "Delete Keypair"
                ), accepted => {
                    if(accepted) KeyPairService.removeKeyPair(this.keypair, () => {
                        this.keypair = Keypair.placeholder();
                        this.$emit('selected', this.keypair.clone());
                    });
                });
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
            copyKeyPair(){
                ElectronHelpers.copy(this.isNew
                    ? this.keypair.privateKey
                    : this.keypair.publicKey);
                PopupService.push(Popup.snackbar("Keypair copied to clipboard!", "key"))
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
                PopupService.push(Popup.snackbar("A new keypair was generated."));
            },
            saveKeyPair(){
                if(this.isNew) PopupService.push(Popup.prompt(
                    "Have you copied the private key?",
                    "You will not be able to copy the private key again once you save this keypair.",
                    "exclamation-triangle",
                    "Yes",
                    accepted => {
                        if(!accepted) return;
                        KeyPairService.saveKeyPair(this.keypair, this, () => {
                            PopupService.push(Popup.snackbar("Keypair Saved!", "check"));
                            this.$emit('selected', this.keypair.clone());
                        });
                    },
                    "Go Back"));
                else KeyPairService.updateKeyPair(this.keypair, this, () => {
                    PopupService.push(Popup.snackbar("Keypair Updated!", "check"));
                });
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";
</style>