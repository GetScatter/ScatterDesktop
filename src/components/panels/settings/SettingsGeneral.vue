<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.VersionLabel)}}</label>
            <b>Scatter Desktop v{{version}}</b>
            <br>
            <br>

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

            <p>
                Sorry, this is temporarily unavailable as we reformat all of the translations.
            </p>

            <Select bordered="1" :options="names" :disabled="true"
                    :selected="selectedLanguage"
                    :parser="x => x"
                    v-on:selected="selectLanguage" />
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.WhitelistNotificationsLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.WhitelistNotificationsDescription)}}</p>

            <Switcher :state="showNotifications" @click.native="toggleNotifications" />
        </section>

        <section class="action-box top-pad">
            <label>Local socket ports</label>
            <p>There are the ports open on your local machine that other local applications can use to contact Scatter.</p>

            <br>
            <section v-if="ports && Object.keys(ports).length">
                <section class="port" v-for="(ssl, port) in ports">
                    {{port}}
                    <figure class="ssl" v-if="ssl">SSL</figure>
                </section>
            </section>
            <section v-else>There are no open ports!</section>
        </section>

        <section class="action-box top-pad" v-if="dataPath">
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
    import * as Actions from '@walletpack/core/store/constants';
    import * as UIActions from "../../../store/ui_actions";

    import UpdateService from '../../../services/utility/UpdateService';
    import WindowService from '../../../services/electron/WindowService';
    import LanguageService from "../../../services/utility/LanguageService";

    const app = require('../../../util/ElectronHelpers').remote.app;

    export default {
        data () {return {
            needsUpdate:null,
	        names:['English'],
        }},
        computed:{
            ...mapState([
                'scatter',
                'ports',
            ]),
            ...mapGetters([
                'version',
	            'networks',
	            'language',
            ]),
            showNotifications(){
                return this.scatter.settings.showNotifications;
            },
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
        	    this.openInBrowser(this.dataPath, true);
            },
	        openUpdateLink(){
		        this.openInBrowser(UpdateService.updateUrl());
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
			        this[UIActions.SET_LANGUAGE](res);
			        this[Actions.SET_SCATTER](scatter);
		        })
	        },
            ...mapActions([
                Actions.SET_SCATTER,
	            UIActions.SET_LANGUAGE,
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

    .port {
        display:flex;
        font-weight: bold;

        &:not(:last-child){
            margin-bottom:5px;
        }

        .ssl {
            font-size: $tiny;
            padding:2px 6px;
            background:$blue;
            color:$white;
            border-radius:$radius;
            display:flex;
            align-items: center;
            justify-content: center;
            margin-left:10px;
        }
    }
</style>
