<template>
    <section>

        <section class="action-box top-pad">
            <label>Configure Backups</label>
            Every time you change your password you will get a new Mnemonic ( Seed Phrase ) which is your alternate password for unlocking Scatter.

            <br><br>

            <section class="split-inputs">
                <btn style="flex:1;" text="Auto-Backup Location" v-on:clicked="setBackupLocation()" />
                <btn text="Create Backup" v-on:clicked="createBackup" />
            </section>
        </section>

        <section class="action-box top-pad">
            <label>Current Backup Folder</label>
            <cin style="margin-bottom:0;" dynamic-button="icon-folder-open-empty" dynamic-tooltip="Open Folder" disabled="1" :text="scatter.settings.backupLocation" v-on:dynamic="openFilePathLink"></cin>
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
    @import "../../../variables";


</style>