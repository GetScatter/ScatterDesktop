<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Popup Nonce</figure>
                <figure class="description">
                    The popup nonce helps you verify that popups actually came from Scatter.
                    It's best to set a nonce prefix yourself, so that you know a popup was really created by <b>your Scatter</b> and not some
                    other application trying to steal your data.
                </figure>

                <section class="split-panels left">
                    <section class="info-box">
                      <cin placeholder="nonce example" forced="true" style="width:200px; display:inline-block;" disabled="true" :text="`${noncePrefix}:${nonce}`"></cin>
                      <cin style="width:calc(100% - 218px); margin-left:10px; display:inline-block;"
                           placeholder="Nonce Prefix" :text="noncePrefix" v-on:changed="changed => bind(changed, 'noncePrefix')"></cin>

                      <btn style="float:right;" large="true" text="Apply Prefix" v-on:clicked="applyPrefix"></btn>
                    </section>
                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import PopupService from "../../services/PopupService";
    import {Popup} from '../../models/popups/Popup'
    import {RouteNames} from "../../vue/Routing";

    export default {
        data () {return {
            noncePrefix:''
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'autoBackup',
            ]),
            nonce(){
                return this.scatter.nonce;
            }
        },
        mounted(){
          this.noncePrefix = this.scatter.noncePrefix;
        },
        methods: {
            applyPrefix(){
                if(!this.noncePrefix.length)
                    return PopupService.push(Popup.prompt('Bad Prefix', 'The nonce prefix must not be empty.', 'exclamation-triangle', 'Okay'))

                const clone = this.scatter.clone();
                clone.noncePrefix = this.noncePrefix;
                this[Actions.SET_SCATTER](clone);
                PopupService.push(Popup.snackbar('Nonce Prefix Updated', 'check'));
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
