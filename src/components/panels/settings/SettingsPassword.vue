<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.PASSWORD.ChangePasswordLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.PASSWORD.ChangePasswordDescription)}}</p>

            <br><br>

            <cin :label="locale(langKeys.SETTINGS.PASSWORD.NewPasswordLabel)"
                 :placeholder="locale(langKeys.SETTINGS.PASSWORD.NewPasswordPlaceholder)"
                 type="password"
                 :text="password"
                 v-on:changed="x => password = x" />

            <cin :label="locale(langKeys.SETTINGS.PASSWORD.ConfirmPasswordLabel)"
                 :placeholder="locale(langKeys.SETTINGS.PASSWORD.ConfirmPasswordPlaceholder)"
                 type="password"
                 :text="confirmPassword"
                 v-on:changed="x => confirmPassword = x" />

            <btn red="true" v-on:clicked="changePassword"
                 :text="locale(langKeys.SETTINGS.PASSWORD.ChangePasswordButton)" />

        </section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.PASSWORD.ViewMnemonicLabel)}}</label>
            <p>{{locale(langKeys.SETTINGS.PASSWORD.ViewMnemonicDescription)}}</p>

            <btn v-on:clicked="viewMnemonic" :text="locale(langKeys.SETTINGS.PASSWORD.ViewMnemonicButton)" />

        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import PasswordService from '../../../services/PasswordService';
    import PopupService from '../../../services/PopupService';
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

                const mnemonic = await PasswordService.changePassword(this.password);
                this.$emit('mnemonic', mnemonic);
                PopupService.push(Popup.mnemonic(mnemonic));
                PopupService.push(Popup.snackbar(this.locale(this.langKeys.SETTINGS.PASSWORD.ChangedPasswordSnackbar), "lock"));
                this.password = '';
                this.confirmPassword = '';
            },
	        viewMnemonic(){
                PopupService.push(Popup.mnemonic(this.mnemonic));
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
