<template>
    <section>

        <section class="fader" :class="{'show':showFader}">

            <section class="pop-ins" v-for="popIn in popIns" style="position:absolute;">
                <section class="fullscreen" v-if="isFullscreen(popIn)">
                    <ConfirmPassword :popin="popIn" v-if="popIn.data.type === popupTypes.VERIFY_PASSWORD" />
                    <EosChangePermissions :popin="popIn" v-if="popIn.data.type === popupTypes.EOS_CHANGE_PERMISSIONS" />
                    <EosProxyVotes :popin="popIn" v-if="popIn.data.type === popupTypes.EOS_PROXY_VOTES" />
                    <EosModerateRam :popin="popIn" v-if="popIn.data.type === popupTypes.EOS_MODERATE_RAM" />
                    <EosModerateCpuNet :popin="popIn" v-if="popIn.data.type === popupTypes.EOS_MODERATE_CPU_NET" />
                    <EosCreateAccount :popin="popIn" v-if="popIn.data.type === popupTypes.EOS_CREATE_ACCOUNT" />
                    <UnlinkAccount :popin="popIn" v-if="popIn.data.type === popupTypes.UNLINK_ACCOUNT" />
                    <UnlinkBlockchain :popin="popIn" v-if="popIn.data.type === popupTypes.UNLINK_BLOCKCHAIN" />
                    <Mnemonic :popin="popIn" v-if="popIn.data.type === popupTypes.MNEMONIC" />
                    <RemoveKeypair :popin="popIn" v-if="popIn.data.type === popupTypes.REMOVE_KEYPAIR" />
                    <CheckHardware :popin="popIn" v-if="popIn.data.type === popupTypes.CHECK_HARDWARE" />
                    <RemoveLocation :popin="popIn" v-if="popIn.data.type === popupTypes.REMOVE_LOCATION" />
                    <DestroyScatter :popin="popIn" v-if="popIn.data.type === popupTypes.DESTROY_SCATTER" />
                    <EnableWhitelist :popin="popIn" v-if="popIn.data.type === popupTypes.ENABLE_WHITELIST" />
                    <AccountSelector :popin="popIn" v-if="popIn.data.type === popupTypes.SELECT_ACCOUNT" />
                    <ConfirmExchange :popin="popIn" v-if="popIn.data.type === popupTypes.CONFIRM_EXCHANGE" />
                    <ConfirmTransfer :popin="popIn" v-if="popIn.data.type === popupTypes.CONFIRM_TRANSFER" />
                    <Exchange :popin="popIn" v-if="popIn.data.type === popupTypes.EXCHANGE" />
                    <Stabilize :popin="popIn" v-if="popIn.data.type === popupTypes.STABILIZE" />
                    <History :popin="popIn" v-if="popIn.data.type === popupTypes.HISTORY" />
                    <DisplayToken :popin="popIn" v-if="popIn.data.type === popupTypes.DISPLAY_TOKEN" />
                </section>
                <section class="overlay" :class="{'wide':isWide(popIn)}" v-else>
                    <figure class="bg" @click="clickedFader"></figure>
                    <section class="pop-in">
                        <RemoveApp :popin="popIn" v-if="popIn.data.type === popupTypes.REMOVE_APP" />
                        <EnterPIN :popin="popIn" v-if="popIn.data.type === popupTypes.ENTER_PIN" />
                        <Prompt :popin="popIn" v-if="popIn.data.type === popupTypes.PROMPT" />
                        <Selector :popin="popIn" v-if="popIn.data.type === popupTypes.SELECTOR" />
                        <TransactionSuccess :popin="popIn" v-if="popIn.data.type === popupTypes.TX_SUCCESS" />
                        <UpdateAvailable :popin="popIn" v-if="popIn.data.type === popupTypes.UPDATE_AVAILABLE" />
                    </section>
                </section>
            </section>

        </section>


        <section class="snackbar-holder" :class="{'has-snackbar':snackbars.length}">
            <transition-group name="snackbar-transition">
                <Snackbar :popup="popup" v-for="popup in snackbars" :key="popup.id" />
            </transition-group>
        </section>

        <!--<section class="snackbar-holder">-->
            <!--<snackbar :popup="{data:{props:{message:'This is just some message whatever', icon:'trash'}}}"></snackbar>-->
        <!--</section>-->



    </section>
</template>

<script>
    import {RouteNames} from '../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {PopupDisplayTypes, PopupTypes, isFullscreen} from '../models/popups/Popup'

    import EnterPIN from './popins/overlay/EnterPIN.vue'
    import Snackbar from './popins/overlay/Snackbar.vue'
    import TransactionSuccess from './popins/overlay/TransactionSuccess.vue'
    import Prompt from './popins/overlay/Prompt.vue'

    import EosProxyVotes from './popins/fullscreen/EosProxyVotes'
    import EosChangePermissions from './popins/fullscreen/EosChangePermissions'
    import EosModerateRam from './popins/fullscreen/EosModerateRam'
    import EosModerateCpuNet from './popins/fullscreen/EosModerateCpuNet'
    import ConfirmPassword from '../components/popins/fullscreen/ConfirmPassword'
    import UnlinkAccount from '../components/popins/fullscreen/UnlinkAccount'
    import UnlinkBlockchain from '../components/popins/fullscreen/UnlinkBlockchain'
    import Mnemonic from '../components/popins/fullscreen/Mnemonic'
    import EosCreateAccount from "./popins/fullscreen/EosCreateAccount";
    import RemoveKeypair from "./popins/fullscreen/RemoveKeypair";
    import CheckHardware from "./popins/fullscreen/CheckHardware";
    import RemoveLocation from "./popins/fullscreen/RemoveLocation";
    import DestroyScatter from "./popins/fullscreen/DestroyScatter";
    import EnableWhitelist from "./popins/fullscreen/EnableWhitelist";
    import AccountSelector from "./popins/fullscreen/AccountSelector";
    import ConfirmExchange from "./popins/fullscreen/ConfirmExchange";
    import ConfirmTransfer from "./popins/fullscreen/ConfirmTransfer";
    import DisplayToken from "./popins/fullscreen/DisplayToken";
    import Exchange from "./popins/fullscreen/Exchange";
    import Stabilize from "./popins/fullscreen/Stabilize";
    import History from "./popins/fullscreen/History";
    import RemoveApp from "./popins/overlay/RemoveApp";
    import Selector from "./popins/overlay/Selector";
    import UpdateAvailable from "./popins/overlay/UpdateAvailable";

    export default {
    	components:{
		    UpdateAvailable,
		    Selector,
		    RemoveApp,
    		EnterPIN,
		    Snackbar,
		    TransactionSuccess,
		    Prompt,

            // FULLSCREEN
		    DestroyScatter,
		    RemoveLocation,
		    ConfirmPassword,
		    EosChangePermissions,
		    EosProxyVotes,
		    EosModerateRam,
		    EosModerateCpuNet,
		    EosCreateAccount,
		    UnlinkAccount,
		    UnlinkBlockchain,
		    Mnemonic,
		    RemoveKeypair,
		    CheckHardware,
		    EnableWhitelist,
		    AccountSelector,
		    ConfirmExchange,
		    ConfirmTransfer,
		    DisplayToken,
		    Exchange,
		    Stabilize,
		    History,
        },
        data(){ return {
            popupTypes:PopupTypes,
            popupDisplayTypes:PopupDisplayTypes,
        }},
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([
                'popIns',
                'nextPopIn',
                'snackbars',
            ]),
            showFader(){
                return this.nextPopIn && this.nextPopIn.displayType === PopupDisplayTypes.POP_IN
            }
        },
        methods:{
	        isFullscreen,
            clickedFader(){
                if(this.nextPopIn) {
                	if(this.nextPopIn.hasOwnProperty('data') && typeof this.nextPopIn.data.callback === 'function') this.nextPopIn.data.callback(null);
                    this[Actions.RELEASE_POPUP](this.popIns[this.popIns.length - 1]);
                }
            },
	        isWide(popIn){
	        	const wides = [PopupTypes.SELECTOR, PopupTypes.UPDATE_AVAILABLE];
	            return wides.includes(popIn.data.type);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .snackbar-holder {
        position:fixed;
        bottom:0;
        left:0;
        right:0;
        text-align:center;
        z-index:10001;

        &.has-snackbar {
            padding-bottom:40px;
        }
    }

    .fullscreen {
        background:#fff;
        height:calc(100vh - 80px);
        width:100%;
        position:fixed;
        top:80px;
        bottom:0;
        left:0;
        right:0;
    }

    .pop-in {
        -webkit-app-region: no-drag;
        background:#fff;
        box-shadow:0 10px 50px rgba(0,0,0,0.1), 0 0 250px rgba(0,0,0,0.1);
        max-width:100%;
        margin:0 40px;
        position: relative;
        overflow:hidden;
    }

    .fader {

        display: flex;
        justify-content: center;
        align-items: center;

        position:fixed;
        top:80px;
        bottom:0;
        left:0;
        right:0;
        //background:$light-grey;
        opacity:0;
        visibility: hidden;
        transition: all 0.05s ease;
        transition-property: opacity, visibility;

        z-index:10000;

        &.show {
            opacity:1;
            visibility: visible;
        }

        .bg {
            cursor: pointer;
            position:fixed;
            top:0;
            bottom:0;
            left:0;
            right:0;
            //background:rgba(255,255,255,0.92);
            background:rgba(0,0,0,0.7);
            z-index: 0;
        }
    }


    $speed:0.12s;
    .snackbar-transition-leave-active,
    .snackbar-transition-enter-active {
        transition: $speed ease-in-out;
    }

    .snackbar-transition-enter {
        opacity:0;
        transform: translate(0, 20%);
    }

    .snackbar-transition-leave-to {
        opacity:0;
        transform: translate(0, 100%);
    }
</style>
