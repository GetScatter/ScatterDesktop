<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Change your PIN</figure>
                <figure class="description">
                    Your PIN is a secondary internal password for doing Transfers.<br>
                    <b class="red">Do not make your PIN the same as your password!</b>
                </figure>

                <section class="info-box">

                    <cin big="1" placeholder="PIN Disabled" type="password" :text="pin" v-on:changed="x => pin = x"></cin>

                    <!--<b style="margin-top:10px; font-size: 11px;" v-if="!scatter.pin || !scatter.pin.length">PIN Disabled</b>-->

                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import PasswordService from '../../services/PasswordService';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup';

    let saveTimeout;

    export default {
        data () {return {
            pin:'',
        }},
        computed:{
            ...mapState([
                'scatter'
            ])
        },
        mounted(){
            this.pin = this.scatter.pin ? this.scatter.pin : '';
        },
        methods: {
            async changePin(){
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(async () => {
                    await PasswordService.setPIN(this.pin, false);
                    PopupService.push(Popup.snackbar('Saved PIN'))
                }, 500);
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            pin(a,b){
                if(!b) return;
                this.changePin();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>
