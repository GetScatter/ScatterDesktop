<template>

    <section class="pop-ins">
        <section class="full-panel center-fold limited fullscreen">
            <section class="head">
                <figure class="icon icon-attention"></figure>
                <figure class="title">Automatic Backups</figure>
                <br>
                <section class="disclaimer red less-pad" style="margin-bottom:10px;">
                    Scatter has no way to re-create your private keys!
                </section>
                <p>
                    Because of this we enforce automatic backups of your Scatter to your local device to make sure you always have a backup of your digital assets.
                    The back files are always encrypted and require your password to unlock.
                </p>
            </section>

        </section>
        <section class="action-bar short bottom centered">
            <btn text="Choose Folder" blue="1" v-on:clicked="setBackupLocation" />
        </section>
    </section>
</template>

<script>
	import '../styles/popins.scss';
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import BackupService from '../services/BackupService';
    import {BACKUP_STRATEGIES} from '../models/Settings';

    export default {
        data () {return {

        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'autoBackup',
                'backupLocation'
            ]),
        },
        mounted(){
            BackupService.setBackupStrategy(BACKUP_STRATEGIES.AUTOMATIC);
        },
        methods: {
            async setBackupLocation(){
                if(await BackupService.setBackupLocation()) {
                    this.$router.push({name: this.RouteNames.HOME});
                }
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .full-panel {
        min-height:calc(100vh - 160px);
    }

</style>
