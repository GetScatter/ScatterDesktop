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

    import {isWeb} from "../util/WebOrWrapper";
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from 'scatter-core/store/constants';
    import Scatter from 'scatter-core/models/Scatter';
    const {remote} = isWeb ? {} : require('../util/ElectronHelpers');
    const WindowService = isWeb ? null : require('../services/electron/WindowService').default
    import * as ApiActions from 'scatter-core/models/api/ApiActions';
    import {Popup} from "scatter-core/models/popups/Popup";
    import PasswordService from "scatter-core/services/secure/PasswordService";
    import Token from "scatter-core/models/Token";
    import RIDLService from "scatter-core/services/apis/RIDLService";

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
            }

            if(isWeb) setWindowMessage(window.getData());
            else WindowService.watch('popup', wm => setWindowMessage(wm));
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

            	if(isWeb){
            		w = window;
		            w.respond(result);
		            w.close();
                } else {
		            await WindowService.sendResult(this.windowMessage, result);
		            w = remote.getCurrentWindow();
		            w.close();
                }

				if(!w.closed) w.destroy();
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
