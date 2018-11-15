<template>
    <section>

        <section class="action-box top-pad">
            <label>Change your Password</label>
            Every time you change your password you will get a new Mnemonic ( Seed Phrase ) which is your alternate password for unlocking Scatter.

            <br><br>

            <cin label="New Password"
                 placeholder="Password"
                 type="password"
                 :text="password"
                 v-on:changed="x => password = x" />

            <cin label="Confirm new Password"
                 placeholder="Confirm Password"
                 type="password"
                 :text="confirmPassword"
                 v-on:changed="x => confirmPassword = x" />

            <btn red="true" v-on:clicked="changePassword" text="Change Password" />

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
    @import "../../../variables";


</style>
