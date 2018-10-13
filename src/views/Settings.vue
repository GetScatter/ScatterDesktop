<template>
    <section class="settings">

        <section class="menu" style="flex:1;">
            <section class="head">
                <figure class="description">
                    If you don't know what a setting does don't change it.
                </figure>
            </section>

            <section class="items-list scrollable" v-if="selectedOption">
                <section class="item" :class="{'active':selectedOption.name === option.name, 'flash-red':option.flash}"
                         v-for="option in settingsOptions" @click="selectOption(option)">
                    <figure class="title" :class="{'locked':option.locked && !unlocked}">
                        <i v-if="option.locked && !unlocked" class="fa fa-lock"></i>
                        {{option.name}}
                    </figure>
                    <figure class="description">{{option.description}}</figure>
                </section>
            </section>
        </section>

        <section v-if="selectedOption" style="flex:3; overflow:hidden; display:flex; flex-direction: column;">
            <figure class="panel-head">
                <section class="version">
                    Scatter Desktop v{{version}}
                    <figure class="update-button" v-if="needsUpdate" @click="openUpdateLink">Update Available</figure>
                </section>
                <span class="console fa fa-code" @click="openConsole"></span>
            </figure>
            <section class="transitioner">
                <transition name="slide-left" mode="out-in">
                    <settings-language v-if="selectedOption.name === settingsOptions.LANGUAGE.name"></settings-language>
                    <settings-explorer v-if="selectedOption.name === settingsOptions.EXPLORER.name"></settings-explorer>
                    <settings-networks v-if="selectedOption.name === settingsOptions.NETWORKS.name"></settings-networks>
                    <settings-password v-if="selectedOption.name === settingsOptions.PASSWORD.name"></settings-password>
                    <settings-backup v-if="selectedOption.name === settingsOptions.BACKUP.name"></settings-backup>
                    <settings-destroy v-if="selectedOption.name === settingsOptions.DESTROY.name"></settings-destroy>
                    <!--<settings-nonce v-if="selectedOption.name === settingsOptions.NONCE.name"></settings-nonce>-->
                    <settings-pin v-if="selectedOption.name === settingsOptions.PIN.name"></settings-pin>
                </transition>
            </section>

        </section>


        <!--<keypair v-if="selectedKeypair" :key="selectedKeypair.publicKey" :kp="selectedKeypair"></keypair>-->

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Popup} from '../models/popups/Popup'
    import PopupService from '../services/PopupService'
    import PasswordService from '../services/PasswordService'
    import UpdateService from '../services/UpdateService'
    import WindowService from '../services/WindowService'
    import ElectronHelpers from '../util/ElectronHelpers'

    const SettingsOptions = {
        LANGUAGE:{ flash:false, locked:false, name:'Language', description:'Set Scatter\s language.' },
        EXPLORER:{ flash:false, locked:false, name:'Explorers', description:'Select Preferred Block Explorers.' },
        PIN:{ flash:false, locked:true, name:'PIN', description:'Set or disabled your secondary PIN.' },
        NETWORKS:{ flash:false, locked:true, name:'Networks', description:'Add or Remove Networks.' },
//        NONCE:{ flash:false, locked:true, name:'Nonce', description:'Configure the popup nonce prefix.' },
        PASSWORD:{ flash:false, locked:true, name:'Password', description:'Change your password or regenerate your Mnemonic.' },
        BACKUP:{ flash:false, locked:true, name:'Backup', description:'Create a backup of your Scatter.' },
        DESTROY:{ flash:false, locked:true, name:'Destroy', description:'Destroy your instance of Scatter.' },
    };

    export default {
        data () {return {
            settingsOptions:SettingsOptions,
            selectedOption:null,
            unlocked:false,
            needsUpdate:false,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'version'
            ])
        },
        mounted(){
            this.selectedOption = SettingsOptions.LANGUAGE;
            UpdateService.needsUpdateNoPrompt().then(needsUpdate => {
                this.needsUpdate = needsUpdate ? needsUpdate[1] : false;
            })
        },
        methods: {
            openUpdateLink(){
                ElectronHelpers.openLinkInBrowser(this.needsUpdate);
            },
            openConsole(){ WindowService.openTools(); },
            selectOption(option){
                if((option.locked || false) && !this.unlocked) {
                    return this.unlock(option);
                }
                this.selectedOption = option;
            },
            unlock(option){
                PopupService.push(
                    Popup.textPrompt("Confirm Password", "Enter your current password.", "unlock", "Okay", {
                        placeholder:'Enter Password',
                        type:'password'
                    }, async password => {
                        if(!password || !password.length) return;
                        if(!await PasswordService.verifyPassword(password)){
                            this.$router.push('/');
                            return PopupService.push(Popup.prompt("Bad Password", "The password you entered was incorrect.", "ban", "Okay"));
                        }

                        this.unlocked = true;
                        this.selectOption(option);
                    }))
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";



    .settings {
        display:flex;
        flex-direction: row;

        .panel-head {
            height:50px;
            width:100%;
            background:$light-blue;
            flex: 0 0 auto;
            position: relative;

            .version {
                font-size: 13px;
                color:#fff;
                position:absolute;
                bottom:15px;
                left:15px;
                font-family: 'Open Sans', sans-serif;

                .update-button {
                    cursor: pointer;
                    border-radius:4px;
                    display:inline-block;
                    padding:2px 5px 3px;
                    margin-left:10px;
                    background:$red;
                    border:2px solid #fff;
                    font-size: 11px;
                    font-weight: bold;
                    transition: background 0.2s ease;

                    &:hover {
                        background:transparent;
                    }
                }
            }

            .console {
                font-size: 11px;
                color:#fff;
                position:absolute;
                bottom:10px;
                right:10px;
                cursor: pointer;
                padding:5px;
                border:1px solid #fff;
                border-radius:2px;
            }
        }

        .transitioner {
            display:flex;
            flex-direction:row;
            flex:1;
            overflow-y:auto;
            overflow-x:hidden;
          box-shadow:inset 1px 0 3px rgba(0, 0, 0, 0.1);
        }
    }

    .menu {
        flex:1;
        display:flex;
        flex-direction: column;
        background:$light-blue;
        position: relative;
        z-index:2;

        .bg {
            position:absolute;
            top:10px; bottom:0; left:0; right:0;
            background:#fff;
            z-index:-1;
        }


        .head {
            padding:40px;
            background:#fff;
            border-top-right-radius:8px;
            box-shadow:10px -10px 20px rgba(0,0,0,0.01);
            border-bottom:1px solid rgba(0,0,0,0.1);

            .title {
                font-size: 28px;
                font-weight: 600;
                margin-bottom:5px;
                color:$black;
            }

            .description {
                font-size: 16px;
                color:$dark-grey;
            }
        }
    }

    .items-list {
        background: #f8f8f8;

        .locked {
            color:$red;
        }

        .flash-red {
            background:$red;
            color:#fff !important;
            * { color:#fff; }
        }
    }
</style>
