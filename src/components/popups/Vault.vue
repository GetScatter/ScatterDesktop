<template>
    <section>

        <section class="vault" v-if="nextPopIn">

            <section class="head">

                <transition name="fade" mode="out-in">
                    <section key="noerror" v-if="!status && !error">
                        <figure class="title">Vault</figure>
                        <figure class="description">
                            View and manage all your Secrets
                        </figure>
                    </section>
                    <section key="error" v-if="!status && error" class="error">
                        <figure class="title">Error</figure>
                        <figure class="description">
                            {{error}}
                        </figure>
                    </section>
                    <section key="status" v-if="status" class="status">
                        <figure class="title">Status</figure>
                        <figure class="description">
                            {{status}}
                        </figure>
                    </section>
                </transition>

                <figure class="add-keypair" :class="{'cancel':selected, 'hide':status, 'glow':!accounts.length}" v-tooltip="selected ? 'Go Back' : 'Add New Secret'" @click="addOrBack">
                    <i class="fa fa-plus"></i>
                </figure>

                <figure class="remove-keypair" :class="{'show':selected && !isNew && !exporting && !status}" v-tooltip="'Remove'" @click="removeKeypair">
                    <i class="fa fa-ban"></i>
                </figure>

                <figure class="refresh-accounts" :class="{'show':selected && !isNew && !exporting && !status}" v-tooltip="'Refresh Linked Accounts'" @click="refreshAccounts">
                    <i class="fa fa-refresh"></i>
                </figure>

                <figure class="show-qr" :class="{'show':selected && !isNew && !exporting && !status}" v-tooltip="'Export Secret'" @click="exporting = true">
                    <i class="fa fa-key"></i>
                </figure>

                <figure class="show-qr" :class="{'show':selected && !isNew && exporting && exportType === EXPORT_TYPES.QR && !status}" v-tooltip="'Save QR'" @click="saveQR">
                    <i class="fa fa-save"></i>
                </figure>

                <figure class="show-cam" :class="{'show':importType === IMPORT_TYPES.TEXT && !status && !camera}" v-tooltip="'Scan QR Code'" @click="camera = true">
                    <i class="fa fa-qrcode"></i>
                </figure>

                <figure class="show-cam" :class="{'show':importType === IMPORT_TYPES.TEXT && !status && camera}" v-tooltip="'Enter Manually'" @click="camera = false">
                    <i class="fa fa-asterisk"></i>
                </figure>
            </section>

            <transition :name="selected ? 'slide-left' : 'slide-right'" mode="out-in">

                <!-- KEY LIST -->
                <section key="nokey" v-if="!selected" class="scroller">
                    <section class="search">
                        <figure class="icon"><i class="fa fa-search"></i></figure>
                        <input placeholder="Search..." />
                    </section>

                    <section class="accounts scroller">
                        <section class="account" v-for="keypair in keypairs" @click="selectKeypair(keypair)">
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
                <section key="key" v-if="selected" style="display:flex; flex-direction: column; flex:1;">

                    <transition name="slide-right" mode="out-in">

                        <!-- NOT EXPORTING -->
                        <section key="notexporting" v-if="!exporting" style="display:flex; flex-direction: column; flex:1;">

                            <section class="keypair" :class="{'disabled':status}">
                                <section key="keypairhead" class="head" :class="{'no-name':keyNameError}">
                                    <figure class="name">
                                        <input placeholder="Name this Secret" v-model="selected.name" />
                                    </figure>

                                    <transition name="slide-left" mode="out-in">
                                        <figure key="named" class="description" v-if="!keyNameError">Click name to change it.</figure>
                                        <figure key="noname" class="description" v-else>{{keyNameError}}</figure>
                                    </transition>
                                </section>


                                <!-- EXISTING KEY -->
                                <transition name="slide-left" mode="out-in">
                                    <section key="showkey" v-if="!isNew" class="scroller">

                                        <section class="accounts" :class="{'hidden':!showingSecrets}">
                                            <section class="account copy" v-for="pkey in selected.publicKeys" @click="copy(pkey.key, `Copied ${pkey.blockchain.toUpperCase()} Share-Safe Key to Clipboard.`)">
                                                <section class="info">
                                                    <figure class="name">{{pkey.blockchain.toUpperCase()}}</figure>
                                                    <figure class="description"><i class="fa fa-user"></i> {{pkey.key}}</figure>
                                                </section>
                                            </section>
                                        </section>

                                        <section class="breaker" @click="showingSecrets = !showingSecrets">
                                            {{showingSecrets ? 'Collapse' : 'Expand'}}
                                        </section>

                                        <section class="accounts">
                                            <section class="account" v-for="account in selected.accounts()">
                                                <section class="info">
                                                    <figure class="name">{{account.formatted()}}</figure>
                                                    <figure class="description"><i class="fa fa-globe"></i> {{account.network().name}}</figure>
                                                </section>
                                            </section>
                                        </section>
                                    </section>

                                    <!-- NEW KEY -->
                                    <section key="newkeypair" v-if="isNew && !importing" class="new-keypair">
                                        <section class="button" @click="generateKey">
                                            <figure class="name">Generate</figure>
                                            <figure class="description">Click here if you need to generate a brand new Secret.</figure>
                                        </section>
                                        <section class="button" @click="importing = true;">
                                            <figure class="name">Import</figure>
                                            <figure class="description">Click here if you want to import a Secret from text or hardware.</figure>
                                        </section>
                                    </section>

                                    <!-- IMPORTING -->
                                    <section key="importing" v-if="isNew && importing && !importType" class="new-keypair">
                                        <section class="button" @click="importType = IMPORT_TYPES.TEXT;">
                                            <figure class="name">Text or QR</figure>
                                            <figure class="description">Click here to type, paste or scan your Secret in.</figure>
                                        </section>
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
                                                    <label><i class="fa fa-key"></i> Enter a Secret</label>
                                                    <input v-model="selected.privateKey" type="password" />
                                                </section>
                                            </section>
                                        </transition>
                                    </section>

                                    <!-- IMPORTING HARDWARE -->
                                    <section key="import-text" v-if="importType === IMPORT_TYPES.HARDWARE" class="import-hardware">
                                        <sel :selected="selected.external.type" v-if="selected.external"
                                             :options="EXT_WALLET_TYPES" v-on:changed="(x) => hardwareType = x"></sel>

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



                        <!-- EXPORTING -->
                        <section key="exporting" v-if="exporting" style="display:flex; flex-direction: column; flex:1;">
                            <section class="keypair">
                                <transition name="slide-left" mode="out-in">

                                    <!-- SELECT EXPORT TYPE -->
                                    <section key="exportselect" class="new-keypair" v-if="!exportType">
                                        <section class="button" @click="exportType = EXPORT_TYPES.KEY;">
                                            <figure class="name">Key</figure>
                                            <figure class="description">Export this Secret in Key format.</figure>
                                        </section>
                                        <section class="button" @click="createQR">
                                            <figure class="name">QR Code</figure>
                                            <figure class="description">Export this Secret as an encrypted QR.</figure>
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
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import {Blockchains} from '../../models/Blockchains'
    import Keypair from '../../models/Keypair'
    import {Popup} from '../../models/popups/Popup'

    import AccountService from '../../services/AccountService'
    import KeyPairService from '../../services/KeyPairService'
    import PopupService from '../../services/PopupService'
    import QRService from '../../services/QRService'
    import PasswordService from '../../services/PasswordService'
    import PriceService from '../../services/PriceService'

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
            Blockchains:Blockchains,
            selected:null,
            publicKey:null,
            error:null,
            status:null,
            isNew:false,
            showingSecrets:false,
            flashingNameError:false,

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
            keyNameError(){
                if(this.flashingNameError) return false;
                if(!this.selected) return false;
                if(!this.selected.name.trim().length) return 'You must name this Secret.';
                if(this.keypairs.find(x => x.id !== this.selected.id && x.name.toLowerCase() === this.selected.name.toLowerCase())) return 'A Secret with this name already exists.';
                return false;
            }
        },
        methods:{
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
                            'Decrypt Secret',
                            'Please enter the password/pin this QR code is encrypted with.',
                            'asterisk', 'Okay',
                            {placeholder:'Enter Password/PIN', type:'password'},
                            async pass => {
                                this.status = 'Decrypting Secure Secret';
                                const privateKey = await QRService.decryptQR(data, salt, pass).catch(() => null);
                                if(!privateKey || typeof privateKey !== 'object' || !privateKey.hasOwnProperty('data')){
                                    return tryDecryption();
                                }

                                this.selected.privateKey = privateKey.data;
                                this.selected.hash();

                                setTimeout(async () => {
                                    await KeyPairService.makePublicKeys(this.selected);
                                    this.keyImported("A Secret was imported.");
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
                if(this.error) this.error = null;
                if(this.status) this.status = null;

                if(this.exposedPrivateKey)  return this.exposedPrivateKey = null;
                if(this.exportType)  return this.exportType = null;
                if(this.exporting)  return this.exporting = null;
                if(this.importType) return this.importType = null;
                if(this.importing)  return this.importing = false;
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
                    "Deleting Secret", "Before you do this make sure you have a backup of this Secret.",
                    "trash-o", "Delete Secret"
                ), async accepted => {
                    if(accepted) {
                        await KeyPairService.removeKeyPair(this.selected);
                        this.selectKeypair();
                    }
                });

            },
            async generateKey(){
                this.status = 'Generating Secure Secret';
                setTimeout(async () => {
                    await KeyPairService.generateKeyPair(this.selected);
                    this.keyImported("A new Secret was generated.");
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
                    this.error = `This Secret already exists under the name ${existing.name}`;
                    return false;
                }

                if(this.keyNameError) this.selected.name = `Secret-${IdGenerator.text(10)}`;

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
                this.status = 'Checking if Secret is valid.';

                if(typeof this.selected.privateKey === 'string'){
                    this.selected.privateKey = this.selected.privateKey.trim();
                }

                if(!KeyPairService.isValidPrivateKey(this.selected)) return this.status = null;

                setTimeout(async () => {
                    this.status = 'Creating multi-blockchain profile from Secret.';
                    setTimeout(async() => {
                        await KeyPairService.convertHexPrivateToBuffer(this.selected);
                        this.selected.hash();
                        this.keyImported('A Secret was imported.')
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
                this.selected.external = new ExternalWallet(this.hardwareType);
                this.hardwareReady = false;
            },
            async importKeyFromHardware(){
                if(await KeyPairService.loadFromHardware(this.selected)) {
                    await this.keyImported('Hardware Linked');
                }
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
                }
            },
            ['hardwareType'](){
                this.setupHardware();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

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

            /*animation: pulsate 1s ease-out;*/
            /*animation-iteration-count: infinite;*/
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

            .add-keypair, .remove-keypair, .refresh-accounts, .show-qr, .show-cam {
                position: absolute;
                opacity:1;
                top:20px;
                visibility: visible;
                cursor: pointer;
                height:40px;
                width:40px;
                line-height:40px;
                text-align:center;
                display:inline-block;
                border-radius:2px;
                font-size: 16px;

                background:transparent;
                border:1px solid rgba(0,0,0,0.2);
                color:rgba(0,0,0,0.3);

                transition: all 0.2s ease;
                transition-property: background, color, border, opacity, top, visibility;

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

                right:110px;

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

            .refresh-accounts {
                transition-delay: 0.1s;
                opacity:0;
                top:-20px;
                visibility: hidden;

                right:65px;

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


</style>