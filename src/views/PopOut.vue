<template>
    <section>
        <section v-if="windowMessage">
            <PopOutHead v-on:closed="returnResult" v-if="(popupType !== apiActions.LOGIN && popupType !== apiActions.LOGIN_ALL)" />

            <section class="popout" :class="{'login':popupType === apiActions.LOGIN || popupType === apiActions.LOGIN_ALL}">

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

        </section>

        <section class="dummy-bg" :class="{'hide':windowMessage}">
            <figure>Scatter</figure>
        </section>
    </section>
</template>

<script>
    import '../styles/popout.scss';
    import PopOutHead from '../components/popouts/PopOutHead';

    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '@walletpack/core/store/constants';
    import Scatter from '@walletpack/core/models/Scatter';
    const {remote} = require('../util/ElectronHelpers');
    const WindowService = require('../services/electron/WindowService').default
    import * as ApiActions from '@walletpack/core/models/api/ApiActions';
    import {Popup} from "../models/popups/Popup";
    import Token from "@walletpack/core/models/Token";
    import RIDLService from "../services/utility/RIDLService";
    import * as UIActions from "../store/ui_actions";
    import PasswordHelpers from "../services/utility/PasswordHelpers";

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
        created(){
        	const setWindowMessage = wm => {
		        this.windowMessage = wm;

		        const scatter = this.windowMessage.data.scatter;

		        // Hardware wallets cause slowdowns to initialize
		        // which makes popups slow down too.
		        scatter.keychain.keypairs.map(x => x.external = null);

		        this[Actions.HOLD_SCATTER](Scatter.fromJson(scatter));

		        let balances = {};
		        Object.keys(this.windowMessage.data.balances).map(key => {
			        balances[key] = this.windowMessage.data.balances[key].map(token => Token.fromJson(token));
		        });

		        const needsPIN = [
			        ApiActions.SIGN_ARBITRARY,
			        ApiActions.SIGN,
			        ApiActions.TRANSFER
		        ];

		        setTimeout(async () => {
			        if(this.scatter.pinForAll && needsPIN.includes(this.popup.data.type)){
				        this.pinning = true;
				        if(! await PasswordHelpers.verifyPIN()){
					        this.returnResult(null);
				        }
				        this.pinning = false;
			        }
		        })
            }

            WindowService.watch('popup', wm => setWindowMessage(wm));
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
            	let w;
	            await WindowService.sendResult(this.windowMessage, result);
	            w = remote.getCurrentWindow();
	            w.close();
				if(!w.closed) w.destroy();
            },
	        async checkAppReputation(){
		        this[UIActions.SET_APP_REP](await RIDLService.checkApp(this.appData.applink));
	        },
            ...mapActions([
                Actions.HOLD_SCATTER,
	            UIActions.SET_APP_REP,
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

    .dummy-bg {
        figure {
            position:fixed;
            top:0;
            left:0;
            right:0;
            z-index:-2;
            height:40px;
            width:100%;
            display:flex;
            align-items: center;
            padding:0 0 0 10px;
            border:1px solid $darkerblue;
            border-bottom:0;
            background:$blue;
            font-family: 'Grand Hotel', sans-serif;
            font-size: 24px;
            color: $white;

            &.hide {
                display:none;
            }
        }
    }


</style>
