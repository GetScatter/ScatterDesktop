<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Scatter Backup Settings</figure>
                <figure class="description">
                    Configure your automatic backups.
                </figure>

                <section class="info-box">
                    <btn text="Choose Automatic Backup Location" secondary="true" large="true" v-on:clicked="setBackupLocation()"></btn>
                    <btn text="Create Single Backup File" large="true" secondary="true" v-on:clicked="createBackup"></btn>
                </section>

                <section class="info-box">
                    <figure class="name">Current Backup Folder</figure>
                    <figure class="description">The location on your computer that Scatter saves it's encrypted backups to.</figure>
                    <cin dynamic-button="folder-open" dynamic-tooltip="Open Folder" disabled="1" copy="1" :text="scatter.settings.backupLocation" v-on:dynamic="openFilePathLink"></cin>
                </section>

            </section>
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