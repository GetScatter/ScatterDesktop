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

                <section class="split-panels left">
                    <section class="info-box">

                        <!--<swch first="Automatic Backups" second="Manual Backups Only"-->
                              <!--:selected="autoBackup !== strategies.AUTOMATIC ? 'Automatic Backups' : 'Manual Backups Only'"-->
                              <!--v-on:switched="setBackupStrategy(autoBackup === strategies.AUTOMATIC ? strategies.MANUAL : strategies.AUTOMATIC)"></swch>-->

                        <section v-if="autoBackup === strategies.AUTOMATIC">
                            <btn text="Choose Automatic Backup Location" secondary="true" large="true" v-on:clicked="setBackupLocation()"></btn>
                        </section>
                        <section v-if="autoBackup === strategies.MANUAL">
                            <btn text="Create New Backup" large="true" secondary="true" v-on:clicked="createBackup"></btn>
                        </section>
                    </section>
                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import {BACKUP_STRATEGIES} from '../../models/Settings';
    import BackupService from '../../services/BackupService';

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
    @import "../../_variables";


</style>