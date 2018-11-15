<template>
    <section>

        <section class="action-box top-pad">
            <label>Version</label>
            <b>Scatter Desktop v{{version}}</b>

            <btn :class="{'wiggle':needsUpdate}"
                 :disabled="!needsUpdate"
                 :red="needsUpdate"
                 v-on:clicked="openUpdateLink"
                 :text="needsUpdate
                 ? 'Update Available'
                 : 'No Update Needed'"
            />
        </section>

        <section class="action-box top-pad">
            <label>Whitelist Notifications</label>
            These notifications appear on certain operating systems when you auto-sign whitelisted transactions.

            <btn v-on:clicked="toggleNotifications" :red="showNotifications" :text="!showNotifications ? 'Enable' : 'Disable'" />
        </section>

        <section class="action-box top-pad">
            <label>Data Path</label>
            The location on your computer that Scatter saves it's encrypted data to.

            <br>
            <br>
            <cin style="margin-bottom:0;" dynamic-button="icon-folder-open-empty" dynamic-tooltip="Open Folder" disabled="1" copy="1" :text="dataPath" v-on:dynamic="openFilePathLink"></cin>
        </section>

        <section class="action-box top-pad">
            <label>Developer Console</label>
            Sometimes you might need to see if Scatter is throwing any errors.
            <btn @click.native="openConsole" text="Open Console"></btn>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import UpdateService from '../../../services/UpdateService';
    import WindowService from '../../../services/WindowService';
    import ElectronHelpers from '../../../util/ElectronHelpers';

    const {remote} = window.require('electron');
    const app = remote.app;

    export default {
        data () {return {
            needsUpdate:null,
        }},
        computed:{
            ...mapState([
                'scatter'
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
            UpdateService.needsUpdateNoPrompt().then(needsUpdate => {
                this.needsUpdate = needsUpdate ? needsUpdate[1] : false;
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
            ...mapActions([
                Actions.SET_SCATTER
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
