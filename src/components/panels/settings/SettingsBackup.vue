<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.BACKUP.Label)}}</label>
            <p>{{locale(langKeys.SETTINGS.BACKUP.Description)}}</p>

            <br>

            <section class="split-inputs">
                <Button style="flex:1;" :text="locale(langKeys.SETTINGS.BACKUP.AutoBackupLocationLabel)"
                     @click.native="setBackupLocation()" />
                <Button style="flex:0.6;" :text="locale(langKeys.SETTINGS.BACKUP.CreateBackupButton)"
                     @click.native="createBackup" />
            </section>
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.BACKUP.CurrentBackupFolderLabel)}}</label>
            <Input style="margin-bottom:0;" dynamic-button="icon-folder-open-empty"
                 disabled="1" :text="scatter.settings.backupLocation"
                 v-on:dynamic="openFilePathLink"/>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import {BACKUP_STRATEGIES} from '../../../models/Settings';
    import BackupService from '../../../services/utility/BackupService';
    import ElectronHelpers from '../../../util/ElectronHelpers';
    import PopupService from "../../../services/utility/PopupService";
    import {Popup} from "../../../models/popups/Popup";

    export default {
        data () {return {
            strategies:BACKUP_STRATEGIES,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'autoBackup',
            ])
        },
        mounted(){
            BackupService.setBackupStrategy(BACKUP_STRATEGIES.AUTOMATIC);
        },
        methods: {
	        openFilePathLink(){
		        ElectronHelpers.openLinkInBrowser(this.scatter.settings.backupLocation, true);
	        },
            async setBackupLocation(){
                await BackupService.setBackupLocation();
            },
            async createBackup(){
                if(await BackupService.createBackup()){
                	PopupService.push(Popup.snackbar("Backup created"))
                }

            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";


</style>