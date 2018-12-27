<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.BACKUP.Label)}}</label>
            <p>{{locale(langKeys.SETTINGS.BACKUP.Description)}}</p>

            <br><br>

            <section class="split-inputs">
                <btn style="flex:1;" :text="locale(langKeys.SETTINGS.BACKUP.AutoBackupLocationLabel)"
                     v-on:clicked="setBackupLocation()" />
                <btn style="flex:0.6;" :text="locale(langKeys.SETTINGS.BACKUP.CreateBackupButton)"
                     v-on:clicked="createBackup" />
            </section>
        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.BACKUP.CurrentBackupFolderLabel)}}</label>
            <cin style="margin-bottom:0;" dynamic-button="icon-folder-open-empty"
                 disabled="1" :text="scatter.settings.backupLocation"
                 v-on:dynamic="openFilePathLink"></cin>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import {BACKUP_STRATEGIES} from '../../../models/Settings';
    import BackupService from '../../../services/BackupService';
    import ElectronHelpers from '../../../util/ElectronHelpers';

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
		        ElectronHelpers.openLinkInBrowser(this.scatter.settings.backupLocation);
	        },
            async setBackupLocation(){
                await BackupService.setBackupLocation();
            },
            async createBackup(){
                await BackupService.createBackup();
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