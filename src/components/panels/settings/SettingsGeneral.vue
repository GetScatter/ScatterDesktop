<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.VersionLabel)}}</label>
            <b>Scatter Desktop v{{version}}</b>

            <Button :class="{'wiggle':needsUpdate}"
                 :disabled="!needsUpdate"
                 :red="needsUpdate"
                 @click.native="openUpdateLink"
                 :text="needsUpdate
                     ? locale(langKeys.SETTINGS.GENERAL.UpdateAvailable)
                     : locale(langKeys.SETTINGS.GENERAL.NoUpdateAvailable)"
            />
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.LANGUAGE.Label)}}</label>
            <Select bordered="1" :options="names"
                    :selected="selectedLanguage"
                    :parser="x => x"
                    v-on:changed="selectLanguage" />
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.WhitelistNotificationsLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.WhitelistNotificationsDescription)}}</p>

            <Switcher :state="showNotifications" @click.native="toggleNotifications" />
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.DataPathLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.DataPathDescription)}}</p>

            <br>
            <br>
            <Input style="margin-bottom:0;" dynamic-button="icon-folder-open-empty"
                 disabled="1" :text="dataPath"
                 v-on:dynamic="openFilePathLink"/>
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.DeveloperConsoleLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.DeveloperConsoleDescription)}}</p>
            <Button @click.native="openConsole"
                 :text="locale(langKeys.SETTINGS.GENERAL.DeveloperConsoleButton)"/>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import UpdateService from '../../../services/utility/UpdateService';
    import WindowService from '../../../services/utility/WindowService';
    import ElectronHelpers from '../../../util/ElectronHelpers';
    import {LANG} from '../../../localization/locales';
    import LanguageService from "../../../services/utility/LanguageService";

    import {remote} from '../../../util/ElectronHelpers';
    const app = remote.app;

    export default {
        data () {return {
            needsUpdate:null,
	        languages:LANG,
	        names:['English'],
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'showNotifications',
                'version',
	            'networks',
	            'language',
            ]),
            dataPath(){
            	return app.getPath('userData');
            },
	        selectedLanguage(){
		        return this.scatter.settings.language
	        }
        },
        mounted(){
            UpdateService.needsUpdateNoPrompt(false).then(needsUpdate => {
                this.needsUpdate = !!needsUpdate;
            })
	        LanguageService.getLanguageNames().then(names => {
		        if(names) this.names = names;
	        })
        },
        methods: {
        	openFilePathLink(){
        	    ElectronHelpers.openLinkInBrowser(this.dataPath, true);
            },
	        openUpdateLink(){
		        ElectronHelpers.openLinkInBrowser(UpdateService.updateUrl());
	        },
	        openConsole(){ WindowService.openTools(); },
            async toggleNotifications(){
                const scatter = this.scatter.clone();
                scatter.settings.showNotifications = !scatter.settings.showNotifications;
                this[Actions.SET_SCATTER](scatter);
            },
	        selectLanguage(language){
		        const scatter = this.scatter.clone();
		        scatter.settings.language = language;
		        LanguageService.getLanguage(language).then(res => {
			        res.raw = JSON.stringify(res);
			        this[Actions.SET_LANGUAGE](res);
			        this[Actions.SET_SCATTER](scatter);
		        })
	        },
            ...mapActions([
                Actions.SET_SCATTER,
	            Actions.SET_LANGUAGE,
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";


    .line {
      width:100%;
      height:1px;
      background:rgba(0,0,0,0.1);
      margin-top:30px;
    }
</style>
