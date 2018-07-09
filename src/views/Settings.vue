<template>
    <section>

        <section class="panel sub-menu">
            <section class="head">
                <i v-if="!unlocked" class="fa fa-unlock" @click="unlock"></i>
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

        <section v-if="selectedOption">
            <settings-language v-if="selectedOption.name === settingsOptions.LANGUAGE.name"></settings-language>
            <!--<settings-autolock v-if="selectedOption.name === settingsOptions.AUTO_LOCK.name"></settings-autolock>-->
            <settings-password v-if="selectedOption.name === settingsOptions.PASSWORD.name"></settings-password>
            <settings-backup v-if="selectedOption.name === settingsOptions.BACKUP.name"></settings-backup>
            <settings-destroy v-if="selectedOption.name === settingsOptions.DESTROY.name"></settings-destroy>
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

    const SettingsOptions = {
        LANGUAGE:{ flash:false, locked:false, name:'Language', description:'Set Scatter\s language.' },
//        AUTO_LOCK:{ flash:false, locked:false, name:'Auto Lock', description:'Automatically lock Scatter when idle.' },
        PASSWORD:{ flash:false, locked:true, name:'Password', description:'Change your password or regenerate your Mnemonic.' },
        BACKUP:{ flash:false, locked:true, name:'Backup', description:'Create a backup of your Scatter.' },
        DESTROY:{ flash:false, locked:true, name:'Destroy', description:'Destroy your instance of Scatter.' },
    };

    export default {
        data () {return {
            settingsOptions:SettingsOptions,
            selectedOption:null,
            unlocked:false,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([

            ])
        },
        mounted(){
            this.selectedOption = SettingsOptions.LANGUAGE;
        },
        methods: {
            selectOption(option){
                if((option.locked || false) && !this.unlocked) {
                    option.flash = true;
                    setTimeout(() => option.flash = false, 300);
                    setTimeout(() => {
                        PopupService.push(Popup.prompt("Unlock Sensitive Settings", "You have to unlock sensitive settings first by clicking the unlock icon on the top of the sub-menu", "unlock", "Okay"))
                    }, 500);
                    return false;
                }
                this.selectedOption = option;
            },
            unlock(){
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
                    }))
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .items-list {
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