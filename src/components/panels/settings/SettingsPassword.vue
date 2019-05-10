<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.PASSWORD.ChangePasswordLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.PASSWORD.ChangePasswordDescription)}}</p>

            <br><br>

            <Input :label="locale(langKeys.SETTINGS.PASSWORD.NewPasswordLabel)"
                 :placeholder="locale(langKeys.SETTINGS.PASSWORD.NewPasswordPlaceholder)"
                 type="password"
                 :text="password"
                 v-on:changed="x => password = x" />

            <Input :label="locale(langKeys.SETTINGS.PASSWORD.ConfirmPasswordLabel)"
                 :placeholder="locale(langKeys.SETTINGS.PASSWORD.ConfirmPasswordPlaceholder)"
                 type="password"
                 :text="confirmPassword"
                 v-on:changed="x => confirmPassword = x" />

            <Button red="true" @click.native="changePassword"
                 :text="locale(langKeys.SETTINGS.PASSWORD.ChangePasswordButton)" />

        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import PasswordService from '../../../services/secure/PasswordService';
    import PopupService from '../../../services/utility/PopupService';
    import {Popup} from '../../../models/popups/Popup';

    export default {
    	props:['mnemonic'],
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

                await PasswordService.changePassword(this.password);
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
    @import "../../../styles/variables";


</style>
