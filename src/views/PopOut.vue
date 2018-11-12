<template>
    <section>

        <!--<section v-if="windowMessage">-->

            <!--<get-identity v-if="popupType === apiActions.GET_OR_REQUEST_IDENTITY"-->
                          <!--:payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></get-identity>-->

            <!--<suggest-network v-if="popupType === apiActions.REQUEST_ADD_NETWORK"-->
                             <!--:payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></suggest-network>-->

            <!--<signature-request v-if="popupType === apiActions.REQUEST_SIGNATURE || popupType === apiActions.REQUEST_ARBITRARY_SIGNATURE"-->
                               <!--:payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></signature-request>-->

            <!--<link-app v-if="popupType === 'linkApp'" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></link-app>-->

            <!--<get-public-key v-if="popupType === apiActions.GET_PUBLIC_KEY" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></get-public-key>-->

            <!--<link-account v-if="popupType === apiActions.LINK_ACCOUNT" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></link-account>-->

            <!--<transfer-request v-if="popupType === apiActions.REQUEST_TRANSFER" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></transfer-request>-->

        <!--</section>-->

        <section v-if="windowMessage" class="popout">

            <AppLogin v-if="popupType === apiActions.GET_OR_REQUEST_IDENTITY" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult" />

            <!--<get-identity v-if="popupType === apiActions.GET_OR_REQUEST_IDENTITY"-->
                          <!--:payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></get-identity>-->

            <signature-request v-if="popupType === apiActions.REQUEST_SIGNATURE || popupType === apiActions.REQUEST_ARBITRARY_SIGNATURE"
                               :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></signature-request>

            <link-app v-if="popupType === 'linkApp'" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></link-app>

            <get-public-key v-if="popupType === apiActions.GET_PUBLIC_KEY" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></get-public-key>

            <transfer-request v-if="popupType === apiActions.REQUEST_TRANSFER" :payload="payload" :plugin-origin="pluginOrigin" v-on:returned="returnResult"></transfer-request>

        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import Scatter from '../models/Scatter';
    const { remote } = window.require('electron');
    import WindowService from '../services/WindowService'
    import * as ApiActions from '../models/api/ApiActions';

    export default {
        data () {return {
            apiActions:ApiActions,
            windowMessage:null,
        }},
        components:{
            AppLogin:() => import('./popouts/AppLogin')
        },
        mounted(){
            WindowService.watch('popup', windowMessage => {
                this.windowMessage = windowMessage;

                const scatter = this.windowMessage.data.scatter;

                // Hardware wallets cause slowdowns to initialize
                // which makes popups slow down too.
                scatter.keychain.keypairs.map(x => {
                    if(x.external) x.external = null;
                });

                this[Actions.HOLD_SCATTER](Scatter.fromJson(scatter));
                console.log('popupType', this.popupType);
            });
        },
        computed:{
            ...mapState([
                'scatter',
            ]),
            pluginOrigin(){ return this.windowMessage.data.popup.data.props.plugin },
            payload(){ return this.windowMessage.data.popup.data.props.payload },
            popupType(){ return this.windowMessage.data.popup.data.type },
            showNonce(){
                return this.popupType === ApiActions.REQUEST_SIGNATURE ||
                       this.popupType === ApiActions.REQUEST_ARBITRARY_SIGNATURE
            }
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
        height: 100vh;
        display: flex;
        flex-direction: column;

        section {
            display: flex;
            flex-direction: column;
        }
    }

</style>
