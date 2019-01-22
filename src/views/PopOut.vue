<template>
    <section>

        <section v-if="windowMessage" class="popout">

            <AppLogin v-if="popupType === apiActions.GET_OR_REQUEST_IDENTITY"
                      :popup="popup"
                      v-on:expanded="expandOrContract" :expanded="expanded"
                      v-on:returned="returnResult" />

            <Signature v-if="popupType === apiActions.REQUEST_SIGNATURE || popupType === apiActions.REQUEST_ARBITRARY_SIGNATURE"
                      :popup="popup" :pinning="pinning"
                      v-on:expanded="expandOrContract" :expanded="expanded"
                      v-on:returned="returnResult" />

            <GetPublicKey v-if="popupType === apiActions.GET_PUBLIC_KEY"
                          :popup="popup" v-on:returned="returnResult" />

            <TransferRequest v-if="popupType === apiActions.REQUEST_TRANSFER"
                             :popup="popup" :pinning="pinning"
                             v-on:returned="returnResult" />

            <UpdateIdentity v-if="popupType === apiActions.UPDATE_IDENTITY"
                             :popup="popup" v-on:returned="returnResult" />

            <LinkApp :popup="popup" v-if="popupType === 'linkApp'" v-on:returned="returnResult" />

        </section>


    </section>
</template>

<script>
    import '../styles/popout.scss';

    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import Scatter from '../models/Scatter';
    import {remote} from '../util/ElectronHelpers';
    import WindowService from '../services/WindowService'
    import * as ApiActions from '../models/api/ApiActions';
    import {Popup} from "../models/popups/Popup";
    import PasswordService from "../services/PasswordService";

    export default {
        data () {return {
            apiActions:ApiActions,
            windowMessage:null,
	        expanded:false,
            pinning:false,
        }},
        components:{
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
                scatter.keychain.keypairs.map(x => {
                    if(x.external) x.external = null;
                });

                this[Actions.HOLD_SCATTER](Scatter.fromJson(scatter));

	            this[Actions.SET_FULL_BALANCES](this.windowMessage.data.balances);

                const needsPIN = [
                    ApiActions.REQUEST_ARBITRARY_SIGNATURE,
                    ApiActions.REQUEST_SIGNATURE,
                    ApiActions.REQUEST_TRANSFER
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

	        expandOrContract(deltaWidth = 300, forced = null, subtracted = null){
            	if(forced !== null) this.expanded = forced;
		        else this.expanded = !this.expanded;

		        const {width, height} = this.popup.dimensions();
		        const delta = (this.expanded ? deltaWidth : 0);
		        WindowService.changeWindowSize(height, subtracted ? width-delta : width+delta);
	        },
            ...mapActions([
                Actions.HOLD_SCATTER,
                Actions.SET_FULL_BALANCES
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";



</style>
