<template>
    <aside class="auth">
        <section>


            <section class="fader" v-if="!loggingIn" :class="{'hide-all':leaving}">
                <figure class="closer" @click="quit">
                    <i class="fa fa-power-off"></i>
                </figure>
                <figure v-if="dPresses >= 10" class="deleter" @click="destroy" v-tooltip="'Destroy Scatter'">
                    <i class="fa fa-trash-o"></i>
                </figure>

                <section class="logo-container">
                    <figure class="grand-hotel logo">Scatter</figure>
                </section>

                <section class="inputs" v-if="isNewScatter">
                    <cin :focus="true" big="1" placeholder="Password" type="password" v-on:enter="create" :text="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                    <cin style="margin-top:35px;" big="1" placeholder="Confirm Password" type="password" v-on:enter="create" :text="confirmPassword" v-on:changed="changed => bind(changed, 'confirmPassword')"></cin>
                    <btn class="dropped" v-on:clicked="create" text="Create new Scatter" full="true" large="true"></btn>
                    <btn text="Import from Backup" v-on:clicked="importBackup" full="true"></btn>
                </section>

                <section class="inputs" v-else>
                    <cin :focus="true" big="1" placeholder="Password" type="password" :text="password" v-on:enter="unlock" v-on:changed="changed => bind(changed, 'password')"></cin>
                    <btn v-on:clicked="unlock" text="Unlock Scatter" full="true" large="true"></btn>
                </section>
            </section>

            <section v-if="loggingIn">
                <video id="intro" width="100%" height="100%" muted>
                    <source src="../../../static/logo_intro.mp4" type="video/mp4">
                </video>
            </section>


        </section>
    </aside>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {RouteNames} from '../../vue/Routing'

    import SocketService from '../../services/SocketService'
    import BackupService, {getFileLocation} from '../../services/BackupService'
    import PasswordService from '../../services/PasswordService'
    import StorageService from '../../services/StorageService'
    import PopupService from "../../services/PopupService";
    import {Popup} from '../../models/popups/Popup'
    const { remote } = window.require('electron');
    const fs = window.require('fs');

    import {Blockchains} from '../../models/Blockchains'
    import Crypto from "../../util/Crypto";

    export default {
        name: 'Auth',
        data () {return {
            password:'',
            confirmPassword:'',
            leaving:false,
            loggingIn:false,
            dPresses:0,
        }},
        computed: {
            isNewScatter(){
                return this.scatter === null;
            },
            ...mapState([
                'scatter'
            ])
        },
        mounted(){
            this.password = '';
            this.confirmPassword = '';

            document.addEventListener('keydown', this.modifyDPresses, true);


            const test = {
                [Blockchains.EOSIO]:{
                    privateKeyBuffer:Crypto.privateKeyToBuffer('5K55tgv4RZ1zKgsBrTsVhVDmHBUr4akojWjTgaaxuEAYfduRjGs', Blockchains.EOSIO),
                    publicKey:'EOS4vFYEWz7SXrrXmjgSDjop91B6ct83GrXie66uDoQo7FuGpYRqB',
                    privateKeyBuffer2:Crypto.privateKeyToBuffer('5HxhvMnjVrGaCh8KWQpva151gnNScj9jieinTdp3nFfJP9QFL4m', Blockchains.EOSIO),
                    publicKey2:'EOS8eG7dZaknL7z4PZ8P9Luv6KovuQyRpN82Xv1D1vkMT7k8hM3GU'
                },
                [Blockchains.ETH]:{
                    privateKeyBuffer:Crypto.privateKeyToBuffer('a54c3cb607311b0e825b9fd3021f71c7a5d1b09d06e5fd56ba59dba8eb465b0f', Blockchains.ETH),
                    publicKey:'0x867da690465f264a6fd9efc1674d6a64e3d9f0d6',
                    privateKeyBuffer2:Crypto.privateKeyToBuffer('131e2a08ca84921b3ff5e6f785a0843805d9e2d338d261fc491069da39fc4520', Blockchains.ETH),
                    publicKey2:'0xf748926d9426f949b3c5453186b0e7cc56325612'
                },
                [Blockchains.TRX]:{
                    privateKeyBuffer:Crypto.privateKeyToBuffer('a54c3cb607311b0e825b9fd3021f71c7a5d1b09d06e5fd56ba59dba8eb465b0f', Blockchains.TRX),
                    publicKey:'TNEL588Ti6maTWBMwv4akEawdGFVgVCoRH',
                    privateKeyBuffer2:Crypto.privateKeyToBuffer('131e2a08ca84921b3ff5e6f785a0843805d9e2d338d261fc491069da39fc4520', Blockchains.TRX),
                    publicKey2:'TYWiqq9jJnh1LMVRPMwSVue2fmzxbFBfyg'
                },
            }

            Object.keys(test).map(blockchain => {
                const {privateKeyBuffer, publicKey, privateKeyBuffer2, publicKey2} = test[blockchain];
                const encryptionKey = Crypto.getEncryptionKey(privateKeyBuffer, publicKey, 1);
                const encryptionKey2 = Crypto.getEncryptionKey(privateKeyBuffer2, publicKey2, 1);



                console.log(`${blockchain.toUpperCase()} Encryption Key: ${encryptionKey}`);
                const encrypted = Crypto.encryptMessage('helloworld', encryptionKey);
                console.log('encrypted: ', encrypted);
                const decrypted = Crypto.decryptMessage(encrypted, encryptionKey);
                console.log('decrypted:', decrypted);

            })



        },
        destroyed(){
            document.removeEventListener('keydown', this.modifyDPresses, true);
        },
        methods:{
            modifyDPresses(e){
                if(e.which === 68) this.dPresses++;
                else this.dPresses = 0;
            },
            pushTo(route){
                this.$router.push({name:route});
            },
            async create(){
                if(!PasswordService.isValidPassword(this.password, this.confirmPassword)) return false;
                await this[Actions.CREATE_SCATTER](this.password);
                await this[Actions.SET_SPLASH](true);
                this.pushTo(RouteNames.ONBOARDING);
            },
            async unlock(){
                const showIntro = false;
                this.leaving = true;

                const logIn = async () => {
                    await this[Actions.SET_SPLASH](true);
                    await SocketService.initialize();
                    this.pushTo(RouteNames.HOME);
                };

                setTimeout(async () => {
                    await this[Actions.SET_SEED](this.password);
                    await this[Actions.LOAD_SCATTER]();

                    if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
                        if(!showIntro) return logIn();

                        const canPlayIntro = !!document.createElement('video').canPlayType &&
                            !!document.createElement('video').canPlayType('video/mp4');

                        if(!canPlayIntro) return logIn();

                        this.loggingIn = true;
                        this.$nextTick(() => {
                            const vid = document.getElementById('intro');
                            if(!vid) return logIn();

                            vid.playbackRate = 2;
                            vid.play();

                            setTimeout(async () => logIn(), 5000)
                        })

                    } else {
                        this.leaving = false;
                        PopupService.push(Popup.snackbar("Bad Password", "ban"))
                    }
                }, 400)
            },
            importBackup(){
                const file = getFileLocation()[0];
                if(!file) return;

                fs.readFile(file, 'utf-8', (err, data) => {
                    if(err) return alert("Could not read the backup file.");

                    const [obj, salt] = data.split('|SLT|');
                    if(!obj || !salt) return alert("Error parsing backup");

                    StorageService.setSalt(salt);
                    StorageService.setScatter(obj);
                    location.reload();
                });
            },
            quit(){
                remote.app.quit();
            },
            destroy(){
                PopupService.push(Popup.prompt("Destroying Scatter", "This action is irreversible. Are you sure you want to destroy your Scatter?", "trash-o", "Yes", async accepted => {
                    if(!accepted) return false;

                    await SocketService.close();
                    await StorageService.removeScatter();
                    this.$router.push('/');
                }, "No"))
            },
            ...mapActions([
                Actions.SET_SEED,
                Actions.CREATE_SCATTER,
                Actions.LOAD_SCATTER,
                Actions.SET_SPLASH
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .fader {
        opacity:1;
        transition:opacity 0.4s ease;

        &.hide-all {
            opacity:0;
        }

        .closer, .deleter {
            cursor: pointer;
            position:absolute;
            top:30px;
            right:40px;
            font-size: 36px;
            color:rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            transition-property: color;

            &:hover {
                color:$light-blue;
            }
        }

        .deleter {
            right:90px;
        }
    }

    .auth {
        width:100%;
        height:100vh;
        display:flex;
        justify-content: center;
        align-items: center;

        .logo-container {
            padding:0 80px 50px;
            text-align:center;

            .logo {
                font-size:140px;
                line-height:140px;
                color:$light-blue;

                animation: float 2s ease-out;
                animation-iteration-count: infinite;
            }



            .tagline {
                font-size:24px;
                color:rgba(0,0,0,0.2);
            }
        }

        .inputs {
            max-width:350px;
            margin:0 auto;

            .auth-text {
                font-size:13px;
            }

            .dropped {
                margin-top:30px;
            }
        }
    }

</style>
