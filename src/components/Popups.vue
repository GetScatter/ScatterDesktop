<template>
    <section>

        <section class="fader" :class="{'show':showFader}">

            <section class="pop-ins" v-for="popIn in popIns">
                <section class="fullscreen">
                    <DestroyScatter :popin="popIn" v-if="popIn.data.type === popupTypes.DESTROY_SCATTER" />
                    <ImportBackup :popin="popIn" v-if="popIn.data.type === popupTypes.IMPORT_FULL_BACKUP" />
                    <Terms :popin="popIn" v-if="popIn.data.type === popupTypes.SHOW_TERMS" />
                </section>
            </section>

        </section>


        <section class="snackbar-holder" :class="{'has-snackbar':snackbars.length}">
            <transition-group name="snackbar-transition">
                <Snackbar :popup="popup" v-for="popup in snackbars" :key="popup.id" />
            </transition-group>
        </section>



    </section>
</template>

<script>
    import {RouteNames} from '../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {PopupDisplayTypes, PopupTypes, isFullscreen} from '../models/popups/Popup'

    import Snackbar from './popins/overlay/Snackbar.vue'
    import * as UIActions from "../store/ui_actions";

    export default {
    	components:{
		    Terms:() => import("./popins/fullscreen/Terms"),
		    DestroyScatter:() => import("./popins/fullscreen/DestroyScatter"),
		    ImportBackup:() => import("./popins/fullscreen/ImportBackup"),
		    Snackbar,
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
                    this[UIActions.RELEASE_POPUP](this.popIns[this.popIns.length - 1]);
                }
            },
	        isWide(popIn){
	        	const wides = [PopupTypes.SELECTOR, PopupTypes.UPDATE_AVAILABLE];
	            return wides.includes(popIn.data.type);
            },
            ...mapActions([
	            UIActions.RELEASE_POPUP
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
        height:calc(100vh - 40px);
        width:100%;
        position:fixed;
        top:40px;
        bottom:0;
        left:0;
        right:0;
        display:flex;
        justify-content: center;
        align-items: center;
    }

    .pop-in-over {
        -webkit-app-region: no-drag;

        position:fixed;
        top:40px;
        bottom:0;
        left:0;
        right:0;

        display:flex;
        justify-content: center;
        align-items: center;
        margin:0 50px;
    }

    .fader {

        display: flex;
        justify-content: center;
        align-items: center;

        position:fixed;
        top:40px;
        bottom:0;
        left:0;
        right:0;
        opacity:0;
        visibility: hidden;

        z-index:10001;

        &.show {
            opacity:1;
            visibility: visible;
        }

        .bg {
            position:fixed;
            top:0;
            bottom:0;
            left:0;
            right:0;
            //background:rgba(255,255,255,0.92);
            background: rgba(3, 25, 49, 0.71);
            z-index: -1;
            cursor: pointer;
        }
    }

</style>
