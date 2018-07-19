<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Change your Password</figure>
                <figure class="description">
                    Every time you change your password you will get a new Mnemonic ( Seed Phrase ).<br>
                    <b>Mnemonics are not used to generate keys on Scatter, they simply serve as a backup for your password.</b>
                </figure>

                <section class="info-box">


                    <cin placeholder="Password" type="password" :text="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                    <cin placeholder="Confirm Password" type="password" :text="confirmPassword" v-on:changed="changed => bind(changed, 'confirmPassword')"></cin>
                    <btn red="true" v-on:clicked="changePassword" text="Change Password"></btn>


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

    export default {
        data () {return {
            password:'',
            confirmPassword:''
        }},
        computed:{
            ...mapState([
                'scatter'
            ])
        },
        mounted(){
        },
        methods: {
            async changePassword(){
                if(!PasswordService.isValidPassword(this.password, this.confirmPassword)) return false;

                const mnemonic = await PasswordService.changePassword(this.password);
                PopupService.push(Popup.mnemonic(mnemonic));
                PopupService.push(Popup.prompt("New Password Set!", "You have set a new password", "asterisk", "Okay"));
                this.password = '';
                this.confirmPassword = '';
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
