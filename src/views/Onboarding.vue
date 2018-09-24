<template>
    <section class="onboarding">

        <section>

            <section class="onboarder" v-if="step === steps.BACKUP">
                <h1>Set your Backup Location</h1>
                <p>
                    <b class="red">Scatter has no way to re-create your Secure Vault</b>
                    <br><br>
                    Because of this we enforce automatic backups of your Scatter to your local device to make sure you always have a backup of your digital assets.
                    Please choose a location to save these backups.
                </p>

                <!--<section v-if="!hasBackupLocation">-->
                    <!--<swch first="Automatic Backups" second="Manual Backups Only"-->
                          <!--:selected="autoBackup !== strategies.AUTOMATIC ? 'Automatic Backups' : 'Manual Backups Only'"-->
                          <!--v-on:switched="setBackupStrategy(autoBackup === strategies.AUTOMATIC ? strategies.MANUAL : strategies.AUTOMATIC)"></swch>-->
                <!--</section>-->

                <btn v-if="autoBackup === strategies.MANUAL" large="1" text="Continue Without Automatic Backups" red="1" v-on:clicked="nextStep"></btn>

                <section v-if="autoBackup === strategies.AUTOMATIC">
                    <btn text="Choose Automatic Backup Location" secondary="true" large="true" v-on:clicked="setBackupLocation()"></btn>
                </section>
            </section>



        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing';

    import Identity from '../models/Identity';
    import Keypair from '../models/Keypair';
    import {Popup} from '../models/popups/Popup'
    import PopupService from '../services/PopupService';
    import KeyPairService from '../services/KeyPairService';
    import BackupService from '../services/BackupService';
    import AccountService from '../services/AccountService';
    import PluginRepository from '../plugins/PluginRepository';
    import {BACKUP_STRATEGIES} from '../models/Settings';

    const STEPS = {
        BACKUP:'backup',
    };

    export default {
        data () {return {
            strategies:BACKUP_STRATEGIES,
            identityName:'',
            steps:STEPS,
            step:STEPS.BACKUP,
            keypair:Keypair.placeholder(),
            keypairSaved:false,
            importingAccount:false,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps',
                'autoBackup',
                'backupLocation'
            ]),
            hasBackupLocation(){
                return this.backupLocation && this.backupLocation.length
            }
        },
        mounted(){
            BackupService.setBackupStrategy(BACKUP_STRATEGIES.AUTOMATIC);
        },
        methods: {
            async setBackupLocation(){
                if(await BackupService.setBackupLocation()) {
                    this.$router.push({name: RouteNames.HOME});
                }
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .red {
        color:$red;
    }

    .onboarding {
        height:100vh;
        width:100%;
        -webkit-app-region: drag;

        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .logo {
            font-family: 'Grand Hotel', sans-serif;
            font-size: 72px;
            color: $light-blue;
            margin-bottom:20px;
        }

        .onboarder {
            -webkit-app-region: no-drag;
            max-width:510px;
            margin:0 auto;

            h1 {
                font-size: 24px;
                font-weight: 400;
                margin:0;
            }

            p {
                font-size: 16px;
                color:#838383;
            }

            .input-container {
                display:flex;
                flex-direction: row;

                .input {
                    flex:1;
                    margin-right:20px;
                    text-align:left;


                }

                .button {
                    float:left;
                }
            }

            .name-terms {
                font-size: 13px;
                line-height:18px;
                padding:10px 0;
                display: block;
            }
        }

    }
</style>
