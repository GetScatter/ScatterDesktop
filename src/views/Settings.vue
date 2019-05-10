<template>
    <section>
        <section class="blockchain-list-container" v-if="selectedOption">
            <section class="blockchains">
                <section class="head">
                    Basics
                </section>
                <section class="scroller dynamic">
                    <section class="blockchain-list">
                        <section class="badge-item hoverable" :class="{'active':selectedOption.name === item.name}" v-for="item in generalItems" @click="selectOption(item)">
                            <section class="details"><figure class="title">{{translate(item)}}</figure></section>
                        </section>
                    </section>
                </section>
                <section class="head">
                    Secure Settings
                    <figure class="danger icon-lock"></figure>
                </section>
                <section class="scroller dynamic">
                    <section class="blockchain-list">
                        <section class="badge-item hoverable" :class="{'active':selectedOption.name === item.name}" v-for="item in lockedItems" @click="selectOption(item)">
                            <section class="details"><figure class="title">{{translate(item)}}</figure></section>
                        </section>
                    </section>
                </section>
            </section>

            <section class="list-container">

                <h1>{{translate(selectedOption)}}</h1>

                <SettingsGeneral v-if="selectedOption.name === settingsOptions.GENERAL.name" />
                <SettingsTokens v-if="selectedOption.name === settingsOptions.TOKENS.name" />
                <SettingsExplorer v-if="selectedOption.name === settingsOptions.EXPLORER.name" />
                <SettingsPassword v-if="selectedOption.name === settingsOptions.PASSWORD.name" />
                <SettingsBackup v-if="selectedOption.name === settingsOptions.BACKUP.name" />
                <SettingsDestroy v-if="selectedOption.name === settingsOptions.DESTROY.name" />
                <SettingsFirewall v-if="selectedOption.name === settingsOptions.FIREWALL.name" />
            </section>
        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Popup} from '../models/popups/Popup'
    import PopupService from '../services/utility/PopupService'

    import {SETTINGS_OPTIONS} from '../models/Settings';

    import SettingsGeneral from '../components/panels/settings/SettingsGeneral.vue'
    import SettingsTokens from '../components/panels/settings/SettingsTokens.vue'
    import SettingsExplorer from '../components/panels/settings/SettingsExplorer.vue'
    import SettingsBackup from '../components/panels/settings/SettingsBackup.vue'
    import SettingsDestroy from '../components/panels/settings/SettingsDestroy.vue'
    import SettingsPassword from '../components/panels/settings/SettingsPassword.vue'
    import SettingsFirewall from '../components/panels/settings/SettingsFirewall.vue'



    export default {
    	components:{
            SettingsGeneral,
		    SettingsTokens,
            SettingsExplorer,
            SettingsBackup,
            SettingsDestroy,
            SettingsPassword,
		    SettingsFirewall,
        },
	    data () {return {
            settingsOptions:SETTINGS_OPTIONS,
            selectedOption:SETTINGS_OPTIONS.GENERAL,
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
		            SETTINGS_OPTIONS.TOKENS,
		            SETTINGS_OPTIONS.EXPLORER,
		            SETTINGS_OPTIONS.BACKUP,
                ]
            },
	        lockedItems(){
            	return [
		            SETTINGS_OPTIONS.PASSWORD,
		            SETTINGS_OPTIONS.FIREWALL,
		            SETTINGS_OPTIONS.DESTROY,
                ]
            }
        },
        mounted(){

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

    .head {
        display:flex;
        justify-content: space-between;

        .danger {
            background:$red;
            color:$white;
            font-size: $small;
            border-radius:$radius;
            padding:3px 8px;
        }
    }

    .list-container {
        padding:30px;
        height:calc(100vh - 40px);
        overflow-y:auto;
    }

</style>
