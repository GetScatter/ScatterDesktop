<template>
    <section>

        <section class="vault" v-if="nextPopIn">

            <section class="head">

                <transition name="fade" mode="out-in">

                    <!-- TITLE HEAD -->
                    <section key="noerror" v-if="!status && !error && !selectedAccount">
                        <figure class="title">Vault</figure>
                        <figure class="description">View and manage all your Keys</figure>
                    </section>

                    <!-- ACCOUNT HEAD -->
                    <section key="account" v-if="!status && !error && selectedAccount">
                        <figure class="title">{{blockchainName(selectedAccount.blockchain())}}</figure>
                        <figure class="description">{{selectedAccount.sendable()}}</figure>
                    </section>

                    <!-- ERROR -->
                    <section key="error" v-if="!status && error" class="error">
                        <figure class="title">Error</figure>
                        <figure class="description">{{error}}</figure>
                    </section>

                    <!-- STATUS -->
                    <section key="status" v-if="status" class="status">
                        <figure class="title">Status</figure>
                        <figure class="description">{{status}}</figure>
                    </section>
                </transition>

                <!-- ADD OR BACK -->
                <figure id="tour2" class="add-keypair" :class="{'cancel':selected, 'hide':status}" v-tooltip="selected ? 'Go Back' : 'Add New Vault Entry'" @click="addOrBack">
                    <i class="fa fa-plus" v-if="selected"></i>
                    <span v-else>New</span>
                </figure>

                <!-- REMOVE -->
                <figure class="remove-keypair" :class="{'show':selected && !isNew && !exporting && !status}" v-tooltip="'Remove'" @click="removeKeypair">
                    <i class="fa fa-ban"></i>
                </figure>

                <!-- REFRESH ACCOUNTS -->
                <figure class="refresh-accounts" :class="{'show':selected && !isNew && !exporting && !status}" v-tooltip="'Refresh Linked Accounts'" @click="refreshAccounts">
                    <i class="fa fa-refresh"></i>
                </figure>

                <!-- EXPORT SECRET -->
                <figure class="export-keypair" :class="{'show':selected && !selected.external && !isNew && !exporting && !status}" v-tooltip="'Export Private Key'" @click="exporting = true">
                    <i class="fa fa-key"></i>
                </figure>

                <!-- SAVE QR CODE -->
                <figure class="show-qr" :class="{'show':selected && !isNew && exporting && exportType === EXPORT_TYPES.QR && !status}" v-tooltip="'Save QR'" @click="saveQR">
                    <i class="fa fa-save"></i>
                </figure>

                <!-- SCAN QR CODE -->
                <figure class="show-cam" :class="{'show':importType === IMPORT_TYPES.TEXT && !status && !camera}" v-tooltip="'Scan QR Code'" @click="camera = true">
                    <i class="fa fa-qrcode"></i>
                </figure>

                <!-- ENTER PRIVATE KEY MANUALLY -->
                <figure class="show-cam" :class="{'show':importType === IMPORT_TYPES.TEXT && !status && camera}" v-tooltip="'Enter Manually'" @click="camera = false">
                    <i class="fa fa-asterisk"></i>
                </figure>
            </section>

            <transition :name="selected ? 'slide-left' : 'slide-right'" mode="out-in">

                <!-- KEY LIST -->
                <section key="nokey" v-if="!selected" class="scroller">
                    <section class="search">
                        <figure class="icon"><i class="fa fa-search"></i></figure>
                        <input placeholder="Search..." v-model="searchTerms" />
                    </section>

                    <!-- KEYPAIRS -->
                    <section class="accounts scroller">
                        <section class="account" v-for="keypair in vaultEntries" @click="selectKeypair(keypair)">
                            <section class="info">
                                <figure class="name">{{keypair.name}}</figure>
                                <figure class="description">{{keypair.accounts().length}} linked accounts</figure>
                            </section>
                            <section class="icon">
                                <i class="fa fa-chevron-right"></i>
                            </section>
                        </section>
                    </section>
                </section>


                <!-- KEYPAIR -->
                <section key="key" v-if="selected" class="flexer">

                    <transition name="slide-right" mode="out-in">

                        <!-- NOT EXPORTING -->
                        <section key="notexporting" v-if="!exporting" class="flexer">

                            <transition name="slide-right" mode="out-in">

                                <!-- ACCOUNT DETAILS -->
                                <section key="accountdetails" v-if="selectedAccount" class="flexer">
                                    <section class="keypair">

                                        <section class="stats">
                                            <section class="stat" v-for="resource in resources">
                                                <radial-progress inner-stroke-color="#eee"
                                                                 start-color="#ff4645"
                                                                 stop-color="#ff4645"
                                                                 :diameter="130"
                                                                 :total-steps="100"
                                                                 :completed-steps="resource.percentage"
                                                                 :stroke-width="18">
                                                    <figure class="button" @click="moderateResource(resource)">
                                                        <i class="fa fa-exclamation-triangle" v-if="resource.percentage > 80"></i>
                                                        Moderate <b>{{resource.name}}</b>
                                                    </figure>
                                                </radial-progress>
                                                <figure class="percentage" :class="{'warning':resource.percentage > 80}">
                                                    {{parseFloat(resource.percentage).toFixed(2)}}%
                                                </figure>
                                            </section>

                                            <section style="flex:0 0 auto; width:100%; margin-top:20px;"
                                                     v-if="resources && outOfEOSResources">
                                                <section class="button wide" style="border:1px solid red;" @click="goToCPUEmergency">
                                                    <figure class="name">You're Out of Resources</figure>
                                                    <figure class="description">Click here to go to CPU Emergency and see if you are eligible to get some temporary resources.</figure>
                                                </section>
                                            </section>
                                        </section>

                                    </section>
                                </section>

                                <section key="vaultentry" v-if="!selectedAccount" class="flexer">
                                    <section class="keypair" :class="{'disabled':status}">
                                        <section key="keypairhead" class="head" :class="{'no-name':keyNameError}">
                                            <figure class="name">
                                                <input placeholder="Name this Vault Entry" v-model="selected.name" />
                                            </figure>

                                            <transition name="slide-left" mode="out-in">
                                                <figure key="named" class="description" v-if="!keyNameError">Click name to change it.</figure>
                                                <figure key="noname" class="description" v-else>{{keyNameError}}</figure>
                                            </transition>
                                        </section>


                                        <!-- EXISTING KEY -->
                                        <transition name="slide-left" mode="out-in">
                                            <section key="showkey" v-if="!isNew" class="scroller">

                                                <!-- PUBLIC KEYS -->
                                                <section class="accounts" :class="{'hidden':!showingSecrets}">
                                                    <section class="account copy" v-for="pkey in selected.publicKeys" @click="copy(pkey.key, `Copied ${blockchainName(pkey.blockchain)} Public Key to Clipboard.`)">
                                                        <section class="info">
                                                            <figure class="description linked-account">Shareable Key</figure>
                                                            <figure class="name">{{blockchainName(pkey.blockchain)}}</figure>
                                                            <figure class="description"><i class="fa fa-copy"></i> {{pkey.key}}</figure>
                                                        </section>
                                                    </section>
                                                </section>

                                                <!-- PUBLIC KEYS LIST TOGGLER -->
                                                <section class="breaker" @click="showingSecrets = !showingSecrets">
                                                    {{showingSecrets ? 'Hide' : 'Show Public Keys'}}
                                                </section>

                                                <!-- ACCOUNTS -->
                                                <section class="accounts">

                                                    <!--<section class="account" style="border-bottom:3px solid rgba(0,0,0,0.1);" @click="linkManually">-->
                                                        <!--<section class="info">-->
                                                            <!--<figure class="name">Link or Create Account</figure>-->
                                                            <!--<figure class="description">-->
                                                                <!--Click here if you want to either create a new account on top of this Key or-->
                                                                <!--manually add an existing account that can't be linked automatically.-->
                                                            <!--</figure>-->
                                                        <!--</section>-->
                                                    <!--</section>-->

                                                    <section class="account" :class="{'static':!usesResources(account)}" v-for="account in uniqueAccounts" @click="selectAccount(account)">
                                                        <section class="info">
                                                            <figure class="description linked-account">{{blockchainName(account.blockchain())}} Account</figure>
                                                            <figure class="name">{{account.sendable()}}</figure>
                                                            <figure class="description" v-if="account.authority.length"><i class="fa fa-id-card"></i> {{authorities(account)}}</figure>
                                                            <figure class="description"><i class="fa fa-globe"></i> {{account.network().name}}</figure>
                                                        </section>
                                                    </section>
                                                    <div style="height:50px;"></div>
                                                </section>
                                            </section>

                                            <!-- NEW KEY -->
                                            <section key="newkeypair" v-if="isNew && !importing" class="new-keypair">
                                                <!-- GENERATE NEW KEY -->
                                                <section class="button" @click="generateKey">
                                                    <figure class="name">Create New</figure>
                                                    <figure class="description">Click here if you want to generate a brand new set of Keys.</figure>
                                                </section>

                                                <!-- GO TO IMPORT SCREEN -->
                                                <section class="button" @click="importing = true;">
                                                    <figure class="name">Import</figure>
                                                    <figure class="description">Click here if you want to import a Key from text or hardware.</figure>
                                                </section>
                                            </section>

                                            <!-- IMPORTING -->
                                            <section key="importing" v-if="isNew && importing && !importType" class="new-keypair">
                                                <!-- SELECT TEXTUAL/QR IMPORT -->
                                                <section class="button" @click="importType = IMPORT_TYPES.TEXT;">
                                                    <figure class="name">Text or QR</figure>
                                                    <figure class="description">Click here to type, paste or scan your Private Key in.</figure>
                                                </section>

                                                <!-- SELECT HARDWARE IMPORT -->
                                                <section class="button" @click="importType = IMPORT_TYPES.HARDWARE;">
                                                    <figure class="name">Hardware</figure>
                                                    <figure class="description">Click here to use a hardware device.</figure>
                                                </section>
                                            </section>

                                            <!-- IMPORTING TEXT OR QR -->
                                            <section key="import-text" v-if="importType === IMPORT_TYPES.TEXT" class="scroller">
                                                <transition name="slide-right" mode="out-in">
                                                    <qr-reader key="qrreader" v-if="camera" @decode="qrScanned"></qr-reader>

                                                    <section v-if="!camera" key="inputsecret" class="input-keypair">
                                                        <section class="inputs">
                                                            <label><i class="fa fa-key"></i> Enter a Private Key</label>
                                                            <input ref="focuser" class="pad-right" v-model="selected.privateKey" :type="displayPrivateKeyField ? 'text' : 'password'" />
                                                            <figure class="eye-icon" @click="displayPrivateKeyField = !displayPrivateKeyField">
                                                                <i class="fa fa-eye" v-tooltip="'Show Input'" v-if="!displayPrivateKeyField"></i>
                                                                <i class="fa fa-eye-slash" v-tooltip="'Hide Input'" v-if="displayPrivateKeyField"></i>
                                                            </figure>
                                                        </section>
                                                    </section>
                                                </transition>
                                            </section>

                                            <!-- IMPORTING HARDWARE -->
                                            <section key="import-text" v-if="importType === IMPORT_TYPES.HARDWARE" class="import-hardware">
                                                <sel :selected="selected.external.type" v-if="selected.external"
                                                     :options="EXT_WALLET_TYPES" v-on:changed="(x) => hardwareType = x"></sel>

                                                <section style="margin-top:10px;" v-if="selected.external.interface.availableBlockchains().length > 1">
                                                    <sel style="width:calc(80% - 10px); float:left;" :selected="blockchainName(hardwareBlockchain)" v-if="selected.external"
                                                         :options="selected.external.interface.availableBlockchains()" :parser="x => blockchainName(x)" v-on:changed="(x) => hardwareBlockchain = x"></sel>

                                                    <input style="text-align:center;  font-size:16px; padding:0 10px; width:20%; float:left; height:50px; border-radius:4px; border:1px solid rgba(0,0,0,0.2); margin-left:10px; outline:0;" v-if="selected.external" placeholder="Index" v-model="selected.external.addressIndex" type="number" min="0" />
                                                </section>

                                                <!--<section class="input-keypair" style="padding:20px;">-->
                                                    <!--<section class="inputs">-->
                                                        <!--<label>Address Index</label>-->
                                                        <!--<input v-if="selected.external" placeholder="Select an Index ( number )" v-model="selected.external.addressIndex" type="number" min="0" />-->
                                                    <!--</section>-->
                                                <!--</section>-->

                                                <transition name="slide-left" mode="out-in">
                                                    <section key="getpublickey" v-if="hardwareReady" class="button wide" @click="importKeyFromHardware">
                                                        <figure class="name">Link Hardware</figure>
                                                        <figure class="description">This will link this hardware account to you Scatter.</figure>
                                                    </section>

                                                    <section key="loadinghardware" class="loading" v-else>
                                                        <i class="fa fa-hourglass-o fa-spin"></i>
                                                    </section>
                                                </transition>

                                            </section>
                                        </transition>
                                    </section>

                                </section>


                            </transition>

                        </section>



                        <!-- EXPORTING -->
                        <section key="exporting" v-if="exporting" class="flexer">
                            <section class="keypair">
                                <transition name="slide-left" mode="out-in">

                                    <!-- SELECT EXPORT TYPE -->
                                    <section key="exportselect" class="new-keypair" v-if="!exportType">

                                        <!-- EXPORT AS KEY -->
                                        <section class="button" @click="exportType = EXPORT_TYPES.KEY;">
                                            <figure class="name">Key</figure>
                                            <figure class="description">Export this Private Key in String format.</figure>
                                        </section>

                                        <!-- EXPORT AS QR -->
                                        <section class="button" @click="createQR">
                                            <figure class="name">QR Code</figure>
                                            <figure class="description">Export this Private Key as an encrypted QR.</figure>
                                        </section>
                                    </section>

                                    <!-- EXPORT AS QR CODE -->
                                    <section key="exportqr" v-if="exportType === EXPORT_TYPES.QR">
                                        <section class="export">
                                            <figure class="name">{{selected.name}}</figure>
                                            <section class="qr">
                                                <img :src="qr" />
                                            </section>
                                        </section>
                                    </section>


                                    <!-- EXPORT AS KEY -->
                                    <section key="exportkey" style="border-top:1px solid rgba(0,0,0,0.05); display:flex; flex:1;" v-if="exportType === EXPORT_TYPES.KEY">


                                        <transition name="slide-left" mode="out-in">
                                            <section key="selectkeyformat" class="keypair" v-if="!exposedPrivateKey">
                                                <section class="export">
                                                    <figure class="name">Select a Key Format</figure>
                                                </section>
                                                <section class="accounts" style="border-top:1px solid rgba(0,0,0,0.05);">
                                                    <section class="account" v-for="(value, key) in Blockchains" @click="exportKeyFor(value)">
                                                        <section class="info">
                                                            <figure class="name">{{key}}</figure>
                                                            <figure class="description">Select the {{key}} format if you want to use it for other {{key}} wallets.</figure>
                                                        </section>
                                                    </section>
                                                </section>

                                            </section>

                                            <section class="new-keypair" key="exposedkey" v-else>
                                                <section class="button wide" @click="copyKey">
                                                    <figure class="name">Click to Copy</figure>
                                                    <figure class="description">When you click this button your key will be copied to your clipboard.</figure>
                                                </section>
                                            </section>
                                        </transition>


                                    </section>
                                </transition>
                            </section>
                        </section>




                    </transition>

                </section>



            </transition>



        </section>

    </section>
</template>

<script>
    // TODO: Holy shit extrapolate me already.

    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import {Blockchains, BlockchainsArray, blockchainName} from '../../models/Blockchains'
    import Keypair from '../../models/Keypair'
    import {Popup} from '../../models/popups/Popup'

    import AccountService from '../../services/AccountService'
    import KeyPairService from '../../services/KeyPairService'
    import PopupService from '../../services/PopupService'
    import QRService from '../../services/QRService'
    import PasswordService from '../../services/PasswordService'
    import PriceService from '../../services/PriceService'
    import ResourceService from '../../services/ResourceService'

    import ElectronHelpers from '../../util/ElectronHelpers';
    import IdGenerator from '../../util/IdGenerator';
    import Crypto from '../../util/Crypto';

    import ExternalWallet, {EXT_WALLET_TYPES, EXT_WALLET_TYPES_ARR} from '../../models/ExternalWallet';

    const IMPORT_TYPES = {
        TEXT:'Text',
        HARDWARE:'Hardware',
    }

    const EXPORT_TYPES = {
        QR:'QR Code',
        KEY:'Key',
    }

    let saveTimeout;
    let keyTimeout;
    let hardwareTimeout;

    export default {
        data(){ return {
            searchTerms:'',
            displayPrivateKeyField:false,

            BlockchainsArray,
            Blockchains,
            selected:null,
            publicKey:null,
            error:null,
            status:null,
            isNew:false,
            showingSecrets:false,
            flashingNameError:false,

            selectedAccount:null,
            resources:null,

            EXPORT_TYPES:EXPORT_TYPES,
            exporting:null,
            exportType:null,
            qr:null,
            exposedPrivateKey:null,

            IMPORT_TYPES:IMPORT_TYPES,
            EXT_WALLET_TYPES:EXT_WALLET_TYPES_ARR,
            importing:false,
            importType:null,
            camera:false,
            hardwareReady:false,
            hardwareType:EXT_WALLET_TYPES.LEDGER,
            hardwareBlockchain:Blockchains.EOSIO,
        }},
        mounted(){

        },
        destroyed(){
            clearInterval(hardwareTimeout);
        },
        computed:{
            ...mapState([
                'popups',
                'seed'
            ]),
            ...mapGetters([
                'nextPopIn',
                'keypairs',
                'accounts',
            ]),
            vaultEntries(){
                const terms = this.searchTerms.toLowerCase().trim();
                return this.keypairs.filter(keypair => {
                    if(keypair.name.toLowerCase().indexOf(terms) > -1) return true;
                    if(keypair.accounts().some(x => x.name.toLowerCase().indexOf(terms) > -1)) return true;
                    return false;
                });
            },
            keyNameError(){
                if(this.flashingNameError) return false;
                if(!this.selected) return false;
                if(!this.selected.name.trim().length) return 'Enter a name for this Vault Entry';
                if(this.keypairs.find(x => x.id !== this.selected.id && x.name.toLowerCase() === this.selected.name.toLowerCase())) return 'A Vault Entry with this name already exists.';
                return false;
            },
            uniqueAccounts(){
                return this.selected.accounts().reduce((acc, account) => {
                    if(!acc.find(x => account.sendable() === x.sendable())) acc.push(account);
                    return acc;
                }, [])
            },
            outOfEOSResources(){
                if(this.selectedAccount.blockchain() !== Blockchains.EOSIO) return false;
                const cpu = this.resources.find(x => x.name === 'CPU');
                if(!cpu) return false;
                return cpu.available <= 6000;
            }
        },
        methods:{
            blockchainName,
            linkManually(){
                PopupService.push(Popup.linkOrCreateAccount(this.selected, done => {
                    console.log('done', done);
                }));
            },
            usesResources(account){
                return ResourceService.usesResources(account);
            },
            authorities(account){
                return this.accounts.filter(x => x.sendable() === account.sendable() && x.network().unique() === account.network().unique())
                    .map(x => x.authority).join(', ')
            },
            goToCPUEmergency(){
                ElectronHelpers.openLinkInBrowser(`https://cpuemergency.com/?account=${this.selectedAccount.sendable()}`);
            },
            copy(text, note){
                ElectronHelpers.copy(text);
                PopupService.push(Popup.snackbar(note));
            },
            qrScanned(qr){
                this.camera = false;
                try {
                    const {data, salt} = JSON.parse(qr);
                    const tryDecryption = () => {
                        PopupService.push(Popup.textPrompt(
                            'Decrypt Private Key',
                            'Please enter the password/pin this QR code is encrypted with.',
                            'asterisk', 'Okay',
                            {placeholder:'Enter Password/PIN', type:'password'},
                            async pass => {
                                this.status = 'Decrypting Secure Private Key';
                                const privateKey = await QRService.decryptQR(data, salt, pass).catch(() => null);
                                if(!privateKey || typeof privateKey !== 'object' || !privateKey.hasOwnProperty('data')){
                                    return tryDecryption();
                                }

                                this.selected.privateKey = privateKey.data;
                                this.selected.hash();

                                setTimeout(async () => {
                                    await KeyPairService.makePublicKeys(this.selected);
                                    this.keyImported("A Key was imported.");
                                }, 1000);
                            }))
                    };

                    tryDecryption();
                } catch(e){
                    this.error = 'Could not scan encrypted QR code.';
                }
            },
            saveQR(){

            },
            addOrBack(){
                if(this.$tours['scatter']) this.$tours['scatter'].stop();

                if(this.error) this.error = null;
                if(this.status) this.status = null;

                if(this.exposedPrivateKey)  return this.exposedPrivateKey = null;
                if(this.exportType)  return this.exportType = null;
                if(this.exporting)  return this.exporting = null;
                if(this.importType) return this.importType = null;
                if(this.importing)  return this.importing = false;
                if(this.selectedAccount)  return this.selectedAccount = null;
                if(this.selected)   return this.selectKeypair();
                this.newKeypair();
            },
            close(){
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            selectKeypair(keypair){
                this.exporting = false;
                this.exportType = null;
                this.isNew = false;
                this.selected = keypair ? keypair.clone() : null;
            },
            newKeypair(){
                this.selected = Keypair.placeholder();
                this.isNew = true;
            },
            async createQR(){
                this.qr = await QRService.createQR(this.selected.privateKey);
                this.exportType = EXPORT_TYPES.QR;
            },
            exportKeyFor(blockchain){
                PopupService.push(
                    Popup.textPrompt("Confirm Password", "Enter your current password.", "unlock", "Okay", {
                        placeholder:'Enter Password',
                        type:'password'
                    }, async password => {
                        if(!password || !password.length) return;
                        if(!await PasswordService.verifyPassword(password)){
                            this.close();
                            this.$router.push('/');
                            return PopupService.push(Popup.prompt("Bad Password", "The password you entered was incorrect.", "ban", "Okay"));
                        }

                        this.selected.decrypt(this.seed);
                        this.exposedPrivateKey = Crypto.bufferToPrivateKey(this.selected.privateKey, blockchain);
                    }))
            },
            copyKey(){
                ElectronHelpers.copy(this.exposedPrivateKey);
                PopupService.push(Popup.snackbar('Key copied to clipboard.'))
                this.exposedPrivateKey = null;
            },
            async removeKeypair(){
                PopupService.promptGuard(Popup.prompt(
                    "Deleting Vault Entry", "Before you do this make sure you have a backup of this Vault Entry's Private Key.",
                    "trash-o", "Delete"
                ), async accepted => {
                    if(accepted) {
                        await KeyPairService.removeKeyPair(this.selected);
                        this.selectKeypair();
                    }
                });

            },
            async generateKey(){
                this.status = 'Generating new Keys';
                setTimeout(async () => {
                    await KeyPairService.generateKeyPair(this.selected);
                    this.keyImported("A new Key was generated.");
                }, 1000);
            },
            async keyImported(snackbar){
                const isHardware = !!this.selected.external;
                const existing = this.keypairs.find(x => {
                    const existingHardware = isHardware && x.external && this.selected.external.publicKey === x.external.publicKey;
                    return existingHardware || (x.keyHash === this.selected.keyHash && x.id !== this.selected.id)
                });

                if(existing){
                    this.status = null;
                    this.error = `This Private Key already exists under the name ${existing.name}`;
                    return false;
                }

                if(this.keyNameError) this.selected.name = `VaultEntry-${IdGenerator.text(10)}`;

                if(!isHardware) await KeyPairService.makePublicKeys(this.selected);
                if(!this.selected.publicKeys.length) return false;

                await KeyPairService.saveKeyPair(this.selected);
                this.status = 'Linking available accounts. Please wait.';
                await AccountService.importAllAccounts(this.selected);
                PopupService.push(Popup.snackbar(snackbar));

                this.isNew = false;
                this.status = null;
                this.exporting = null;
                this.exportType = null;
                this.importType = null;
                this.importing = false;
                this.selected = this.keypairs.find(x => x.id === this.selected.id).clone();
                await PriceService.getBalances();

            },
            async testKey(){
                if(this.status) return false;
                this.status = 'Checking if Private Key is valid.';

                if(typeof this.selected.privateKey === 'string'){
                    this.selected.privateKey = this.selected.privateKey.trim().replace(/\W/g, '');
                }

                if(!KeyPairService.isValidPrivateKey(this.selected)) return this.status = null;

                setTimeout(async () => {
                    this.status = 'Creating multi-blockchain profile from Private Key.';
                    setTimeout(async() => {
                        await KeyPairService.convertHexPrivateToBuffer(this.selected);
                        this.selected.hash();
                        this.keyImported('New Vault Entry created.')
                    }, 2000);
                }, 2000);
            },

            async refreshAccounts(){
                this.status = 'Refreshing Links';
                setTimeout(async() => {
                    await AccountService.importAllAccounts(this.selected);
                    this.status = null;
                }, 1000);
            },

            async watchHardware(){
                if(this.hardwareReady) return;

                await this.setupHardware();
                await new Promise(r => setTimeout(() => r(true), 500));

                const connectedOrError = await this.selected.external.interface.canConnect();

                if(connectedOrError === null) {
                    this.error = 'Error connecting to hardware';
                    this.setupHardware();
                    return false;
                }

                if(typeof connectedOrError === 'string'){
                    this.hardwareReady = false;
                    this.error = connectedOrError;
                    return false;
                }

                this.error = null;
                this.hardwareReady = true;
            },
            setupHardware(){
                this.selected.external = new ExternalWallet(this.hardwareType, this.hardwareBlockchain);
                this.hardwareReady = false;
            },
            async importKeyFromHardware(){
                if(await KeyPairService.loadFromHardware(this.selected)) {
                    await this.keyImported('Hardware Linked');
                }
            },
            async selectAccount(account){
                if(!this.usesResources(account)) return;
                this.resources = null;
                this.selectedAccount = account;
                this.resources = await ResourceService.getResourcesFor(account);
            },
            async moderateResource(resource){
                if(await ResourceService.moderateResource(resource, this.selectedAccount))
                    this.resources = await ResourceService.getResourcesFor(this.selectedAccount);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        watch:{
            ['selected.name'](){
                this.error = null;
                clearTimeout(saveTimeout);
                if(!this.selected) return;
                if(!this.isNew) saveTimeout = setTimeout(async () => {
                    if(!this.keyNameError && this.selected.name !== this.keypairs.find(x => x.id === this.selected.id).name) {
                        await KeyPairService.updateKeyPair(this.selected);
                    }
                }, 500);
            },
            ['selected.privateKey'](){
                if(!this.isNew) return false;
                clearTimeout(keyTimeout);
                keyTimeout = setTimeout(async () => {
                    this.testKey();
                }, 500);
            },
            ['importType'](){
                if(hardwareTimeout) clearInterval(hardwareTimeout);
                if(this.importType === IMPORT_TYPES.HARDWARE){
                    this.selected.external = new ExternalWallet();
                    hardwareTimeout = setInterval(() => this.watchHardware(), 800);
                } else {
                    this.hardwareReady = false;
                    this.selected.external = null;

                    if(this.importType === IMPORT_TYPES.TEXT){
                        this.$nextTick(() => {
                            setTimeout(() => {
                                if(this.$refs.focuser)
                                    this.$refs.focuser.focus();
                            }, 500)
                        })
                    }
                }
            },
            ['hardwareType'](){
                this.setupHardware();
            },
            ['hardwareBlockchain'](){
                this.setupHardware();
            },
            ['selected.external.addressIndex'](){
                if(this.selected && this.selected.external)
                    this.selected.external.interface
                        .setAddressIndex(this.selected.external.addressIndex);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .flexer {
        display:flex; flex-direction: column; flex:1;
    }

    .vault {
        width:500px;
        height:calc(100vh - 100px);
        display:flex;
        flex-direction: column;
        overflow: hidden;

        .loading {
            width:100%;
            height:150px;
            flex:1;
            display:flex;
            justify-content: center;
            align-items: center;
            font-size: 40px;
            color:$mid-light-grey;
            text-align:center;
        }

        .head {
            padding:40px 80px;
            text-align:center;
            position: relative;
            height:165px;

            .title {
                font-size: 34px;
                margin-bottom:10px;
                font-weight: 800;
                color:$dark-grey;
            }

            .description {
                font-size: 14px;
                color:$mid-dark-grey;
            }

            .error, .status {
                .title {
                    color:$red;
                    animation: pulsate 1s ease-out;
                    animation-iteration-count: infinite;
                }

                .description {
                    color:$black;
                }
            }

            .status {
                .title {
                    color:$light-blue;
                }
            }

            .add-keypair, .remove-keypair, .refresh-accounts, .show-qr, .show-cam, .export-keypair {
                position: absolute;
                opacity:1;
                top:20px;
                visibility: visible;
                cursor: pointer;
                height:40px;
                padding:0 12px;
                display:flex;
                justify-content:center;
                align-items: center;
                border-radius:2px;
                font-size: 16px;

                background:transparent;
                border:1px solid rgba(0,0,0,0.2);
                color:rgba(0,0,0,0.3);

                transition: all 0.2s ease;
                transition-property: background, color, border, opacity, top, visibility;

                span {
                    font-weight: bold;
                    font-size: 13px;
                }

                &:hover {
                    border:1px solid $light-blue;
                    background:$light-blue;
                    color:#fff;
                }

                i {
                    transition:transform 0.5s ease;
                    transition-delay: 0s;
                }

                &.cancel {
                    i {
                        transform:rotate(45deg);
                        transition-delay: 0.5s;
                    }
                    animation: flash-blue 0.5s ease;
                }

                &.hide {
                    opacity:0;
                    top:-20px;
                    visibility: hidden;
                }

                @keyframes flash-blue {
                    0%, 100% {
                        background:transparent;
                        border:1px solid rgba(0,0,0,0.2);
                        color:rgba(0,0,0,0.3);
                    }
                    50% {
                        border:1px solid $light-blue;
                        background:$light-blue;
                        color:#fff;
                        transform:scale(1.3);
                    }
                }
            }

            .add-keypair {
                left:20px;
            }

            .remove-keypair {
                opacity:0;
                top:-20px;
                visibility: hidden;

                right:65px;

                &:hover {
                    border:1px solid $red;
                    background:$red;
                    color:#fff;
                }

                &.show {
                    opacity:1;
                    top:20px;
                    visibility: visible;
                }
            }

            .export-keypair {
                opacity:0;
                top:-20px;
                visibility: hidden;

                right:110px;

                &.show {
                    opacity:1;
                    top:20px;
                    visibility: visible;
                }
            }

            .refresh-accounts {
                transition-delay: 0.1s;
                opacity:0;
                top:-20px;
                visibility: hidden;

                right:20px;

                &.show {
                    opacity:1;
                    top:20px;
                    visibility: visible;
                }
            }

            .show-qr {
                transition-delay: 0.2s;
                opacity:0;
                top:-20px;
                visibility: hidden;
                right:20px;

                &.show {
                    opacity:1;
                    top:20px;
                    visibility: visible;
                }
            }

            .show-cam {
                opacity:0;
                top:-20px;
                visibility: hidden;
                right:20px;

                &.show {
                    opacity:1;
                    top:20px;
                    visibility: visible;
                }
            }
        }

        $searchheight:35px;
        .search {
            border-top:1px solid rgba(0,0,0,0.1);
            height:$searchheight;
            line-height:$searchheight;
            background:rgba(0,0,0,0.03);
            overflow: hidden;
            padding:0 30px;

            .icon {
                float:left;
                margin-right:10px;
                color:rgba(0,0,0,0.2);
            }

            input {
                float:left;
                border:0;
                outline:0;
                width:calc(100% - 50px);
                height:$searchheight;
                background:transparent;
                font-size: 11px;

            }
        }

        .scroller {
            flex:1;
            display:flex;
            flex-direction: column;
            overflow-y:auto;
            overflow-x:hidden;
        }

        .accounts {
            flex:0 0 auto;
            /*overflow-y:auto;*/
            max-height:1200px;
            transition:max-height 0.5s ease;


            &.hidden {
                max-height:0;
                overflow:hidden;
            }

            .account {
                flex:1 0 auto;
                padding:15px 30px;
                background:transparent;
                transition:all 0.2s ease;
                transition-property: background, padding;
                overflow: hidden;
                display:flex;
                justify-content: center;
                align-items: center;

                &:not(.static){
                    cursor: pointer;
                }

                &.copy {
                    cursor: grabbing;
                }

                &:not(:last-child){
                    border-bottom:1px solid rgba(0,0,0,0.05);
                }

                .info {
                    width:calc(100% - 20px);
                    float:left;

                    .name {
                        font-size: 16px;
                        font-weight: 500;
                    }

                    .description {
                        margin-top:3px;
                        font-size: 11px;

                        &.linked-account {
                            font-size: 9px;
                            font-weight: bold;
                            color:$mid-dark-grey;
                            margin-bottom:5px;
                        }

                        i {
                            color:$dark-grey;
                            margin-right:3px;
                        }
                    }
                }

                .icon {
                    width:20px;
                    float:left;
                    font-size: 18px;
                    color:rgba(0,0,0,0.1);
                    text-align:right;

                    transition: color 0.5s ease;
                }

                &:hover {
                    &:not(.static){
                        background:rgba(0,0,0,0.015);
                        padding:15px 35px;

                        .icon {
                            color:rgba(0,0,0,0.4);
                        }
                    }
                }
            }
        }

        .breaker {
            flex:0 0 auto;
            border-top:1px solid rgba(0,0,0,0.4);
            border-bottom:1px solid rgba(0,0,0,0.05);
            height:40px;
            line-height:40px;
            background:rgba(0,0,0,0.03);
            overflow: hidden;
            padding:0 30px;
            font-size: 11px;
            cursor: pointer;
            text-align:center;
            font-weight: 600;
            color:$medium-grey;

            transition: all 0.2s ease;
            transition-property: background, border, color;

            &:hover {
                background:$light-blue;
                border-top:1px solid $dark-blue;
                border-bottom:1px solid $dark-blue;
                color:#fff;
            }
        }

        .export {
            padding:30px;
            width:100%;

            .name {
                width:100%;
                text-align:center;
                font-size: 18px;
                color:$dark-grey;
            }

            .qr {
                width:100%;
                display:flex;
                justify-content: center;
                align-items: center;

                img {

                }
            }
        }

        .keypair {
            flex:1;
            overflow-y:auto;
            overflow-x: hidden;
            display:flex;
            flex-direction: column;
            position: relative;
            opacity:1;
            transition: opacity 0.4s ease;

            &.disabled {
                opacity:0.2;
                pointer-events: none;
            }

            .head {
                background:$light-blue;
                padding:20px;
                height:auto;

                transition: background 0.4s ease;

                .name {

                    input {
                        font-size:24px;
                        background:transparent;
                        border:0;
                        outline:0;
                        width:100%;
                        text-align:center;
                        color:#fff;
                        border-bottom:1px dashed rgba(255,255,255,0);
                        margin-bottom: 6px;
                        transition:all 1.6s ease;
                        transition-property: border;

                        $placeholdercolor:#fff;
                        &::-webkit-input-placeholder { color: $placeholdercolor; }
                        &::-moz-placeholder { color: $placeholdercolor; }
                        &:-ms-input-placeholder { color: $placeholdercolor; }
                        &:-moz-placeholder { color: $placeholdercolor; }

                        &:focus {
                            border-bottom:1px dashed rgba(255,255,255,0.5);

                        }
                    }
                }

                &.no-name {
                    background:$red;

                    .name {
                        input {
                            border-bottom:1px dashed rgba(255,255,255,0.5);
                        }
                    }
                }

                .description {
                    color:#fff;
                    font-size: 13px;
                }
            }

            .new-keypair {
                background:rgba(0,0,0,0.03);
                flex:1;
                overflow-y:auto;

                padding:50px;
            }

            .import-hardware {
                flex:1;
                background:rgba(0,0,0,0.05);
                padding:40px;
            }

            .input-keypair {
                flex:1;
                background:rgba(0,0,0,0.05);
                padding:40px;

                .inputs {
                    position: relative;

                    label {
                        font-size: 13px;
                        color:$dark-grey;
                    }

                    input {
                        width:100%;
                        border:0;
                        outline:0;
                        background:transparent;
                        border-bottom:1px dashed rgba(0,0,0,0.2);
                        font-size: 18px;
                        margin-top:10px;

                        &.pad-right {
                            padding-right:25px;
                        }
                    }

                    .eye-icon {
                        position:absolute;
                        right:0;
                        bottom:5px;
                        cursor: pointer;
                    }
                }
            }

            .button {
                float:left;
                cursor: pointer;
                width:calc(50% - 10px);
                padding:20px 30px;
                background:#fff;
                text-align:center;
                border:1px solid rgba(0,0,0,0.1);
                box-shadow:0 1px 3px rgba(0,0,0,0.2), 0 4px 9px rgba(0,0,0,0.1);
                border-radius:4px;
                height:150px;
                display:flex;
                flex-direction: column;
                justify-content: center;
                align-items:center;

                transition:all 0.15s ease;
                transition-property: transform, box-shadow;

                &.wide {
                    width:100%;
                    margin-top:10px;
                    height:auto;
                }

                &:not(:last-child){
                    margin-bottom:20px;
                    margin-right:20px;
                }

                .name {
                    font-weight: bold;
                    color:$black;
                    font-size: 18px;
                    padding-bottom:10px;
                    border-bottom:1px solid rgba(0,0,0,0.1);
                    margin-bottom:10px;
                }

                .description {
                    font-size: 13px;
                    color:$dark-grey;
                }

                &:hover {
                    transform:translateY(-3px);
                    box-shadow:0 5px 8px rgba(0,0,0,0.1), 0 20px 8px -5px rgba(0,0,0,0.1);
                }

                &:active {
                    transform:translateY(0px);
                    box-shadow:0 1px 3px rgba(0,0,0,0.2), 0 4px 9px rgba(0,0,0,0.1);
                }
            }
        }
    }


    .stats {
        flex:1;
        display:flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding:20px 20px 80px;
        text-align:center;
        border-top:1px solid rgba(0,0,0,0.1);

        .stat {
            flex:1;

            .percentage {
                font-family: 'Open Sans', sans-serif;
                color: rgba(0,0,0,0.4);
                display:inline-block;
                padding:5px 10px;
                border-radius:4px;
                border:1px solid rgba(0,0,0,0.2);
                box-shadow:0 3px 5px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1);
                background:#fff;
                font-size: 18px;
                margin-top:5px;

                &.warning {
                    background:$red;
                    color:#fff;
                }
            }

            .radial-progress-container {
                display:inline-block;
                box-shadow: 0 3px 16px rgba(0,0,0,0.1), 0 12px 16px rgba(0,0,0,0.1);
                border-radius: 50%;
                margin:8px;

                transform:translateY(0px);
                transition: box-shadow 0.2s ease, transform 0.4s ease;

                &:hover {
                    transform:translateY(2px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1);
                }

                &:active {
                    transform:translateY(4px);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.1);
                }
            }

            .button {
                height:100px;
                width:100px;
                padding:10px;
                float:none;
                color:$black;
                font-size: 11px;
                border-radius:50%;

                &:hover {
                    transform:translateY(-3px);
                    box-shadow:0 16px 2px rgba(0,0,0,0.1), 0 10px 8px rgba(0,0,0,0.1);
                }

                &:active {
                    transform:translateY(0px);
                    box-shadow:0 1px 2px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.1);
                }
            }
        }
    }


</style>