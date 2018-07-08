<template>
    <section class="popout">

        <section v-if="windowMessage">

            <get-identity v-if="popupType === apiActions.GET_OR_REQUEST_IDENTITY"
                          :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></get-identity>
            <suggest-network v-if="popupType === apiActions.REQUEST_ADD_NETWORK"
                             :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></suggest-network>
            <signature-request v-if="popupType === apiActions.REQUEST_SIGNATURE || popupType === apiActions.REQUEST_ARBITRARY_SIGNATURE"
                               :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></signature-request>



        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import Scatter from '../models/Scatter';

    const { ipcRenderer, remote } = window.require('electron');
    import WindowService from '../services/WindowService'
    import * as WindowMessageTypes from '../models/popups/WindowMessageTypes'
    import * as ApiActions from '../models/api/ApiActions';

    export default {
        data () {return {
            apiActions:ApiActions,
            windowMessage:null,
        }},
        mounted(){
            WindowService.watch(WindowMessageTypes.POPUP, windowMessage => {
                this.windowMessage = windowMessage;
                this[Actions.HOLD_SCATTER](Scatter.fromJson(this.windowMessage.data.scatter));
            });
        },
        computed:{
            pluginOrigin(){ return this.windowMessage.data.popup.data.props.plugin },
            payload(){ return this.windowMessage.data.popup.data.props.payload },
            popupType(){ return this.windowMessage.data.popup.data.type },
        },
        methods: {
            returnResult(result){
                WindowService.sendResult(this.windowMessage, result);
                setTimeout(() => remote.getCurrentWindow().close(), 50);
            },
            ...mapActions([
                Actions.HOLD_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .popout {
        position: relative;
    }

</style>