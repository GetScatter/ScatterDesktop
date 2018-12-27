<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.DESTROY.Label)}}</label>

            <p>{{locale(langKeys.SETTINGS.DESTROY.Description)}}</p>

            <br><br>
            <section class="disclaimer red" style="margin-bottom:0;">
				<b>{{locale(langKeys.SETTINGS.DESTROY.Important)}}</b>
			</section>
            <btn :text="locale(langKeys.SETTINGS.DESTROY.Button)" red="true" v-on:clicked="destroy"></btn>
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
                PopupService.push(Popup.destroyScatter());
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
