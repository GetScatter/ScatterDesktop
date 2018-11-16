<template>
    <section>

        <back-bar v-on:back="back" />

        <section class="full-panel inner limited" v-if="selectedOption">

            <section class="split-panel dynamic no-divider">
                <section class="panel menu padded">

                    <label>Basics</label>

                    <section class="group-list">
                        <section class="item"
                                 v-for="item in generalItems"
                                 :class="{'selected':selectedOption.name === item.name}"
                                 @click="selectOption(item)">
                            {{item.name}}
                        </section>
                    </section>


                    <br><br>

                    <label class="red">Danger Zone</label>

                    <section class="group-list danger">
                        <section class="item"
                                 v-for="item in lockedItems"
                                 :class="{'selected':selectedOption.name === item.name}"
                                 @click="selectOption(item)">
                            {{item.name}}
                        </section>
                    </section>

                </section>

                <section class="panel">
                    <section v-if="selectedOption" class="settings-panels padded">
                        <br>
                        <h1>{{selectedOption.name}}</h1>

                        <SettingsGeneral v-if="selectedOption.name === settingsOptions.GENERAL.name" />
                        <SettingsLanguage v-if="selectedOption.name === settingsOptions.LANGUAGE.name" />
                        <SettingsTokens v-if="selectedOption.name === settingsOptions.TOKENS.name" />
                        <SettingsExplorer v-if="selectedOption.name === settingsOptions.EXPLORER.name" />
                        <SettingsNetworks v-if="selectedOption.name === settingsOptions.NETWORKS.name" />
                        <SettingsPassword v-if="selectedOption.name === settingsOptions.PASSWORD.name" />
                        <SettingsBackup v-if="selectedOption.name === settingsOptions.BACKUP.name" />
                        <SettingsDestroy v-if="selectedOption.name === settingsOptions.DESTROY.name" />
                        <SettingsPIN v-if="selectedOption.name === settingsOptions.PIN.name" />

                    </section>
                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Popup} from '../models/popups/Popup'
    import PopupService from '../services/PopupService'
    import PasswordService from '../services/PasswordService'

    import SettingsGeneral from '../components/panels/settings/SettingsGeneral.vue'
    import SettingsLanguage from '../components/panels/settings/SettingsLanguage.vue'
    import SettingsTokens from '../components/panels/settings/SettingsTokens.vue'
    import SettingsExplorer from '../components/panels/settings/SettingsExplorer.vue'
    import SettingsNetworks from '../components/panels/settings/SettingsNetworks.vue'
    import SettingsBackup from '../components/panels/settings/SettingsBackup.vue'
    import SettingsDestroy from '../components/panels/settings/SettingsDestroy.vue'
    import SettingsPassword from '../components/panels/settings/SettingsPassword.vue'
    import SettingsPIN from '../components/panels/settings/SettingsPIN.vue'

    const SettingsOptions = {
        GENERAL:{ locked:false, name:'General' },
        LANGUAGE:{ locked:false, name:'Language' },
        TOKENS:{ locked:false, name:'Tokens' },
        EXPLORER:{ locked:false, name:'Explorers' },
        PIN:{ locked:true, name:'PIN' },
        NETWORKS:{ locked:true, name:'Networks' },
        PASSWORD:{ locked:true, name:'Password' },
        BACKUP:{ locked:true, name:'Backup' },
        DESTROY:{ locked:true, name:'Destroy' },
    };

    export default {
    	components:{
            SettingsGeneral,
            SettingsLanguage,
		    SettingsTokens,
            SettingsExplorer,
            SettingsNetworks,
            SettingsBackup,
            SettingsDestroy,
            SettingsPassword,
            SettingsPIN,
        },
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
                'version'
            ]),
	        generalItems(){
            	return [
		            SettingsOptions.GENERAL,
		            SettingsOptions.LANGUAGE,
		            SettingsOptions.TOKENS,
		            SettingsOptions.EXPLORER,
                ]
            },
	        lockedItems(){
            	return [
		            SettingsOptions.PIN,
		            SettingsOptions.NETWORKS,
		            SettingsOptions.PASSWORD,
		            SettingsOptions.BACKUP,
		            SettingsOptions.DESTROY,
                ]
            }
        },
        mounted(){
            this.selectedOption = SettingsOptions.GENERAL;
        },
        methods: {
	        back(){
	            this.$router.back();
            },
            selectOption(option){
                if((option.locked || false) && !this.unlocked) {
                    return this.unlock(option);
                }
                this.selectedOption = option;
            },
            unlock(option){
                PopupService.push(
                    Popup.textPrompt("Confirm Password", "Enter your current password.", "unlock", "Okay", {
                        placeholder:'Enter Password or Backup Phrase',
                        type:'password'
                    }, async password => {
                        if(!password || !password.length) return;
                        if(!await PasswordService.verifyPassword(password)){
                            this.$router.push('/');
                            return PopupService.push(Popup.prompt("Bad Password", "The password you entered was incorrect.", "attention-circled", "Okay"));
                        }

                        this.unlocked = true;
                        this.selectOption(option);
                    }))
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .settings-panels {
        flex:1;
        height:0;
        overflow:auto;
    }

    .padded {
        padding:40px 70px;
    }

    .panel {
        flex:1;
        position: relative;
        display:flex;
        flex-direction: column;
    }

    .menu {
        flex:0 0 auto;
        width:250px;
        padding-right:0;

        .group-list {
            border-radius:4px;
            border:1px solid #dfe0e1;
            overflow:hidden;

            .item {
                cursor: pointer;
                padding:12px 20px;
                font-size: 14px;
                background:#fafafa;

                &.selected {
                    background:#fff;
                }

                &:not(:last-child){
                    border-bottom:1px solid #dfe0e1;
                }
            }

            &.danger {
                border:1px solid $red;
            }
        }
    }

</style>
