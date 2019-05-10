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

        <section class="action-box">
            <label>{{locale(langKeys.SETTINGS.PIN.Label)}}</label>
            <p>
                {{locale(langKeys.SETTINGS.PIN.Description)}}<br>
                <b class="red">{{locale(langKeys.SETTINGS.PIN.DescriptionRed)}}</b>
            </p>

            <br><br>

            <Input style="margin-bottom:0;" big="1"
                   :placeholder="locale(langKeys.SETTINGS.PIN.Placeholder)"
                   type="password"
                   :text="pin"
                   :dynamic-button="pin.length ? 'icon-cancel' : ''"
                   v-on:dynamic="pin = ''"
                   v-on:changed="x => pin = x" />

            <section>
                <br>
                <br>
                <section class="split-inputs">
                    <Switcher :state="scatter.pinForAll" @click.native="togglePinForAll" />
                    <section class="details">
                        <figure class="title">{{locale(langKeys.SETTINGS.PIN.PinForAllTitle)}}</figure>
                        <p>{{locale(langKeys.SETTINGS.PIN.PinForAllDescription)}}</p>
                    </section>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import PasswordService from '../../../services/secure/PasswordService';
    import PopupService from '../../../services/utility/PopupService';
    import {Popup} from '../../../models/popups/Popup';

    let saveTimeout;
    export default {
    	props:['mnemonic'],
        data () {return {
            password:'',
            confirmPassword:'',
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
            async changePassword(){
                if(!PasswordService.isValidPassword(this.password, this.confirmPassword)) return false;

                await PasswordService.changePassword(this.password);
                this.password = '';
                this.confirmPassword = '';
            },
	        async changePin(){
		        clearTimeout(saveTimeout);
		        saveTimeout = setTimeout(async () => {
			        await PasswordService.setPIN(this.pin, false);
			        PopupService.push(Popup.snackbar(
				        this.locale(this.langKeys.SETTINGS.PIN.SavedSnackbar), 'check'
			        ))
		        }, 500);
	        },
	        togglePinForAll(){
		        const scatter = this.scatter.clone();
		        scatter.pinForAll = !scatter.pinForAll;
		        this[Actions.SET_SCATTER](scatter);
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
    @import "../../../styles/variables";


</style>
