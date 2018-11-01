<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item">
                <figure class="name">General Settings</figure>
                <figure class="description">
                    Configure your automatic backups.
                </figure>

                <figure class="line"></figure>

                <section class="info-box">
                    <figure class="name">Version</figure>
                    <b>Scatter Desktop v{{version}}</b><br>
                    <btn :disabled="!needsUpdate" @click.native="openUpdateLink" :text="needsUpdate ? 'Update Available' : 'No Update Needed'"></btn>
                </section>

                <section class="info-box">
                    <figure class="name">Whitelist Notifications</figure>
                    <figure class="description">These notifications appear on certain operating systems when you auto-sign whitelisted transactions.</figure>
                    <swch first="Enabled" second="Disabled" :selected="!showNotifications ? 'Enabled' : 'Disabled'" v-on:switched="toggleNotifications"></swch>
                </section>

                <section class="info-box">
                    <figure class="name">Data Path</figure>
                    <figure class="description">The location on your computer that Scatter saves it's encrypted data to.</figure>
                    <cin dynamic-button="folder-open" dynamic-tooltip="Open Folder" disabled="1" copy="1" :text="dataPath" v-on:dynamic="openFilePathLink"></cin>
                </section>

                <section class="info-box">
                    <figure class="name">Developer Console</figure>
                    <figure class="description">Sometimes you might need to see if Scatter is throwing any errors.</figure>
                    <btn @click.native="openConsole" text="Open Console"></btn>
                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import UpdateService from '../../services/UpdateService';
    import WindowService from '../../services/WindowService';
    import ElectronHelpers from '../../util/ElectronHelpers';

    const {remote} = window.require('electron');
    const app = remote.app;

    export default {
        data () {return {
            needsUpdate:false,
            dataPath:'',
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'showNotifications',
                'version',
            ])
        },
        mounted(){
        	this.dataPath = app.getPath('userData');
            UpdateService.needsUpdateNoPrompt().then(needsUpdate => {
                this.needsUpdate = needsUpdate ? needsUpdate[1] : false;

            })
        },
        methods: {
        	openFilePathLink(){
        	    ElectronHelpers.openLinkInBrowser(this.dataPath);
            },
	        openUpdateLink(){
		        ElectronHelpers.openLinkInBrowser(this.needsUpdate);
	        },
	        openConsole(){ WindowService.openTools(); },
            async toggleNotifications(){
                const scatter = this.scatter.clone();
                scatter.settings.showNotifications = !scatter.settings.showNotifications;
                this[Actions.SET_SCATTER](scatter);
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


    .line {
      width:100%;
      height:1px;
      background:rgba(0,0,0,0.1);
      margin-top:30px;
    }
</style>
