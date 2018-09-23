<template>
    <section>

        <section class="vault" v-if="nextPopIn">

            <section class="head">

                <transition name="fade" mode="out-in">
                    <section key="noerror" v-if="!status && !error">
                        <figure class="title">Vault</figure>
                        <figure class="description">
                            Welcome to your vault. This is where you can view and manage all of your secrets.
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

                <figure class="add-keypair" :class="{'cancel':selected, 'hide':status}" v-tooltip="selected ? 'Go Back' : 'Add New Secret'" @click="addOrBack">
                    <i class="fa fa-plus"></i>
                </figure>

                <figure class="remove-keypair" :class="{'show':selected && !isNew && !exporting}" v-tooltip="'Remove'" @click="removeKeypair">
                    <i class="fa fa-ban"></i>
                </figure>

                <figure class="show-qr" :class="{'show':selected && !isNew && !exporting}" v-tooltip="'Export Secret'" @click="exportKeypair">
                    <i class="fa fa-qrcode"></i>
                </figure>

                <figure class="show-qr" :class="{'show':selected && !isNew && exporting}" v-tooltip="'Save QR'" @click="saveQR">
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

                        <!-- EXPORTING ( QR ) -->
                        <section key="exporting" class="export" v-if="exporting">
                            <figure class="name">{{selected.name}}</figure>
                            <section class="qr">
                                <img :src="exporting.qr" />
                            </section>
                        </section>

                        <!-- NOT EXPORTING -->
                        <section key="notexporting" v-else class="keypair" :class="{'disabled':status}">

                            <section key="keypairhead" class="head" :class="{'no-name':keyNameError}">
                                <figure class="name">
                                    <input placeholder="Name this Secret" v-model="selected.name" />
                                </figure>

                                <transition name="slide-left" mode="out-in">
                                    <figure key="named" class="description" v-if="!keyNameError">Names are just for organization.</figure>
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
                                                <figure class="description">{{pkey.key}}</figure>
                                            </section>
                                        </section>
                                    </section>

                                    <section class="breaker" @click="showingSecrets = !showingSecrets">
                                        {{showingSecrets ? 'Hide' : 'Show'}} Share-Safe Keys
                                    </section>

                                    <section class="accounts">
                                        <section class="account static" v-for="account in selected.accounts()">
                                            <section class="info">
                                                <figure class="name">{{account.formattedWithNetwork()}}</figure>
                                                <figure class="description">{{account.publicKey}}</figure>
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
                                                <label>Enter a Secret</label>
                                                <input v-model="selected.privateKey" type="password" />
                                            </section>
                                        </section>
                                    </transition>
                                </section>

                                <!-- IMPORTING HARDWARE -->
                                <section key="import-text" v-if="importType === IMPORT_TYPES.HARDWARE" class="new-keypair">
                                    Hardware
                                </section>
                            </transition>
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

    import Keypair from '../../models/Keypair'
    import {Popup} from '../../models/popups/Popup'

    import AccountService from '../../services/AccountService'
    import KeyPairService from '../../services/KeyPairService'
    import PopupService from '../../services/PopupService'
    import QRService from '../../services/QRService'
    import PasswordService from '../../services/PasswordService'

    import ElectronHelpers from '../../util/ElectronHelpers';
    import IdGenerator from '../../util/IdGenerator';

    const IMPORT_TYPES = {
        TEXT:'Text',
        HARDWARE:'Hardware',
    }

    let saveTimeout;
    let keyTimeout;

    export default {
        data(){ return {
            selected:null,
            publicKey:null,
            error:null,
            status:null,
            isNew:false,
            showingSecrets:false,
            flashingNameError:false,
            exporting:null,

            IMPORT_TYPES:IMPORT_TYPES,
            importing:false,
            importType:null,
            camera:false,
        }},
        mounted(){

        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([
                'nextPopIn',
                'keypairs',
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
                    console.log('data', data);
                    console.log('salt', salt);
                } catch(e){
                    this.error = 'Could not scan encrypted QR code.';
                }
            },
            saveQR(){

            },
            addOrBack(){
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
                this.isNew = false;
                this.selected = keypair ? keypair.clone() : null;
            },
            newKeypair(){
                this.selected = Keypair.placeholder();
                this.isNew = true;
            },
            async exportKeypair(){
                this.exporting = {
                    qr:await QRService.createQR(this.selected.privateKey)
                };
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
                const existing = this.keypairs.find(x => x.keyHash === this.selected.keyHash && x.id !== this.selected.id);
                if(existing){
                    this.status = null;
                    this.error = `This Secret already exists under the name ${existing.name}`;
                    return false;
                }

                if(this.keyNameError) this.selected.name = `Secret-${IdGenerator.text(10)}`;
                await KeyPairService.makePublicKeys(this.selected);
                if(!this.selected.publicKeys.length) return false;
                await KeyPairService.saveKeyPair(this.selected);
                this.status = 'Linking multiple blockchain accounts. Please wait.';
                await AccountService.importAllAccounts(this.selected);
                PopupService.push(Popup.snackbar(snackbar));

                this.isNew = false;
                this.status = null;
                this.exporting = null;
                this.importType = null;
                this.importing = false;
                this.selected = this.keypairs.find(x => x.id === this.selected.id).clone();

            },
            async testKey(){
                if(this.status) return false;
                this.status = 'Checking if Secret is valid.';

                if(typeof this.selected.privateKey === 'string'){
                    this.selected.privateKey = this.selected.privateKey.trim();
                }

                if(!KeyPairService.isValidPrivateKey(this.selected)) return this.status = null;

                setTimeout(async () => {
                    this.status = 'Converting secret to all Blockchains';
                    setTimeout(async() => {
                        await KeyPairService.convertHexPrivateToBuffer(this.selected);
                        this.selected.hash();
                        this.keyImported('A Secret was imported.')
                    }, 2000);
                }, 2000);
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

            .add-keypair, .remove-keypair, .show-qr, .show-cam {
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

            .show-qr {
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
            border-top:1px solid rgba(0,0,0,0.05);
            border-bottom:1px solid rgba(0,0,0,0.05);
            height:25px;
            line-height:25px;
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
            width:100%;
            flex:1;
            overflow-y:auto;
            overflow-x: hidden;
            display:flex;
            flex-direction: column;
            position: relative;

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
        }
    }


</style>