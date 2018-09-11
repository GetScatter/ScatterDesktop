<template>
    <section>

        <section v-if="selectedNetwork">
            <section class="head">
                <i class="fa fa-trash-o" @click="deleteKeyPair" v-tooltip="'Delete Keypair'"></i>
            </section>

            <section class="selected-item scrollable" v-if="keypair">

                <cin big="true" placeholder="Name ( organizational )" :text="keypair.name" v-on:changed="changed => bind(changed, 'keypair.name')"></cin>

                <section class="panel-shifter" v-if="!isNew">


                    <section class="shifter-options" style="margin-top:30px;">
                        <figure class="shifter-option" v-for="p in PANELS" @click="panel = p" :class="{'active':panel === p}">{{p}}</figure>
                    </section>

                    <section class="shited-panel" v-if="panel === PANELS.ACCOUNTS">
                        <section class="split-panels">
                            <section class="info-box top">
                                <br><br>

                                <sel :selected="selectedNetwork.name"
                                     :options="availableNetworks"
                                     :parser="network => network.name"
                                     v-on:changed="changed => bind(changed, 'selectedNetwork')" :key="1"></sel>

                                <section v-if="isImportable">
                                    <btn v-on:clicked="fetchAccounts" text="Fetch Accounts"></btn>
                                    <btn v-if="availableAccounts.length" v-on:clicked="availableAccounts = []; fetchedAccounts = false;" text="Clear Fetched" secondary="1"></btn>

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

                                    <section class="list-item" v-for="account in linkedAccounts">
                                        <figure v-if="isEndorsedNetwork(account)" class="name" @click="openAccountInExplorer(account)" style="cursor:pointer;"><u>{{account.formatted()}}</u></figure>
                                        <figure v-else class="name">{{account.formatted()}}</figure>

                                        <figure class="date" v-if="account.network()">{{account.network().name}}</figure>

                                        <section v-if="account.blockchain() === blockchain.EOSIO && accountData(account)">
                                            <p-bar color="orange" v-if="accountData(account).refund_request"
                                                   :used="+new Date() - +new Date(accountData(account).refund_request.request_time)"
                                                   :total="(86400*3*1000)"
                                                   :l-text="`Refunding on ${new Date(+new Date(accountData(account).refund_request.request_time)+(86400*3*1000)).toLocaleString()}`"
                                                   :r-text="refundAmount(account)"></p-bar>

                                            <section v-if="accountData(account).total_resources">
                                                <p-bar color="blue" :used="accountData(account).cpu_limit.used" :total="accountData(account).cpu_limit.max" l-text="CPU" :r-text="accountData(account).total_resources.cpu_weight"></p-bar>
                                                <p-bar color="yellow" :used="accountData(account).net_limit.used" :total="accountData(account).net_limit.max" l-text="NET" :r-text="accountData(account).total_resources.net_weight"></p-bar>
                                                <p-bar color="red" :used="accountData(account).ram_usage" :total="accountData(account).ram_quota" l-text="RAM"
                                                       :r-text="`${(accountData(account).ram_usage/1024).toFixed(2)}KB / ${(accountData(account).ram_quota/1024).toFixed(2)}KB`"></p-bar>
                                            </section>

                                        </section>


                                        <figure class="button" v-tooltip="'Unlink'" @click="unlinkAccount(account)">
                                            <i class="fa fa-ban"></i>
                                        </figure>

                                        <figure v-if="account.blockchain() === blockchain.EOSIO" class="separator"></figure>

                                        <figure v-if="account.blockchain() === blockchain.EOSIO" class="button blue" v-tooltip="'Buy/Sell Ram'" @click="moderateRAM(account)">
                                            <i class="fa fa-microchip"></i>
                                        </figure>

                                        <figure v-if="account.blockchain() === blockchain.EOSIO" class="button blue" v-tooltip="'Stake/Unstake CPU & NET'" @click="moderateResources(account)">
                                            <i class="fa fa-globe"></i>
                                        </figure>

                                        <figure v-if="account.blockchain() === blockchain.EOSIO" class="button blue" v-tooltip="'Refresh Resources'" @click="fetchAccountData(account, true)">
                                            <i class="fa fa-refresh"></i>
                                        </figure>
                                    </section>
                                </section>
                            </section>
                        </section>
                    </section>


                    <section class="shited-panel" v-if="panel === PANELS.PROOFS">
                        <section class="info-box">
                            <cin forced="1" placeholder="Public Key" disabled="true" :text="keypair.publicKey" :copy="true"></cin>
                            <btn v-on:clicked="generateQR" text="Generate Encrypted QR"></btn>
                            <section style="width:100%; margin-left:-15px;"><img :src="qr" /></section>
                        </section>
                    </section>

                </section>

                <section v-else>
                    <section class="split-panels left">
                        <section class="info-box top">

                            <section style="overflow: hidden;">
                                <swch style="float:left;" first="Generate" second="Import" :selected="importingKey ? 'Generate' : 'Import'" v-on:switched="toggleImporting"></swch>
                                <swch style="margin-left:5px; float:left;" v-if="importingKey" first="Desktop" second="Hardware" :selected="usingHardware ? 'Desktop' : 'Hardware'" v-on:switched="x => toggleExternalWallet()"></swch>
                                <btn v-on:clicked="saveKeyPair" text="Save Keypair" style="float:right;"></btn>
                            </section>
                            <br>

                            <br v-if="!usingHardware">
                            <section class="blockchain-selector" :class="{'fork-support':forkSupport}">
                                <sel v-tooltip.top-start="'Select a Blockchain'" v-if="!usingHardware" :selected="keypair.blockchain.toUpperCase()"
                                     :options="blockchains"
                                     :parser="blockchain => blockchain.value.toUpperCase()"
                                     v-on:changed="blockchainChanged" :key="1"></sel>

                                <figure v-if="!usingHardware" class="fork-button">
                                    <section class="button" v-tooltip="'Use Fork'" @click="toggleFork">
                                        <i class="fa fa-code-fork"></i>
                                    </section>
                                </figure>
                            </section>

                            <section v-if="importingKey">
                                <cin v-if="!usingHardware" @changed="makePublicKey" placeholder="Private Key" type="password"
                                     :text="keypair.privateKey" v-on:changed="changed => bind(changed, 'keypair.privateKey')"></cin>
                            </section>


                            <transition name="fade">
                                <cin v-if="((keypair.fork && keypair.fork.length) || useFork)" :forced="keypair.fork.length"
                                     placeholder="Enter the fork prefix"
                                     :text="keypair.fork" v-on:changed="changed => bind(changed, 'keypair.fork')"></cin>
                            </transition>

                            <cin :forced="usingHardware && keypair.publicKey.length"
                                 :placeholder="usingHardware && keypair.publicKey.length ? `Imported ${keypair.blockchain.toUpperCase()} Key` : 'Public Key'"
                                 disabled="true" :text="keypair.publicKey"></cin>

                            <btn v-if="!importingKey" v-on:clicked="generateKeyPair" text="Generate New Keypair" secondary="true"></btn>
                            <btn v-if="keypair.publicKey.length && !usingHardware" v-on:clicked="copyKeyPair" :red="keypair.publicKey.length" text="Copy Private Key" :secondary="!keypair.publicKey.length"></btn>

                            <section v-if="usingHardware">
                                <br><br>
                                <sel v-tooltip.top-start="'Select a Hardware Wallet'" :selected="keypair.external.type"
                                     :options="externalWalletTypes"
                                     v-on:changed="changedExternalWalletType" :key="'hardware_import'"></sel>
                                <btn v-on:clicked="importKeyFromHardware" text="Import Hardware Key"></btn>
                            </section>

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
    import ExternalWallet, {EXT_WALLET_TYPES_ARR} from '../../models/ExternalWallet';

    import ElectronHelpers from '../../util/ElectronHelpers';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'

    let saveTimeout = null;

    const PANELS = {
        ACCOUNTS:'Accounts',
        PROOFS:'Proofs'
    }

    export default {
        name: 'Keypair',
        data () {return {
            panel:PANELS.ACCOUNTS,
            PANELS:PANELS,
            useFork:false,
            externalWalletTypes:EXT_WALLET_TYPES_ARR,
            usingHardware:false,
            importingKey:true,
            blockchain:Blockchains,
            blockchains:BlockchainsArray,
            selectedNetwork:null,
            availableAccounts:[],
            keypair:null,
            fetchedAccounts:false,
            qr:'',
            accountDatum:[],
            endorsedNetworks:[],
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'keypairs',
                'networks',
                'accounts',
                'explorers',
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
            forkSupport(){
                return PluginRepository.plugin(this.keypair.blockchain).forkSupport();
            },
        },
        mounted(){
            this.keypair = this.kp;
            this.setDefaultSelectedNetwork();
            this.fetchAccountDatum();
            PluginRepository.signatureProviders().map(async plugin => {
                const endorsed = await plugin.getEndorsedNetwork();
                const net = this.networks.find(x => x.hostport() === endorsed.hostport());
                if(net) this.endorsedNetworks.push(net.id);
            })

        },
        destroyed(){
            clearTimeout(saveTimeout);
        },
        props:['kp'],
        methods: {
            async setDefaultSelectedNetwork(){
                const endorsed = await PluginRepository.plugin(this.keypair.blockchain).getEndorsedNetwork();
                this.selectedNetwork = this.networks.find(x => x.unique() === endorsed.unique()) || this.availableNetworks[0];
                return true;
            },
            toggleFork(){
                this.keypair.fork = '';
                this.useFork = !this.useFork;
            },
            isEndorsedNetwork(account){
                if(!account.network()) return false;
                return this.endorsedNetworks.includes(account.network().id);
            },
            openAccountInExplorer(account){
                ElectronHelpers.openLinkInBrowser(this.explorers[account.blockchain()].account(account))
            },
            refundAmount(account){
                const symbol = this.accountData(account).refund_request.cpu_amount.split(' ')[1];
                const cpu = parseFloat(this.accountData(account).refund_request.cpu_amount.split(' ')[0]);
                const net = parseFloat(this.accountData(account).refund_request.net_amount.split(' ')[0]);

                return `${parseFloat(cpu+net).toFixed(4)} ${symbol}`
            },
            moderateRAM(account){
                PopupService.push(Popup.buySellRAM(account, tx => {
                    if(!tx) return;
                    this.fetchAccountData(account);
                    PopupService.push(Popup.transactionSuccess(account.blockchain(), tx.transaction_id))
                }));
            },
            moderateResources(account){
                PopupService.push(Popup.delegateResources(account, tx => {
                    if(!tx) return;
                    this.fetchAccountData(account);
                    PopupService.push(Popup.transactionSuccess(account.blockchain(), tx.transaction_id))
                }));
            },
            fetchAccountDatum(){
                if(this.keypair.blockchain === Blockchains.EOSIO) {
                    this.linkedAccounts.map(account => {
                        this.fetchAccountData(account);
                    });
                }
            },
            fetchAccountData(account, snack = false){
                const plugin = PluginRepository.plugin(Blockchains.EOSIO);
                plugin.accountData(account, account.network()).then(data => {
                    if (!data) return;
                    const found = this.accountDatum.find(x => x.name === account.name);
                    if(!found) this.accountDatum.push({name: account.name, data});
                    else found.data = data;

                    if(snack){
                        PopupService.push(Popup.snackbar(`Refreshed Account: ${account.formatted()}`, "check"))
                    }
                })
            },
            accountData(account){
                const data = this.accountDatum.find(x => x.name === account.name);
                return !!data ? data.data : null;
            },
            toggleImporting(){
                this.keypair.fork = '';
                this.keypair.publicKey = '';
                this.keypair.privateKey = '';

                this.importingKey = !this.importingKey;
                if(!this.importingKey) this.usingHardware = false;
            },
            toggleExternalWallet(){
                this.keypair.fork = '';
                this.keypair.publicKey = '';
                this.keypair.privateKey = '';

                this.keypair.external = this.usingHardware ? null : new ExternalWallet();
                this.usingHardware = !this.usingHardware;
            },
            changedExternalWalletType(newType){
                this.keypair.external = new ExternalWallet(newType);
            },
            importKeyFromHardware(){
                this.keypair.external.interface.getPublicKey().then(key => {
                    let isValid = false;

                    BlockchainsArray.map(x => {
                        if(isValid) return;
                        if(PluginRepository.plugin(x.value).validPublicKey(key)){
                            isValid = true;
                            this.keypair.blockchain = x.value;
                        }
                    });

                    if(isValid) this.keypair.publicKey = key;
                });
            },
            async generateQR(){
                this.qr = await QRService.createQR(this.keypair.privateKey);
            },
            async linkKeypairToNetwork(){
                await AccountService.addAccountFromKeypair(this.keypair, this.selectedNetwork);
            },
            async linkAccount(account){
                await AccountService.addAccount(account);
            },
            async unlinkAccount(account){

                PopupService.promptGuard(Popup.prompt(
                    "Removing Account Link", "This will remove this account link from the keypair and all associated permissions.",
                    "trash-o", "Unlink Account"
                ), async accepted => {
                    if(accepted) await AccountService.removeAccount(account);
                });

            },
            async fetchAccounts(){
                this.fetchedAccounts = false;
                this.availableAccounts = await this.fetchAccountsWithoutBinding();
                this.fetchedAccounts = true;
            },
            async fetchAccountsWithoutBinding(){
                return await AccountService.getImportableAccounts(this.keypair, this.selectedNetwork);
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
                    this.keypair.fork = '';
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

                await KeyPairService.generateKeyPair(this.keypair, this.keypair.fork);
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
                        KeyPairService.saveKeyPair(this.keypair, async () => {
                            PopupService.push(Popup.snackbar("Keypair Saved!", "check"));
                            this.$emit('selected', this.keypair.clone());
                            await this.setDefaultSelectedNetwork();
                            if(this.isImportable) {
                                const accounts = await this.fetchAccountsWithoutBinding();
                                PopupService.push(Popup.selector('Select Account', 'Select an Account to import', 'address-book', accounts, x => x.formatted(), selected => {
                                    this.linkAccount(selected);
                                }))
                            } else {
                                const account = Account.fromJson({
                                    keypairUnique:this.keypair.unique(),
                                    networkUnique:this.selectedNetwork.unique(),
                                    publicKey:this.keypair.publicKey,
                                })
                                this.linkAccount(account)
                            }
                        });
                    },
                    "Go Back"));
                else KeyPairService.updateKeyPair(this.keypair, () => {
                    PopupService.push(Popup.snackbar("Keypair Updated!", "check"));
                });
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            'keypair.name'(a,b){
                if(!b) return;
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    if(this.isNew) return false;
                    if(!this.keypair.name.length) return false;
                    if(this.keypairs.find(x => x.id !== this.keypair.id && x.name.toLowerCase() === this.keypair.name.toLowerCase())) return false;

                    KeyPairService.updateKeyPair(this.keypair, () => {
                        PopupService.push(Popup.snackbar("Keypair Updated!", "check"));
                    });
                }, 500);

            },
            'keypair.privateKey'(a,b){
                this.keypair.privateKey = this.keypair.privateKey.trim();

            },
            'keypair.fork'(){
                if(!this.keypair.fork || this.keypair.fork.length)
                KeyPairService.makePublicKey(this.keypair);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .blockchain-selector {
        .select {
            display:inline-block;
            max-width:100%;
            transition: max-width 0.3s ease;
        }
        .fork-button {
            max-width:0;
            overflow: hidden;
            width:100%;
            display:inline-block;
            float:right;
            transition: max-width 0.3s ease;
            .button {
                width:50px;
                height:50px;
                line-height:49px;
                text-align:center;
                cursor: pointer;
                border:1px solid $dark-blue;
                outline:0;
                background:$light-blue;
                border-radius:2px;
                color:#fff;
                font-size:24px;
                font-weight: bold;
                transition: all 0.15s ease;
                transition-property: background, color, border;
                &:hover {
                    background:transparent;
                    border:1px solid $dark-blue;
                    color:$dark-blue;
                }
                &:active {
                    background:$dark-blue;
                    border:1px solid transparent;
                    color:#fff;
                }
            }
        }
        &.fork-support {
            .select {
                max-width:calc(100% - 60px);
            }
            .fork-button {
                max-width:50px;
            }
        }
    }

</style>
