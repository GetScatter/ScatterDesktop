<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.PIN.Label)}}</label>
            <p>
                {{locale(langKeys.SETTINGS.PIN.Description)}}<br>
                <b class="red">{{locale(langKeys.SETTINGS.PIN.DescriptionRed)}}</b>
            </p>

            <br><br>

            <cin style="margin-bottom:0;" big="1"
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
                    <section class="switch" @click="togglePinForAll()">
                        <figure class="dot" :class="{'disabled':!scatter.pinForAll}"></figure>
                    </section>
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

    import PasswordService from '../../../services/PasswordService';
    import PopupService from '../../../services/PopupService';
    import {Popup} from '../../../models/popups/Popup';

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
