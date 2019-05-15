<template>
    <section>
        <PopOutHead v-on:closed="returnResult" />

        <transition name="fade">
            <section v-if="windowMessage" class="popout">

                <AppLogin v-if="popupType === apiActions.LOGIN || popupType === apiActions.LOGIN_ALL"
                          :popup="popup"
                          v-on:returned="returnResult" />

                <Signature v-if="popupType === apiActions.SIGN || popupType === apiActions.SIGN_ARBITRARY"
                           :popup="popup" :pinning="pinning"
                           v-on:returned="returnResult" />

                <GetPublicKey v-if="popupType === apiActions.GET_PUBLIC_KEY"
                              :popup="popup" v-on:returned="returnResult" />

                <TransferRequest v-if="popupType === apiActions.TRANSFER"
                                 :popup="popup" :pinning="pinning"
                                 v-on:returned="returnResult" />

                <UpdateIdentity v-if="popupType === apiActions.UPDATE_IDENTITY"
                                :popup="popup" v-on:returned="returnResult" />

                <LinkApp :popup="popup" v-if="popupType === 'linkApp'" v-on:returned="returnResult" />

            </section>
        </transition>


    </section>
</template>

<script>
    import '../styles/popout.scss';
    import PopOutHead from '../components/popouts/PopOutHead';

    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import Scatter from '../models/Scatter';
    import {remote} from '../util/ElectronHelpers';
    import WindowService from '../services/utility/WindowService'
    import * as ApiActions from '../models/api/ApiActions';
    import {Popup} from "../models/popups/Popup";
    import PasswordService from "../services/secure/PasswordService";
    import Token from "../models/Token";
    import RIDLService from "../services/apis/RIDLService";

    export default {
        data () {return {
            apiActions:ApiActions,
            windowMessage:null,
            pinning:false,
        }},
        components:{
	        PopOutHead,
	        GetPublicKey:() => import('./popouts/GetPublicKey'),
	        TransferRequest:() => import('./popouts/TransferRequest'),
            AppLogin:() => import('./popouts/AppLogin'),
            Signature:() => import('./popouts/Signature'),
            LinkApp:() => import('./popouts/LinkApp'),
            UpdateIdentity:() => import('./popouts/UpdateIdentity'),
        },
        mounted(){
            WindowService.watch('popup', windowMessage => {
                this.windowMessage = windowMessage;

                const scatter = this.windowMessage.data.scatter;

                // Hardware wallets cause slowdowns to initialize
                // which makes popups slow down too.
                scatter.keychain.keypairs.map(x => x.external = null);

                this[Actions.HOLD_SCATTER](Scatter.fromJson(scatter));

                let balances = {};
                Object.keys(this.windowMessage.data.balances).map(key => {
	                balances[key] = this.windowMessage.data.balances[key].map(token => Token.fromJson(token));
                });
	            this[Actions.SET_FULL_BALANCES](balances);

                const needsPIN = [
                    ApiActions.SIGN_ARBITRARY,
                    ApiActions.SIGN,
                    ApiActions.TRANSFER
                ];

                setTimeout(async () => {
	                if(this.scatter.pinForAll && needsPIN.includes(this.popup.data.type)){
	                	this.pinning = true;
		                if(! await PasswordService.verifyPIN()){
		                	this.returnResult(null);
                        }
		                this.pinning = false;
	                }
                })
            });
        },
        computed:{
            ...mapState([
                'scatter',
            ]),
            popup(){ return Popup.fromJson(this.windowMessage.data.popup) },
            appData(){ return this.windowMessage.data.popup.data.props.appData; },
            payload(){ return this.windowMessage.data.popup.data.props.payload },
            popupType(){ return this.windowMessage.data.popup.data.type },
        },
        methods: {
            async returnResult(result){
				await WindowService.sendResult(this.windowMessage, result);

				const window = remote.getCurrentWindow();
				window.close();
				if(!window.closed) window.destroy();
            },
	        async checkAppReputation(){
		        this[Actions.SET_APP_REP](await RIDLService.checkApp(this .appData.applink));
	        },
            ...mapActions([
                Actions.HOLD_SCATTER,
                Actions.SET_FULL_BALANCES,
                Actions.SET_APP_REP,
            ])
        },
        watch:{
        	['windowMessage'](){
        		if(this.windowMessage) this.checkAppReputation();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";



</style>
