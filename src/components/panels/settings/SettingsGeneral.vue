<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.VersionLabel)}}</label>
            <b>Scatter Desktop v{{version}}</b>

            <btn :class="{'wiggle':needsUpdate}"
                 :disabled="!needsUpdate"
                 :red="needsUpdate"
                 v-on:clicked="openUpdateLink"
                 :text="needsUpdate
                     ? locale(langKeys.SETTINGS.GENERAL.UpdateAvailable)
                     : locale(langKeys.SETTINGS.GENERAL.NoUpdateAvailable)"
            />
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.WhitelistNotificationsLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.WhitelistNotificationsDescription)}}</p>

            <section class="switch bottomed" @click="toggleNotifications">
                <figure class="dot" :class="{'disabled':!showNotifications}"></figure>
            </section>
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.DataPathLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.DataPathDescription)}}</p>

            <br>
            <br>
            <cin style="margin-bottom:0;" dynamic-button="icon-folder-open-empty"
                 disabled="1" :text="dataPath"
                 v-on:dynamic="openFilePathLink"></cin>
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.GENERAL.DeveloperConsoleLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.GENERAL.DeveloperConsoleDescription)}}</p>
            <btn @click.native="openConsole"
                 :text="locale(langKeys.SETTINGS.GENERAL.DeveloperConsoleButton)"></btn>
        </section>

        <section class="action-box top-pad">
            <label>Colors</label>
            <slider :min="0" :max="255" step="1" :value="bgColorVal" v-on:changed="x => {bgColor = numberToColor(x); applyColors(); }" />
            <slider :min="0" :max="255" step="1" :value="txtColorVal" v-on:changed="x => {txtColor = numberToColor(x); applyColors(); }" />

            <!--<btn @click.native="applyColors"-->
                 <!--:text="locale(langKeys.GENERIC.Confirm)"></btn>-->
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import UpdateService from '../../../services/UpdateService';
    import WindowService from '../../../services/WindowService';
    import ElectronHelpers from '../../../util/ElectronHelpers';

    import {remote} from '../../../util/ElectronHelpers';
    const app = remote.app;

    export default {
        data () {return {
            needsUpdate:null,
            bgColor:'',
            txtColor:'',
            bgColorVal:0,
            txtColorVal:0,
        }},
        computed:{
            ...mapState([
                'scatter',
                'backgroundColor',
                'textColor',
            ]),
            ...mapGetters([
                'showNotifications',
                'version',
            ]),
            dataPath(){
            	return app.getPath('userData');
            }
        },
        mounted(){
            UpdateService.needsUpdateNoPrompt(false).then(needsUpdate => {
                this.needsUpdate = !!needsUpdate;
            })
        },
        methods: {
        	openFilePathLink(){
        	    ElectronHelpers.openLinkInBrowser(this.dataPath);
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
            numberToColor(n){
        		if(n === null || typeof n === 'undefined') return 'rgb(0,0,0)';
        		return `rgb(${n},${n},${n})`
            },
            applyColors(){
	            this[Actions.SET_BG_COLOR](this.bgColor);
	            this[Actions.SET_TXT_COLOR](this.txtColor);
            },
            ...mapActions([
                Actions.SET_SCATTER,
                Actions.SET_BG_COLOR,
                Actions.SET_TXT_COLOR,
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../variables";


    .line {
      width:100%;
      height:1px;
      background:rgba(0,0,0,0.1);
      margin-top:30px;
    }
</style>
