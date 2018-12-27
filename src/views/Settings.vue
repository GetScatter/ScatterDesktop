<template>
    <section>

        <back-bar v-on:back="back" />

        <section class="full-panel inner limited" v-if="selectedOption">

            <section class="split-panel dynamic no-divider">
                <section class="panel menu padded">

                    <label>{{locale(langKeys.SETTINGS.Basics)}}</label>

                    <section class="group-list">
                        <section class="item"
                                 v-for="item in generalItems"
                                 :class="{'selected':selectedOption.name === item.name}"
                                 @click="selectOption(item)">
                            {{translate(item)}}
                        </section>
                    </section>


                    <br><br>

                    <label class="red">{{locale(langKeys.SETTINGS.DangerZone)}}</label>

                    <section class="group-list" :class="{'danger':!unlocked}">
                        <section class="item"
                                 v-for="item in lockedItems"
                                 :class="{'selected':selectedOption.name === item.name}"
                                 @click="selectOption(item)">
                            {{translate(item)}}
                        </section>
                    </section>

                </section>

                <section class="panel">
                    <section v-if="selectedOption" class="settings-panels padded">
                        <br>
                        <h1>{{translate(selectedOption)}}</h1>

                        <SettingsGeneral v-if="selectedOption.name === settingsOptions.GENERAL.name" />
                        <SettingsLanguage v-if="selectedOption.name === settingsOptions.LANGUAGE.name" />
                        <SettingsTokens v-if="selectedOption.name === settingsOptions.TOKENS.name" />
                        <SettingsExplorer v-if="selectedOption.name === settingsOptions.EXPLORER.name" />
                        <SettingsNetworks v-if="selectedOption.name === settingsOptions.NETWORKS.name" />
                        <SettingsPassword :mnemonic="mnemonic" v-on:mnemonic="x => mnemonic = x" v-if="selectedOption.name === settingsOptions.PASSWORD.name" />
                        <SettingsBackup v-if="selectedOption.name === settingsOptions.BACKUP.name" />
                        <SettingsDestroy v-if="selectedOption.name === settingsOptions.DESTROY.name" />
                        <SettingsPIN v-if="selectedOption.name === settingsOptions.PIN.name" />
                        <SettingsFirewall v-if="selectedOption.name === settingsOptions.FIREWALL.name" />

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

    import {SETTINGS_OPTIONS} from '../models/Settings';

    import SettingsGeneral from '../components/panels/settings/SettingsGeneral.vue'
    import SettingsLanguage from '../components/panels/settings/SettingsLanguage.vue'
    import SettingsTokens from '../components/panels/settings/SettingsTokens.vue'
    import SettingsExplorer from '../components/panels/settings/SettingsExplorer.vue'
    import SettingsNetworks from '../components/panels/settings/SettingsNetworks.vue'
    import SettingsBackup from '../components/panels/settings/SettingsBackup.vue'
    import SettingsDestroy from '../components/panels/settings/SettingsDestroy.vue'
    import SettingsPassword from '../components/panels/settings/SettingsPassword.vue'
    import SettingsPIN from '../components/panels/settings/SettingsPIN.vue'
    import SettingsFirewall from '../components/panels/settings/SettingsFirewall.vue'



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
		    SettingsFirewall,
        },
	    data () {return {
            settingsOptions:SETTINGS_OPTIONS,
            selectedOption:null,
            unlocked:false,
		    mnemonic:null,
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
		            SETTINGS_OPTIONS.GENERAL,
		            SETTINGS_OPTIONS.LANGUAGE,
		            SETTINGS_OPTIONS.TOKENS,
		            SETTINGS_OPTIONS.EXPLORER,
                ]
            },
	        lockedItems(){
            	return [
		            SETTINGS_OPTIONS.PIN,
		            SETTINGS_OPTIONS.NETWORKS,
		            SETTINGS_OPTIONS.PASSWORD,
		            SETTINGS_OPTIONS.BACKUP,
		            SETTINGS_OPTIONS.FIREWALL,
		            SETTINGS_OPTIONS.DESTROY,
                ]
            }
        },
        mounted(){
    		this.selectedOption = this.$route.params.panel;
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
	        	PopupService.push(Popup.verifyPassword(verified => {
	        		if(!verified) return;
	        		this.mnemonic = verified;
			        this.unlocked = true;
			        this.selectOption(option);
                }))
            },
	        translate(option){
	        	return this.locale(this.langKeys.SETTINGS.MENU[option.name]);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

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
