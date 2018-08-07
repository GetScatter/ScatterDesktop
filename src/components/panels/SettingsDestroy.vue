<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Destroy this Scatter Instance</figure>
                <figure class="description">
                    <b style="color:red;">MAKE SURE YOU HAVE A BACKUP BEFORE YOU DO THIS!</b><br><br>
                    Destroying your Scatter will remove all your data including your Identities and Keypair configurations from your local machine.
                    It will <u>not</u> delete your blockchain accounts from the actual blockchain.
                </figure>

                <section class="info-box">
                    <btn text="Destroy Scatter" red="true" v-on:clicked="destroy"></btn>

                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import SocketService from '../../services/SocketService';
    import StorageService from '../../services/StorageService';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'

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
                PopupService.push(Popup.prompt("Destroying Scatter", "This action is irreversible. Are you sure you want to destroy your Scatter?", "trash-o", "Yes", async accepted => {
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
    @import "../../_variables";


</style>
