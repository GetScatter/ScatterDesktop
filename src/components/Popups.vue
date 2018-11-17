<template>
    <section>

        <section class="fader" :class="{'show':showFader}">

            <section v-for="popIn in popIns" style="position:absolute;">
                <figure class="bg" @click="clickedFader"></figure>
                <section class="pop-in">
                    <prompt :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.PROMPT"></prompt>
                    <text-prompt :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.TEXT_PROMPT" :key="popIn.id"></text-prompt>
                    <selector :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.SELECTOR"></selector>
                    <mnemonic :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.MNEMONIC"></mnemonic>
                    <tx-success v-if="popIn.data.type === popupTypes.TX_SUCCESS"></tx-success>
                    <buy-sell-ram :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.BUY_SELL_RAM"></buy-sell-ram>
                    <delegate-resources :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.DELEGATE_RESOURCES"></delegate-resources>
                    <link-or-create-account :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.LINK_OR_CREATE_ACCOUNT"></link-or-create-account>

                    <vault :next-pop-in="popIn" v-if="popIn.data.type === popupTypes.VAULT"></vault>
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
    import {PopupDisplayTypes, PopupTypes} from '../models/popups/Popup'

    import Snackbar from '../components/popups/Snackbar.vue'
    import Mnemonic from '../components/popups/Mnemonic.vue'
    import TransactionSuccess from '../components/popups/TransactionSuccess.vue'
    import Prompt from '../components/popups/Prompt.vue'
    import Selector from '../components/popups/Selector.vue'
    import TextPrompt from '../components/popups/TextPrompt.vue'
    import DelegateResources from '../components/popups/DelegateResources.vue'
    import BuySellRAM from '../components/popups/BuySellRAM.vue'
    import PopInHead from '../components/popups/fragments/PopInHead.vue'

    export default {
    	components:{
		    Snackbar,
		    Mnemonic,
		    TransactionSuccess,
		    Prompt,
		    Selector,
		    TextPrompt,
		    DelegateResources,
		    BuySellRAM,
		    PopInHead,
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
            clickedFader(){
                if(this.nextPopIn) {
                    this[Actions.RELEASE_POPUP](this.popIns[this.popIns.length - 1]);
                    if(this.$tours['scatter']) this.$tours['scatter'].previousStep();
                }
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .snackbar-holder {
        position:fixed;
        bottom:0;
        left:0;
        right:0;
        text-align:center;
        z-index:10001;

        &.has-snackbar {
            padding-bottom:20px;
        }
    }

    .pop-in {
        -webkit-app-region: no-drag;
        background:#fff;
        border-radius:2px;
        box-shadow:0 10px 50px rgba(0,0,0,0.1), 0 0 250px rgba(0,0,0,0.1);
        max-width:100%;
        margin:0 40px;
        position: relative;
    }

    .fader {

        display: flex;
        justify-content: center;
        align-items: center;

        position:fixed;
        top:0;
        bottom:0;
        left:0;
        right:0;
        //background:$light-grey;
        opacity:0;
        visibility: hidden;
        transition: all 0.1s ease;
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
            background:rgba(255,255,255,0.92);
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
