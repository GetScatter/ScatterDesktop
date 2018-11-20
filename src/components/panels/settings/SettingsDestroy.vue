<template>
    <section>

        <section class="action-box top-pad">
            <label>Destroy this Scatter Instance</label>

            <p>
                Destroying your Scatter will remove all your data including your Identities and Keypair configurations from your local machine.
                It will not delete your blockchain accounts from the actual blockchain.
            </p>

            <br><br>
            <b style="color:red;">MAKE SURE YOU HAVE A BACKUP BEFORE YOU DO THIS!</b>
            <btn text="Destroy Scatter" red="true" v-on:clicked="destroy"></btn>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import SocketService from '../../../services/SocketService';
    import StorageService from '../../../services/StorageService';
    import PopupService from '../../../services/PopupService';
    import {Popup} from '../../../models/popups/Popup'

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ])
        },
        methods: {
            destroy(){
                PopupService.push(Popup.prompt("Destroying Scatter", "This action is irreversible. Are you sure you want to destroy your Scatter?", "trash", "Yes", async accepted => {
                    if(!accepted) return false;

                    await SocketService.close();
                    await StorageService.removeScatter();
                    this.$router.push('/');
                }, "No"))
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
